import { ScheduleEntry, ScheduleData } from '@/context/AppStateContext';
// Import date-fns and date-fns-tz functions
import { format, parse, setHours, setMinutes, setSeconds, startOfDay, parseISO } from 'date-fns';
// Use toZonedTime for reading, formatInTimeZone for writing
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'; 

const ENDPOINT_STORAGE_KEY = 'openretic_endpoint';
const DEFAULT_API_BASE_URL = 'http://openRetic.local';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ENDPOINT_STORAGE_KEY) || DEFAULT_API_BASE_URL;
  }
  return DEFAULT_API_BASE_URL; // Fallback for non-browser environments (e.g., SSR, testing)
}

// Helper function for making API requests (can be expanded)
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    // Add logging for debugging
    console.log(`API Request: ${options.method || 'GET'} ${url}`, options.body ? `Body: ${options.body}` : '');

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers needed, e.g., Authorization
            },
            ...options, // Spread the rest of the options (method, body, etc.)
        });

        if (!response.ok) {
            // Attempt to read error body
            let errorBody = 'No error body available';
            try {
                errorBody = await response.text();
            } catch (e) { /* Ignore error reading body */ }
            console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
             const data = await response.json();
             console.log(`API Response Success: ${options.method || 'GET'} ${url}`, data);
             return data as T;
        } else {
            // Handle non-JSON responses (e.g., simple OK for POST)
            console.log(`API Response Success (No JSON Body): ${options.method || 'GET'} ${url}`);
            // For non-JSON, we might return a success indicator or the response itself
            // Depending on what the caller expects. Here, returning 'true' as a success indicator.
            return true as unknown as T; // Adjust return type/value as needed
        }

    } catch (error) {
        console.error('API Request Failed:', error);
        throw error; // Re-throw the error for the caller to handle
    }
}


// Define the expected structure of the response from /getSchedule
type ApiScheduleResponse = {
    schedule: ScheduleEntry[];
    system: any; // Define more specifically if needed
};

// Function to fetch all schedule entries
// Function to fetch all schedule entries
export async function fetchSchedule(): Promise<ScheduleEntry[]> {
    // Get schedule object from ESP32
    // Expect the API to return an object like { schedule: [...], system: {...} }
    const responseData = await apiRequest<ApiScheduleResponse>('/getSchedule'); 

    // Extract the schedule array from the response
    const rawScheduleEntries = responseData.schedule; 
    if (!Array.isArray(rawScheduleEntries)) {
        console.error("API response for /getSchedule did not contain a 'schedule' array:", responseData);
        return []; // Return empty array or throw error
    }

    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[fetchSchedule] Detected local timezone:', localTimeZone);

    return rawScheduleEntries.map(entry => {
      try {
        // Calculate localStartTimeString from entry.start (UTC time)
        const [apiHours, apiMinutes] = entry.start.split(':').map(Number);
        // Use a fixed reference date for UTC to create a Date object, then convert to local time zone.
        // This helps in consistently getting the time part converted correctly.
        const referenceUtcDateTime = new Date(Date.UTC(2000, 0, 2, apiHours, apiMinutes)); // Date.UTC parameters: year, month (0-indexed), day, hours, minutes
        const localDateTimeForStartTime = toZonedTime(referenceUtcDateTime, localTimeZone);
        const localStartTimeString = format(localDateTimeForStartTime, 'HH:mm');

        console.log(`[fetchSchedule] ID ${entry.id}: API start ${entry.start} UTC -> Local start ${localStartTimeString}`);

        let finalDate = entry.date; // For 'weekday' events, date is usually undefined or not primary.
                                  // For 'once' events, this will be updated to the local date.

        if (entry.type === 'once' && entry.date) {
            // For 'once' events, convert the specific API date and UTC time to the user's local date and time.
            const onceUtcDateTime = parseISO(`${entry.date}T${entry.start}:00Z`); // Ensure Z for UTC parsing
            const onceLocalDateTime = toZonedTime(onceUtcDateTime, localTimeZone);
            finalDate = format(onceLocalDateTime, 'yyyy-MM-dd'); // This is the local date
            // localStartTimeString is already correctly calculated for the time part.
            console.log(`[fetchSchedule] ID ${entry.id} (once): API date ${entry.date} & time ${entry.start} UTC -> Local date ${finalDate} & time ${localStartTimeString}`);
        }
        
        const durationInMinutes = Math.round(entry.duration / 60);

        // For 'weekday' events, entry.days is passed through from the API.
        // For 'once' events, entry.days is typically undefined or not used by FullCalendar if a specific start/end date is given.
        return {
          ...entry, // This includes original entry.days
          start: localStartTimeString, // Overwrites entry.start with local time string
          date: finalDate, // Overwrites entry.date with local date for 'once' events; remains original/undefined for others
          duration: durationInMinutes, // Duration converted to minutes
        };
      } catch (error) {
        console.error(`[fetchSchedule] Error converting schedule entry ID ${entry.id}:`, entry, error);
        // Return entry with duration converted, but other fields as original if an error occurs
        return { ...entry, duration: Math.round(entry.duration / 60) }; 
      }
    });
}

// Function to test API connection
export async function testApiConnection(): Promise<boolean> {
    try {
        // Use a simple GET request, e.g., fetching the schedule, as a health check.
        // The actual data isn't used here, just the success of the request.
        await apiRequest<ApiScheduleResponse>('/getSchedule');
        return true; // Connection successful
    } catch (error) {
        console.error('API connection test failed:', error);
        return false; // Connection failed
    }
}

// --- Timezone Conversion Helper --- 

// Helper function to convert local time string (HH:mm) to UTC HH:mm string
// before sending to the backend.
const convertScheduleToUTC = (schedule: ScheduleEntry): ScheduleEntry => {
    // Ensure start time is defined
    if (!schedule.start) {
        console.error('Schedule start time is undefined:', schedule);
        return schedule; 
    }
    try {
        // Parse the HH:mm time string
        const [hours, minutes] = schedule.start.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
             throw new Error(`Invalid start time format: ${schedule.start}`);
        }

        // Create a Date object representing today with the parsed time in the local timezone
        const localDate = setSeconds(setMinutes(setHours(startOfDay(new Date()), hours), minutes), 0);

        // Format the local Date object directly into a UTC HH:mm string using tzFormat
        const utcStartString = formatInTimeZone(localDate, 'UTC', 'HH:mm');

        // console.log(`Converting local time ${schedule.start} (${localDate.toISOString()}) to UTC HH:mm: ${utcStartString}`);

        return {
            ...schedule,
            start: utcStartString, // Store time as HH:mm in UTC
        };
    } catch (error) {
        console.error(`Error converting schedule time to UTC for entry:`, schedule, error);
        // Return the entry unmodified if conversion fails
        return schedule; 
    }
}; 

/**
 * Saves the entire schedule array to the ESP32.
 * Converts all local start times to UTC HH:mm before sending.
 * @param fullData - The complete ScheduleData object with local times.
 * @returns Promise<void> or Promise<ScheduleEntry[]> if the backend echoes the saved schedule.
 */
export async function saveFullSchedule(fullData: ScheduleData): Promise<void> {
    // Ensure getApiBaseUrl() is called within functions that need it, 
    // so it's fresh if the user changes it on the settings page.
    // The apiRequest function already does this.
    console.log('Preparing to save full schedule data:', fullData);
    
    // Extract schedule entries for processing
    const scheduleEntries = fullData.schedule;

    // Convert local start times back to UTC HH:mm strings and duration back to seconds
    const scheduleForApi = scheduleEntries.map(entry => {
        try {
            let apiDate = entry.date; // Default to original date, will be updated for 'once' events
            let apiStartTime = entry.start; // Default to original start time

            if (entry.type === 'once' && entry.date && entry.start) {
                // For 'once' events, entry.date is local date, entry.start is local time.
                // Combine them into a single local datetime object, then convert to UTC date and UTC time.
                const localEventDateTime = parse(`${entry.date} ${entry.start}`, 'yyyy-MM-dd HH:mm', new Date());
                
                apiDate = formatInTimeZone(localEventDateTime, 'UTC', 'yyyy-MM-dd');
                apiStartTime = formatInTimeZone(localEventDateTime, 'UTC', 'HH:mm');
                
                // console.log(`[saveFullSchedule] Once Event (ID ${entry.id}): Local ${entry.date} ${entry.start} -> UTC Date: ${apiDate}, UTC Time: ${apiStartTime}`);
            } else if (entry.start) {
                // For other event types (weekday, daytype), entry.start is local time of day.
                // This is the original logic for recurring events.
                const [localHours, localMinutes] = entry.start.split(':').map(Number);
                const baseDate = startOfDay(new Date()); // Use today as reference for time-only conversion
                const localTimeReference = new Date(
                    baseDate.getFullYear(),
                    baseDate.getMonth(),
                    baseDate.getDate(),
                    localHours,
                    localMinutes,
                    0
                );
                apiStartTime = formatInTimeZone(localTimeReference, 'UTC', 'HH:mm');
                // apiDate remains entry.date (original) for recurring events
                // console.log(`[saveFullSchedule] Recurring Event (ID ${entry.id}): Local time ${entry.start} -> UTC time ${apiStartTime}`);
            } else {
                // console.warn(`[saveFullSchedule] Entry (ID ${entry.id}, Type ${entry.type}) has no start time, cannot convert to UTC. Original start: ${entry.start}`);
                // apiStartTime remains entry.start (which could be undefined/null)
                // apiDate remains entry.date (original)
            }

            return {
                ...entry,
                date: apiDate, // Use the UTC-converted date for 'once' events, original for others
                start: apiStartTime, // Use UTC HH:mm string for all converted times
                duration: entry.duration * 60 // Convert minutes to seconds for API
            };
        } catch (error) {
            console.error(`Error converting schedule time to UTC for saving entry:`, entry, error);
            // Decide how to handle errors: skip entry, throw error, send original?
            // For now, sending original might be risky, let's throw
            throw new Error(`Failed to process schedule entry for API: ${JSON.stringify(entry)}`); 
        }
    });

    // Construct the full payload including the system object
    const payload = {
        schedule: scheduleForApi, // Use the processed schedule array
        system: fullData.system   // Include the original system object
    };

    // Post the full payload object to the ESP32
    console.log("Saving full payload to API:", payload);
    await apiRequest<void>('/postSchedule', { 
        method: 'POST',
        body: JSON.stringify(payload),
    });

    console.log("Full schedule payload successfully saved.");
}

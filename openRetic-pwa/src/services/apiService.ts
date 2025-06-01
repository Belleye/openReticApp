import { ScheduleEntry, ScheduleData } from '@/context/AppStateContext';
// Import date-fns and date-fns-tz functions
import { format, parse, setHours, setMinutes, setSeconds, startOfDay } from 'date-fns';
// Use toZonedTime for reading, formatInTimeZone for writing
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'; 

// TODO: Determine the base URL/IP of the ESP32
// This might come from context, configuration, or discovery
const API_BASE_URL = 'http://openRetic.local'; // Placeholder

// Helper function for making API requests (can be expanded)
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
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

    // Get the user's local timezone
    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Local timezone:', localTimeZone);
    // Process each entry: convert time zones and duration unit
    return rawScheduleEntries.map(entry => {
      try {
        // Convert UTC start time string from ESP32 to local Date object
        const utcDate = toZonedTime(`${entry.date || format(new Date(), 'yyyy-MM-dd')}T${entry.start}:00`, 'UTC');
        console.log('UTC Date:', utcDate);
        // Convert UTC Date object to local Date object
        const localDate = toZonedTime(utcDate, localTimeZone);
        console.log('Local Date:', localDate);
        // Format the local Date object back to HH:mm string
        // Removed { timeZone: localTimeZone } option to fix lint error
        // The localDate object is already in the correct zone.
        const localStartTimeString = format(localDate, 'HH:mm');

        // Convert duration from seconds (API) to minutes (PWA state)
        const durationInMinutes = Math.round(entry.duration / 60); // Or Math.floor/ceil as needed

        // Return the entry with local time string and convert duration from seconds (API) to minutes (UI)
        return {
          ...entry,
          start: localStartTimeString,
          duration: Math.round(entry.duration / 60), // Convert seconds to minutes for UI
          date: entry.date ? format(localDate, 'yyyy-MM-dd') : undefined // Ensure date reflects local day if needed
        };
      } catch (error) {
        console.error(`Error converting fetched schedule time to local for entry:`, entry, error);
        // Return the entry unmodified if conversion fails
        return entry; 
      }
    });

    console.log('Fetched and converted schedule entries:', rawScheduleEntries);
    return rawScheduleEntries;
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
    console.log('Preparing to save full schedule data:', fullData);
    
    // Extract schedule entries for processing
    const scheduleEntries = fullData.schedule;

    // Convert local start times back to UTC HH:mm strings and duration back to seconds
    const scheduleForApi = scheduleEntries.map(entry => {
        try {
            // Create a Date object representing the time in the local timezone
            const [localHours, localMinutes] = entry.start.split(':').map(Number);
            const baseDate = startOfDay(new Date()); // Use today as reference
            const localDate = new Date( // This Date object represents local time
                baseDate.getFullYear(),
                baseDate.getMonth(),
                baseDate.getDate(),
                localHours,
                localMinutes,
                0
            );

            // Format this local time point directly into the UTC 'HH:mm' string
            // formatInTimeZone(date, outputTimeZone, formatString)
            const utcStartTimeString = formatInTimeZone(localDate, 'UTC', 'HH:mm');

            // Convert duration from minutes (UI) to seconds (API)
            return {
                ...entry,
                start: utcStartTimeString, // Use UTC HH:mm string
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

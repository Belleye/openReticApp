$body = @"
{
  "schedule": [
    {
      "zone": 3,
      "type": "once",
      "date": "2025-05-29",
      "start": "05:30",
      "duration": 300
    },
    {
      "zone": 7,
      "type": "weekday",
      "start": "22:01",
      "duration": 900,
      "days": [
        "Sun"
      ],
      "id": "1745901728382"
    },
    {
      "zone": 1,
      "type": "weekday",
      "start": "06:00",
      "duration": 0,
      "days": [
        "Mon"
      ],
      "id": "1748749272738"
    },
    {
      "zone": 1,
      "type": "weekday",
      "start": "22:00",
      "duration": 900,
      "days": [
        "Fri"
      ],
      "id": "1748749580899"
    },
    {
      "zone": 1,
      "type": "weekday",
      "start": "06:00",
      "duration": 900,
      "days": [
        "Thu"
      ],
      "id": "1748749937106"
    }
  ],
  "system": {
    "snooze_until": "2025-04-13T10:09:28Z",
    "last_updated": "2025-04-12T10:09:28Z",
    "zones": [
      {
        "id": 1,
        "name": "Front Lawn",
        "active": false,
        "manual_until": null,
        "color": "#3B82F6"
      },
      {
        "id": 2,
        "name": "Back Yard",
        "active": false,
        "manual_until": null,
        "color": "#10B981"
      },
      {
        "id": 3,
        "name": "Garden",
        "active": false,
        "manual_until": null,
        "color": "#F59E0B"
      },
      {
        "id": 4,
        "name": "Side Yard",
        "active": false,
        "manual_until": null,
        "color": "#8B5CF6"
      },
      {
        "id": 5,
        "name": "Flower Beds",
        "active": false,
        "manual_until": null,
        "color": "#EC4899"
      },
      {
        "id": 6,
        "name": "Vegetable Garden",
        "active": false,
        "manual_until": null,
        "color": "#06B6D4"
      },
      {
        "id": 7,
        "name": "Patio Plants",
        "active": false,
        "manual_until": null,
        "color": "#EF4444"
      }
    ]
  }
}
"@

Invoke-RestMethod -Uri "http://openRetic.local/postSchedule" -Method Post -Body $body -ContentType "application/json"
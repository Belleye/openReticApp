$body = @"
{
  "schedule": [
    {
      "zone": 1,
      "type": "weekday",
      "start": "21:00",
      "duration": 3600,
      "days": [
        "Sun"
      ],
      "id": "1748749937106"
    },
    {
      "zone": 2,
      "type": "weekday",
      "start": "22:00",
      "duration": 3600,
      "days": [
        "Sun"
      ],
      "id": "1748752870977"
    },
    {
      "zone": 3,
      "type": "weekday",
      "start": "23:00",
      "duration": 3600,
      "days": [
        "Sun"
      ],
      "id": "1748752899963"
    },
    {
      "zone": 4,
      "type": "weekday",
      "start": "00:00",
      "duration": 3600,
      "days": [
        "Sun"
      ],
      "id": "1748752928980"
    },
    {
      "zone": 7,
      "type": "weekday",
      "start": "01:00",
      "duration": 3600,
      "days": [
        "Sun"
      ],
      "id": "1748753196336"
    },
    {
      "zone": 5,
      "type": "weekday",
      "start": "02:00",
      "duration": 3600,
      "days": [
        "Sun"
      ],
      "id": "1748753518305"
    },
    {
      "zone": 6,
      "type": "weekday",
      "start": "03:00",
      "duration": 3600,
      "days": [
        "Sun"
      ],
      "id": "1748753543828"
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
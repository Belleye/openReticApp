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
    },
    {
      "zone": 4,
      "type": "daytype",
      "start": "05:00",
      "duration": 900,
      "pattern": "odd",
      "id": "1748921334196"
    },
    {
      "zone": 1,
      "type": "once",
      "start": "22:00",
      "duration": 900,
      "date": "2025-06-05",
      "id": "1748921363948"
    },
    {
      "zone": 1,
      "type": "once",
      "start": "22:00",
      "duration": 900,
      "date": "2025-06-01",
      "id": "1748921378724"
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
        "name": "Back Yard Lawn",
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
        "name": "Cat Run",
        "active": false,
        "manual_until": null,
        "color": "#6366F1"
      },
      {
        "id": 5,
        "name": "Native Garden",
        "active": false,
        "manual_until": null,
        "color": "#EC4899"
      },
      {
        "id": 6,
        "name": "Vegie Garden Lawn",
        "active": false,
        "manual_until": null,
        "color": "#8B5CF6"
      },
      {
        "id": 7,
        "name": "Patio Lawn",
        "active": false,
        "manual_until": null,
        "color": "#D97706"
      }
    ]
  }
}
"@

Invoke-RestMethod -Uri "http://openRetic.local/postSchedule" -Method Post -Body $body -ContentType "application/json"
# Option 2: Deterministic Astrology Engine (Node.js + React + MongoDB)

This document describes the **requirements and architecture** for implementing **Option 2**, a deterministic (calculation-based) astrology system using **Node.js, React, and MongoDB**.  
This approach prioritizes **accuracy, repeatability, and professional-grade results**.

---

## 1. Objective

Build a system where a user:
- Selects a **start date** and **end date**
- Receives **accurate astrological events** between those dates
- Views results **on the same page** in a **tabular format**

No AI is used for calculations. (AI may optionally be added later for explanations only.)

---

## 2. Why Option 2

- No hallucinations
- Same input → same output
- Accurate dates for eclipses, retrogrades, conjunctions
- Suitable for commercial or professional astrology apps

---

## 3. Core Astrology Scope

### 3.1 Mandatory Planets
- Mars
- Jupiter
- Saturn
- Rahu (North Node)
- Ketu (South Node)

### 3.2 Optional Planets
- Sun
- Moon
- Venus
- Mercury

---

## 4. Events to Calculate

The engine must detect:

- Planetary sign transits
- Retrograde and direct motion
- Major conjunctions (configurable orb, e.g. ≤ 1°)
- Planetary war (very close conjunctions)
- Solar eclipses
- Lunar eclipses
- Adhik Maas (extra lunar month)
- Gandanta crossings
- Long-duration conjunctions

---

## 5. Technology Stack

### 5.1 Backend
- **Node.js (Express / Fastify)**
- **Swiss Ephemeris** (via CLI or microservice)
- REST API architecture

> Note: Swiss Ephemeris does not run natively in Node.js.
> Use one of the approaches below.

---

## 6. Swiss Ephemeris Integration (Critical)

### Option A (Recommended): Python Microservice
- Python + `pyswisseph`
- Expose endpoints like:
  - `/positions`
  - `/transits`
  - `/eclipses`
- Node.js calls Python service via HTTP

### Option B: Precomputed Ephemeris Tables
- Precompute planetary data
- Store in MongoDB
- Faster reads, more storage

---

## 7. Backend API Design (Node.js)

### 7.1 Request
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

### 7.2 Response
```json
{
  "events": [
    {
      "date": "2025-03-29",
      "planetaryEvent": "Saturn enters Pisces",
      "description": "Long-term karmic phase begins",
      "impact": "Slower progress, discipline required",
      "auspiciousness": "Neutral"
    }
  ]
}
```

---

## 8. MongoDB Schema

### events collection
```js
{
  date: ISODate,
  planet: String,
  eventType: String,
  description: String,
  impact: String,
  auspiciousness: String,
  createdAt: Date
}
```

Indexes:
- `date`
- `planet`
- `eventType`

---

## 9. Frontend (React)

### Key Components
- DatePicker (start & end date)
- Fetch API call
- Table view (same page)
- Loading & error states

### Table Columns
| Date | Planet | Event | Description | Impact | Suitability |

---

## 10. Performance Strategy

- Cache results by date range
- Avoid recalculating historical data
- Use background jobs for heavy calculations

---

## 11. Accuracy Rules

- Use **Sidereal Zodiac (Lahiri Ayanamsa)**
- Consistent timezone (UTC)
- Fixed degree orbs
- Deterministic logic only

---

## 12. Optional AI Layer (Later Phase)

AI can be added **only for explanation**, never for calculation:
- Convert raw events into simple language
- Generate summaries
- Personalize interpretations

---

## 13. Deployment

### Services
- Node.js API (Vercel / Railway / Render)
- Python microservice (Railway / Fly.io)
- MongoDB Atlas

---

## 14. Estimated Effort

| Task | Time |
|----|----|
| Ephemeris integration | 5–7 days |
| Event logic | 7–10 days |
| API & DB | 3–4 days |
| Frontend table | 1–2 days |
| Testing | 3–5 days |

---

## 15. Final Notes

This architecture:
- Scales well
- Is upgrade-proof
- Supports professional astrology use cases
- Avoids AI accuracy risks

Recommended for **serious, long-term applications**.

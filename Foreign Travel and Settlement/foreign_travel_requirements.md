
# Foreign Travel & Settlement Analysis – Rule & Requirement Document

## Purpose
This document defines the rules and structure for generating consistent astrological analyses
focused on **foreign travel, long stay, settlement, and return patterns**.
It is intended for use in **vibe coding / AI-driven generation systems**.

---

## Required Inputs
The system MUST accept the following inputs:

### Birth Details
- Name
- Date of Birth (YYYY-MM-DD)
- Time of Birth (HH:MM, 24-hour format)
- Place of Birth (City, State, Country)

### Core Chart Data
- Lagna (Ascendant sign)
- Rasi (Moon sign)
- Nakshatra (with pada)
- Planetary positions table including:
  - Planet
  - Sign
  - House from Lagna
  - Nakshatra & lord
  - Retrograde status
  - Strength indicators (own sign, debilitation, exaltation)

### Optional (but recommended)
- Known travel history (years / countries)
- Current Mahadasha & Antardasha

---

## Key Interpretation Rules

### Houses for Travel
- 3rd House → Short journeys
- 7th House → Business / contractual travel
- 9th House → Long-distance & foreign travel
- 12th House → Foreign residence / separation from homeland

### Strong Foreign Travel Indicators
- Rahu connected to 9th or 12th house
- Lagna lord linked with 9th or 12th
- Multiple planets in 9th or 12th
- Dasha or Antardasha of Rahu, Saturn, Jupiter, or 9th/12th lord

### Permanent Settlement Rules
Settlement is STRONG only if **2 or more** are true:
- Strong 12th house or 12th lord
- Lagna lord placed in or aspecting 12th
- Saturn influence on Lagna / 12th
- Long Rahu or Saturn Mahadasha active

If missing → outcome defaults to **long stay with return**.

---

## Dasha-Based Timing Logic

### Rahu Mahadasha
- Early foreign exposure
- Non-permanent stays
- Sudden moves

### Jupiter Mahadasha
- Education, growth, short-to-medium travel
- Settlement only if supported by 12th house

### Saturn Mahadasha
- Long stays
- Responsibility-based residence
- Best for permanent decisions

---

## Output Requirements

The generated output MUST include:
1. WHY – Reason for foreign travel
2. WHEN – Time windows (years/months if possible)
3. WHERE – Direction & country type
4. Settlement vs Return – Clear verdict
5. Validation section (if real events are provided)

Tone:
- Clear
- Non-technical
- Single-page summary
- No astrology jargon without explanation

---

## Disallowed Behaviors
- No vague predictions
- No contradiction of provided real-life events
- No forcing permanent settlement without rule support

---

## Output Formats Supported
- HTML (for UI / web)
- Markdown (for documentation / reports)


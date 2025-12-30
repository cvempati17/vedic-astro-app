# Birth Time Rectification Engine (BTR)

## Version
BTR Engine v1.0

## Objective
Determine the most probable birth time within a given time window using multiple classical rectification algorithms and consistency scoring.

The engine must:
- Accept uncertain or approximate birth times
- Test candidate times using independent classical methods
- Score and rank each candidate
- Output a rectified birth time with confidence

---

## 1. Inputs

### Required Inputs
- date_of_birth (YYYY-MM-DD)
- place_of_birth:
  - latitude (float)
  - longitude (float)
  - timezone (string)
- time_window_start (HH:MM)
- time_window_end (HH:MM)
- sunrise_time (HH:MM, local)
- sun_longitude_deg (0–30, degrees within Sun sign)
- sun_sign_index (0–11, Aries = 0)

### Optional Inputs
- gender ("male" | "female" | "unknown")
- known_nakshatra (string | null)
- expected_ascendant (string | null)
- known_life_events (array | null)

---

## 2. Time Conversion Rules

### Units
- 1 Ghati = 24 minutes
- 1 Ghati = 60 Vighatis

### Calculations
minutes_from_sunrise = candidate_time - sunrise_time  
ghatis = minutes_from_sunrise / 24  
vighatis = ghatis * 60  

---

## 3. Rectification Methods

Each method must return:
- pass (boolean)
- derived_values (object)
- score (integer)

All methods are independent.

---

## 3.1 Parashara Method (Nakshatra Validation)

Formula:  
value = (vighatis * 4) / 9  
remainder = value % 9  

Rule:
- Count remainder from Nakshatra cycle starting at Ashwini / Magha / Moola
- Derived Nakshatra must match known_nakshatra if provided

Score:
- Match: +3
- Otherwise: 0

---

## 3.2 Kalidasa Method (Gender Validation)

Formula:  
remainder = vighatis % 225  

Gender Mapping:
1–15 Male  
16–45 Female  
46–90 Male  
91–150 Female  
151–225 Male  

Score:
- Match: +2
- Gender unknown: +1
- Mismatch: 0

---

## 3.3 Sun Longitude Method (Ascendant Calculation)

Formula:  
value = (ghatis * 6) + sun_longitude_deg  
quotient = floor(value / 30)  
ascendant_sign_index = (sun_sign_index + quotient + 1) % 12  

Score:
- Match expected ascendant: +3
- Plausible: +1
- Conflict: 0

---

## 3.4 Sodasamsa Method (Optional)

- Divide Ascendant into 16 parts
- Use as supportive validation only

Score:
- Supportive: +1

---

## 4. Iterative Search Algorithm

FOR time from start to end in 1-minute steps:
- Calculate ghatis and vighatis
- Run all rectification methods
- Sum scores
- Store results

---

## 5. Selection Rules

- Choose time with highest score
- Break ties using ascendant stability and method agreement

---

## 6. Output

{
  "rectified_time": "HH:MM",
  "ascendant_sign": "Leo",
  "nakshatra": "Thiruvonam",
  "total_score": 9,
  "confidence": "High"
}

---

## 7. Confidence Levels

8–9 High  
5–7 Medium  
<5 Low  

---

## End of File

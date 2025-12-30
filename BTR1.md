# BTR1.md: Vedic Birth Time Rectification Framework

## 1. Project Overview
**Goal**: Build a web-based calculator that rectifies a user's birth time by strictly adhering to the "Parashara" and "Kalidasa" algorithms.
**Core Logic**: The tool iterates through a given time range (e.g., 2:00 AM to 2:30 AM), converts each minute into Vedic time units (Vighatis), and filters for times that satisfy specific mathematical conditions regarding Gender and Birth Star.

---

## 2. Input Form Requirements (UI)
The user interface must capture the following fields to perform the calculation:

| Field Name | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| **Date of Birth** | Date Picker | `1972-07-17` | The Gregorian date of birth. |
| **Time Range Start** | Time Picker | `02:00` | Start of the uncertain window. |
| **Time Range End** | Time Picker | `02:30` | End of the uncertain window. |
| **Place of Birth** | City Search | `Palakollu, AP` | Used to fetch Latitude/Longitude. |
| **Gender** | Dropdown | `Female` | Required for Kalidasa validation. |
| **Known Birth Star** | Dropdown | `Hasta` | The Nakshatra from the horoscope (1-27). |
| **Known Ascendant** | Dropdown | `Gemini` | (Optional) The Rising Sign to validate against. |

*(Hidden System Inputs: Latitude, Longitude, Timezone)*

---

## 3. Core Algorithms & Logic

### A. Astronomical Pre-Calculation (Backend)
*Requires an astronomy library (e.g., `swisseph` or `skyfield`) to fetch accurate planetary data.*

1.  **Determine Sunrise**:
    * Calculate Sunrise time for the **Place of Birth**.
    * **Critical Rule**: If `Birth_Time < Sunrise`, use the **Previous Day's** Sunrise and Date for Vedic calculations.
2.  **Get Planetary Positions**:
    * **Sun Longitude**: The Sun's position in degrees (0-360) at the *start* of the time range.
    * **Moon Longitude**: (Optional) To auto-detect the Birth Star if not provided.

### B. Time Conversion Logic
For every minute `t` in the input range:
1.  **Calculate Duration**: `Minutes_Passed = t - Sunrise_Time`
2.  **Convert to Ghatis**: `Ghatis = Minutes_Passed / 24`
3.  **Convert to Vighatis**: `Vighatis = Ghatis * 60` (or `Minutes_Passed * 2.5`)

---

## 4. Validation Methods (The Filters)

A time `t` is a valid candidate **only if** it passes ALL active methods below.

### Method 1: Parashara Check (Nakshatra)
Validates if the time mathematically aligns with the birth star.

* **Formula**: `R = (Vighatis * 4) % 9`
    * *Note: If R = 0, treat as 9.*
* **Target Calculation**:
    * Map the user's **Known Birth Star** (1-27) to a 1-9 scale.
    * `Target_R = (Star_Index - 1) % 9 + 1`
* **Condition**: `R == Target_R`

### Method 2: Kalidasa Check (Gender)
Validates if the time aligns with the biological sex.

* **Formula**: `K = Vighatis % 225`
* **Condition Table**:
    * **Male**: If `K` is between **46 and 90**.
    * **Female**: If `K` is between **16 and 45** OR **91 and 150**.
    * *(Note: Ranges 0-15, 151-225 are undefined/neutral in this specific logic set; treat as Fail or Warning).*

### Method 3: Sun/Ascendant Check (Lagna)
Validates if the calculated Ascendant degree matches the expected sign.

* **Formula**: `Lagna_Degree = ((Ghatis * 6) + Sun_Longitude_Degrees) % 360`
* **Condition**:
    * Convert `Lagna_Degree` to a Sign (0-30° = Aries, 30-60° = Taurus, etc.).
    * Check if this Sign matches the **Known Ascendant**.

---

## 5. Reference Tables

### Table A: Nakshatra Target Mapping (Parashara)
| Remainder (Target) | Nakshatras (Stars) |
| :--- | :--- |
| **1** | Ashwini, Magha, Moola |
| **2** | Bharani, P.Phalguni, P.Ashadha |
| **3** | Krittika, U.Phalguni, U.Ashadha |
| **4** | Rohini, Hasta, Shravana |
| **5** | Mrigashirsha, Chitra, Dhanishta |
| **6** | Ardra, Swati, Shatabhisha |
| **7** | Punarvasu, Vishakha, P.Bhadrapada |
| **8** | Pushya, Anuradha, U.Bhadrapada |
| **9** | Ashlesha, Jyeshtha, Revati |

### Table B: Kalidasa Gender Ranges (Remainder of Vighatis / 225)
| Range Start | Range End | Gender |
| :--- | :--- | :--- |
| 16 | 45 | **Female** |
| 46 | 90 | **Male** |
| 91 | 150 | **Female** |
| *Others* | *Others* | *Fail/Undefined* |

---

## 6. Output Specification
The tool should return a list of "Rectified Times". For each valid time, display:
1.  **Rectified Time** (e.g., 02:06 AM)
2.  **Vighatis** (e.g., 3070)
3.  **Parashara Remainder** (Matches Star?)
4.  **Kalidasa Remainder** (Matches Gender?)
5.  **Calculated Ascendant** (Sign + Degree)

## 7. Pseudocode for Implementation

```python
def rectify_birth_time(user_inputs):
    valid_times = []
    
    # Astronomical Data
    sunrise = get_sunrise(user_inputs.date, user_inputs.lat, user_inputs.lon)
    sun_lon = get_sun_long(user_inputs.date, user_inputs.time)
    
    # Loop through every minute in range
    for time in time_range(user_inputs.start_time, user_inputs.end_time):
        
        # 1. Conversion
        minutes_passed = (time - sunrise).total_minutes()
        ghatis = minutes_passed / 24
        vighatis = ghatis * 60
        
        # 2. Parashara Test
        para_rem = (vighatis * 4) % 9
        if para_rem == 0: para_rem = 9
        target_star_rem = (user_inputs.star_index - 1) % 9 + 1
        
        if para_rem != target_star_rem:
            continue # Fail
            
        # 3. Kalidasa Test
        kali_rem = vighatis % 225
        is_gender_match = False
        if user_inputs.gender == "Female":
            if (16 <= kali_rem <= 45) or (91 <= kali_rem <= 150):
                is_gender_match = True
        elif user_inputs.gender == "Male":
            if (46 <= kali_rem <= 90):
                is_gender_match = True
                
        if not is_gender_match:
            continue # Fail
            
        # 4. Success
        valid_times.append({
            "time": time,
            "vighatis": vighatis,
            "ascendant": calculate_ascendant(ghatis, sun_lon)
        })
        
    return valid_times
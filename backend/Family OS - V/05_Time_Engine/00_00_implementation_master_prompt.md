# VIBE CODE — ASTROGRAVITY MASTER IMPLEMENTATION PROMPT

## ROLE & MANDATE
You are implementing Astrogravity, a deterministic astrology engine.

Your job is NOT to:
- interpret astrology creatively
- infer missing rules
- simplify logic
- “optimize” astrology

Your job IS ONLY to:
- implement the engine exactly as specified
- treat YAML files as the single source of truth
- enforce validation before rendering any output

If a rule is not present in YAML → it does not exist.

## CORE PRINCIPLES (NON-NEGOTIABLE)
- No astrology logic in code
- All astrology rules must come from YAML
- Math must be deterministic and traceable
- Delay ≠ denial
- No false hope, no fatalism
- If validation fails → do not render

Any violation is a hard bug, not a design choice.

## SOURCE-OF-TRUTH FILES (READ-ONLY)
You must load and use only these YAML files for astrology logic:
- functional_nature_by_lagna.yaml
- yogakaraka_axis_multiplier.yaml
- transit_axis_mapping.yaml

These files are:
- versioned
- immutable
- authoritative

❌ Do NOT recreate these rules in code
❌ Do NOT infer missing astrology logic
❌ Do NOT add shortcuts

## REQUIRED EXECUTION PIPELINE (STRICT ORDER)
You MUST follow this exact sequence:
1. Natal Layer (static)
2. Functional Nature by Lagna (YAML)
3. Yogakaraka Axis Multipliers (YAML)
4. Individual Dasha Intensity Engine
5. Family Mahadasha Organism Merge
6. Transit Gate + Multiplier Engine (YAML)
7. Effective Intensity Calculation
8. Guidance Resolution
9. Pre-Render Validation Gate
10. Render (ONLY if validation passes)

No steps may be skipped, reordered, or merged.

## ENGINE RESPONSIBILITIES (WHAT TO IMPLEMENT)
### 1️⃣ Natal Layer
- Load base natal strengths per axis
- No time fields allowed
- No modification after load

### 2️⃣ Individual Daśā Intensity Engine
- Compute monthly intensity per axis per member
- Use:
  - functional nature from functional_nature_by_lagna.yaml
  - yogakaraka multipliers from yogakaraka_axis_multiplier.yaml
- Output range must be 0–100
- No transit logic here

### 3️⃣ Family Mahā-Daśā Organism
- Merge individual curves into one family curve
- Use role weights + dependency weights
- Normalize family intensity to 0–100
- Identify dominant axis per time slice

### 4️⃣ Transit Gate & Multiplier Engine
- Use only transit_axis_mapping.yaml
- Only Saturn, Jupiter, Rahu, Ketu affect gates
- Resolve gate conflicts using priority:
  - BLOCK > HOLD > OPEN
- Output:
  - gate_state
  - transit_multiplier

❌ Transits must never change natal or dasha data

### 5️⃣ Effective Intensity (FINAL NUMBER)
You MUST compute:
`effective_intensity = family_intensity × transit_multiplier`
This is the only number the UI may use.

### 6️⃣ Guidance Engine
Guidance may depend ONLY on:
- effective_intensity
- gate_state
- base_natal_strength (existence check only)

Rules:
- If no natal promise → REDIRECT
- If strong promise + BLOCK → WAIT / DON’T QUIT
- If strong promise + OPEN → ACT NOW

❌ Do NOT use planets, dashas, or transits directly here

## OUTPUT CONTRACT (MANDATORY)
All output must conform to the Unified Astrogravity JSON Schema, including:
- natal_layer
- individual_dasha_layer
- family_mahadasha_layer
- transit_layer
- effective_intensity_layer
- guidance_layer

The UI must read only from:
- effective_intensity_layer
- guidance_layer

## PRE-RENDER VALIDATION (MANDATORY)
Before rendering anything:
- Run all hard invariants
- If any check fails:
  - DO NOT render
  - Log failure with reason
  - Show neutral system message

You must implement the Developer Pre-Render Checklist exactly as provided.
Rendering invalid data is considered a critical failure.

## FORBIDDEN ACTIONS (ABSOLUTE)
You must NOT:
- Hardcode astrology rules
- Assume benefic/malefic planets
- Infer yogakaraka logic
- Change multipliers
- Skip validation
- “Fix” astrology inconsistencies in code
- Smooth or normalize curves artistically

If something feels missing → request a new YAML.

## SUCCESS CRITERIA
The implementation is correct ONLY IF:
- Two different lagnas produce different results with the same planets
- Delay periods are visible without removing promise
- “Don’t quit yet” emerges naturally from math
- Removing YAML files breaks the engine (by design)
- No astrology logic exists outside YAML

## FINAL INSTRUCTION
You are building a deterministic guidance engine, not a horoscope writer.
If there is ambiguity: STOP. ASK. DO NOT GUESS.
Astrogravity must never lie.

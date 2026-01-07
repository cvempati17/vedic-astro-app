# Interpretation Layer & Translation Guidelines

## Structure
The interpretation layer is driven by strict YAML definitions to ensure consistency, safety, and determinism.

- **Base Language**: `en` (English) - The master definition.
- **Support Languages**: `hi` (Hindi), `te` (Telugu), `ta` (Tamil).

## Translation Guidelines
1.  **Strict YAML Compliance**: Do not change keys. The keys (e.g., `career.description.short`) are hardcoded in the logic. Only translate the values.
2.  **"No Fear" Policy**: 
    - Avoid fatalistic language (e.g., "Destruction", "Death", "Extreme poverty").
    - Use constructive, structural terms (e.g., "Transformation", "End of a cycle", "Resource constraint").
    - **Bad**: "This period brings bad luck."
    - **Good**: "This period requires patience and consolidation."
3.  **Fallback Logic**: The system automatically falls back to English if a specific language file or key is missing. It is better to leave a file missing than to have a broken file.

## File Naming
- `axis_narrative_{axis}_v1.0.yaml`
- `gate_narrative_v1.0.yaml`
- `intensity_narrative_v1.0.yaml`
- `timeline_guidance_v1.0.yaml`

## Axis Definitions
- **Career**: Work, responsibility, public impact (Not just "Job").
- **Wealth**: Resource stability, accumulation (Not just "Money").
- **Care**: Nurturing, emotional support (Not just "Mother").
- **Conflict**: Friction, boundary setting (Not just "Fighting").
- **Legacy**: Long-term impact, values.
- **Emotional Load**: Internal pressure, stress carrying capacity.

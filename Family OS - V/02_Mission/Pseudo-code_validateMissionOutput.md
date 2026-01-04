function validateMissionOutput(output):

  errors = []

  # Family-level checks
  if not output.mission_mode:
    errors.add("Missing mission mode")

  if not output.mission_mode.rationale:
    errors.add("Missing mission mode rationale")

  if length(output.mission_narrative) < 200:
    errors.add("Mission narrative too short")

  if output.execution_risks.count < 1:
    errors.add("No execution risks emitted")

  if not output.execution_risks.hasMitigation():
    errors.add("Risk without mitigation detected")

  if output.planetary_reinforcements.count < 1:
    errors.add("No planetary reinforcement emitted")

  # Role-level checks
  for role in output.members:
    if not role.role_name:
      errors.add(role.name + ": missing role name")

    if not role.responsibility:
      errors.add(role.name + ": missing responsibility")

    if not role.caution:
      errors.add(role.name + ": missing caution/failure mode")

    if role.type == "child" and not role.protection_rule:
      errors.add("Child missing protection rule")

    if role.type == "elder" and role.hasExecutionDuty():
      errors.add("Elder incorrectly assigned execution role")

  # Language safety
  for phrase in forbidden_phrases:
    if output.text.contains(phrase):
      errors.add("Fatalistic language detected: " + phrase)

  if errors.notEmpty():
    return ValidationResult(FAIL, errors)

  return ValidationResult(PASS)

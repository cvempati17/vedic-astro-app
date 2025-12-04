# Vedic Trait & Compatibility Rule Engine (Grouped Traits)

Version: 2.0  
Scope: 35+ individual traits (1–10) + Pairwise synergy scoring (1–10)  

This document is designed to be **LLM-ingestable** and **Excel-friendly**.  
All scoring logic is expressed as **tables** using consistent columns.

---

## 0. Core Scoring Principles

### 0.1 Global Rules

- Each trait is scored on a **1–10 scale**.
- Each trait starts from a **base score of 5**.
- Adjustments are applied using integer deltas (e.g., +1, +2, −1, −2).
- Final score is **clamped**:

```text
score = min(10, max(1, 5 + sum_of_deltas))
```

### 0.2 Common Columns

Throughout this document, scoring tables use:

| Column           | Meaning |
|------------------|---------|
| Trait            | Name of trait being scored |
| Factor           | Name of the sub-factor (e.g., Sun, Jupiter, 9th house) |
| Astro_Indicator  | Planet / House / Sign / Combination considered |
| Condition        | Condition description in plain language |
| Score_Delta      | Numeric adjustment (−3 to +4 typical range) |

A rule engine or LLM should:

1. Determine which **conditions** are met in the chart.  
2. Sum all `Score_Delta` values for that trait.  
3. Add to base 5 and clamp to [1, 10] to get final score.

---

## 1. Planet & House Meaning Cheat Sheet

This section provides a compact mapping of planets and houses to psychological and functional meanings.  
It is not a scoring section; it is a **reference** used by traits.

### 1.1 Planets

| Planet  | Keywords / Role |
|---------|-----------------|
| Sun     | Identity, ego, integrity, confidence, leadership, authority |
| Moon    | Emotions, mind, sensitivity, nurturing, habits, contentment |
| Mars    | Action, drive, courage, risk, aggression, decisive energy |
| Mercury | Intellect, communication, logic, analysis, data, adaptability |
| Jupiter | Wisdom, ethics, justice, belief, expansion, generosity, faith |
| Venus   | Love, affection, beauty, intimacy, pleasure, relationships |
| Saturn  | Discipline, responsibility, delay, structure, duty, stability |
| Rahu    | Obsession, innovation, foreign/modern/technical, risk, disruption |
| Ketu    | Detachment, intuition, spirituality, non-material focus |

### 1.2 Houses (from Lagna)

| House | Main Themes |
|-------|-------------|
| 1st   | Self, body, identity, overall personality |
| 2nd   | Speech, values, family, savings, food, early environment |
| 3rd   | Courage, initiative, communication, siblings, effort |
| 4th   | Inner peace, home, mother, emotional foundation |
| 5th   | Intellect, creativity, children, past life merit, learning |
| 6th   | Work, service, health, conflict, daily grind, discipline |
| 7th   | Partnership, spouse, public relations, clients |
| 8th   | Deep change, secrets, crises, transformation, research |
| 9th   | Dharma, luck, higher wisdom, teachers, ethics, beliefs |
| 10th  | Career, status, public image, responsibility |
| 11th  | Gains, income, networks, friends, ambitions |
| 12th  | Loss, expenditure, isolation, foreign, sleep, spirituality |

---

## 2. Trait Categories Overview

We group traits into five categories:

1. **Personal Character & Ethics**
2. **Emotional & Relationship Traits**
3. **Mental Growth & Adaptability**
4. **Work & Collaboration Traits**
5. **Skills & Professional Traits**

Each trait has its own scoring table.

---

## 3. Personal Character & Ethics

Traits:

- Trustworthiness & Honesty  
- Respectful Behavior  
- Loyalty & Commitment  
- Responsibility & Reliability  
- Fairness & Justice  
- Generosity (Compensation)  
- Neutrality & Objectivity  
- Patience & Tolerance  
- Shared Values  

### 3.1 Trustworthiness & Honesty

Formula concept:

```text
Base 5 + Sun + Jupiter + 9th house + Affliction penalties
```

| Trait                    | Factor          | Astro_Indicator                        | Condition                                                                 | Score_Delta |
|--------------------------|-----------------|----------------------------------------|---------------------------------------------------------------------------|------------:|
| Trustworthiness & Honesty| Sun             | Sun dignity & house                    | Sun in own/exalted sign in Kendra/Trikona, unafflicted                    |         +3 |
| Trustworthiness & Honesty| Sun             | Sun dignity & house                    | Sun strong but mildly afflicted (e.g., conjunction with malefic)          |         +1 |
| Trustworthiness & Honesty| Sun             | Sun in dusthāna / debilitation        | Sun debilitated or in 6/8/12 with malefic aspect                          |         −2 |
| Trustworthiness & Honesty| Jupiter         | Jupiter dignity                        | Jupiter strong (own/exalted) and aspecting Lagna or Sun                   |         +3 |
| Trustworthiness & Honesty| Jupiter         | Jupiter weak                           | Jupiter debilitated/very weak, in 6/8/12 without benefic aspect           |         −2 |
| Trustworthiness & Honesty| 9th house       | 9th lord & house                      | 9th lord strong, 9th free from heavy malefics                             |         +2 |
| Trustworthiness & Honesty| 9th house       | 9th house affliction                  | 9th lord weak & 9th heavily afflicted by malefics                         |         −2 |
| Trustworthiness & Honesty| Rahu/Ketu       | Rahu/Ketu vs Sun/Jupiter              | Rahu closely conjoined Sun/Jupiter in 2/8/12 with other afflictions       |         −2 |
| Trustworthiness & Honesty| Overall pattern | Sum check                              | If Sun, Jupiter, and 9th all strong                                       |         +1 |

Interpretation hints:  
- 9–10 → High integrity, transparent, reliable with truth.  
- 7–8 → Generally honest, may struggle in rare edge cases.  
- 5–6 → Situational honesty; adapts to circumstances.  
- ≤4 → Can compromise truth for convenience or fear.

---

### 3.2 Respectful Behavior

| Trait             | Factor     | Astro_Indicator              | Condition                                                            | Score_Delta |
|-------------------|------------|------------------------------|----------------------------------------------------------------------|------------:|
| Respectful Behavior | Jupiter  | Jupiter vs Lagna/Moon        | Jupiter aspecting Lagna, Moon, or 7th house                         |         +2 |
| Respectful Behavior | Venus    | Venus dignity                | Venus strong and unafflicted (kind, gentle nature)                  |         +1 |
| Respectful Behavior | Saturn   | Saturn influence             | Saturn strong but not harshly afflicting Moon (disciplined respect) |         +1 |
| Respectful Behavior | Mars     | Mars–Mercury/Moon affliction | Mars harshly afflicting Moon/Mercury in 3rd/6th/10th                 |         −2 |
| Respectful Behavior | Rahu     | Rahu on 3rd/7th              | Rahu over 3rd/7th with malefics, no Jupiter/Venus relief             |         −1 |

---

### 3.3 Loyalty & Commitment

| Trait              | Factor   | Astro_Indicator               | Condition                                                                  | Score_Delta |
|--------------------|----------|-------------------------------|----------------------------------------------------------------------------|------------:|
| Loyalty & Commitment | Venus  | Venus sign/house              | Venus in fixed signs (Taurus, Leo, Scorpio, Aquarius) well dignified       |         +2 |
| Loyalty & Commitment | Moon   | Moon sign                     | Moon in fixed sign and not heavily afflicted                               |         +1 |
| Loyalty & Commitment | 7th     | 7th lord & house             | 7th lord strong and not under heavy malefic attack                         |         +2 |
| Loyalty & Commitment | Rahu    | Rahu in 7th                   | Rahu in 7th with strong afflictions and weak Venus/7th lord                |         −2 |
| Loyalty & Commitment | Ketu    | Ketu in 7th/2nd               | Ketu in 7th or 2nd with very weak Venus/7th lord                            |         −1 |

---

### 3.4 Responsibility & Reliability

| Trait                    | Factor   | Astro_Indicator          | Condition                                                           | Score_Delta |
|--------------------------|----------|--------------------------|---------------------------------------------------------------------|------------:|
| Responsibility & Reliability | Saturn | Saturn dignity & house  | Saturn strong in Kendra/Trikona, especially as Lagna/10th/2nd lord |         +3 |
| Responsibility & Reliability | 6th    | 6th lord and house      | Strong 6th lord, benefic aspects, supports duty and service         |         +2 |
| Responsibility & Reliability | 10th   | 10th lord               | Strong 10th lord in good dignity                                   |         +1 |
| Responsibility & Reliability | Moon   | Moon affliction         | Moon heavily afflicted and Saturn very weak                         |         −2 |

---

### 3.5 Fairness & Justice

| Trait           | Factor   | Astro_Indicator     | Condition                                                         | Score_Delta |
|-----------------|----------|---------------------|-------------------------------------------------------------------|------------:|
| Fairness & Justice | Jupiter | Jupiter strength   | Jupiter strong and linked to 9th/10th                             |         +3 |
| Fairness & Justice | Libra   | Libra emphasis     | Strong Libra (sign on Lagna/10th/7th with benefics)               |         +1 |
| Fairness & Justice | 9th     | 9th house          | 9th lord strong and unafflicted                                   |         +2 |
| Fairness & Justice | Rahu    | Rahu in 9th/10th   | Rahu afflicting 9th/10th with weak Jupiter/9th lord               |         −2 |

---

### 3.6 Generosity (Compensation)

| Trait                   | Factor   | Astro_Indicator         | Condition                                                | Score_Delta |
|-------------------------|----------|-------------------------|----------------------------------------------------------|------------:|
| Generosity (Compensation) | Jupiter| Jupiter in 2/5/9/11    | Jupiter strong in wealth/gain houses                     |         +2 |
| Generosity (Compensation) | Venus  | Venus in 2nd/11th      | Venus strong, connected to 2nd/11th (enjoys sharing)     |         +1 |
| Generosity (Compensation) | Saturn | Saturn vs 2nd          | Harsh Saturn on 2nd with no Jupiter/Venus relief         |         −1 |

---

### 3.7 Neutrality & Objectivity

| Trait                  | Factor   | Astro_Indicator | Condition                                                         | Score_Delta |
|------------------------|----------|-----------------|-------------------------------------------------------------------|------------:|
| Neutrality & Objectivity | Mercury| Mercury strength| Mercury strong, well placed, not combust or heavily afflicted     |         +2 |
| Neutrality & Objectivity | Saturn | Saturn support  | Saturn strong, linked to Mercury without harming Moon             |         +1 |
| Neutrality & Objectivity | Moon   | Moon emotional  | Moon very unstable (debilitated, with Rahu, no benefic aspects)   |         −2 |

---

### 3.8 Patience & Tolerance

| Trait              | Factor | Astro_Indicator   | Condition                                                          | Score_Delta |
|--------------------|--------|-------------------|--------------------------------------------------------------------|------------:|
| Patience & Tolerance | Saturn| Saturn strength   | Saturn strong and benefic, not overly harsh on Moon                |         +2 |
| Patience & Tolerance | Jupiter| Jupiter aspect   | Jupiter aspecting Moon/Lagna                                       |         +1 |
| Patience & Tolerance | Mars  | Mars vs Moon     | Mars strongly afflicting Moon/3rd causing impatience               |         −2 |

---

### 3.9 Shared Values

| Trait        | Factor | Astro_Indicator          | Condition                                                          | Score_Delta |
|--------------|--------|--------------------------|--------------------------------------------------------------------|------------:|
| Shared Values| 9th    | 9th lord & house         | 9th lord strong and supports Lagna/7th                            |         +2 |
| Shared Values| 2nd    | 2nd lord & house         | 2nd lord strong, family values stable                              |         +1 |
| Shared Values| Rahu   | Rahu on 2nd/9th          | Rahu heavily afflicting 2nd/9th with weak Jupiter/2nd lord         |         −2 |

---

## 4. Emotional & Relationship Traits

Traits:

- Emotional Maturity  
- Kindness & Compassion  
- Effective Communication  
- Supportiveness  
- Affection & Intimacy  
- Sense of Humor  
- Focus on Well-being  

### 4.1 Emotional Maturity

| Trait             | Factor | Astro_Indicator   | Condition                                                       | Score_Delta |
|-------------------|--------|-------------------|-----------------------------------------------------------------|------------:|
| Emotional Maturity| Moon   | Moon strength     | Moon strong (own/exalted), benefic-aspected                    |         +3 |
| Emotional Maturity| Moon   | Moon + Saturn     | Saturn aspect/conjunction to Moon with support from Jupiter     |         +1 |
| Emotional Maturity| Moon   | Moon affliction   | Moon debilitated or with Rahu/Ketu + malefics, no benefic help  |         −3 |

---

### 4.2 Kindness & Compassion

| Trait               | Factor | Astro_Indicator   | Condition                                          | Score_Delta |
|---------------------|--------|-------------------|----------------------------------------------------|------------:|
| Kindness & Compassion | Moon | Moon in benefic signs | Moon in Cancer/Pisces, supported by Jupiter/Venus |         +2 |
| Kindness & Compassion | Venus| Venus dignity     | Venus strong and unafflicted                       |         +1 |
| Kindness & Compassion | Mars | Mars harshness    | Mars heavily aspecting Moon/4th without benefics   |         −2 |

---

### 4.3 Effective Communication

| Trait              | Factor   | Astro_Indicator | Condition                                                           | Score_Delta |
|--------------------|----------|-----------------|---------------------------------------------------------------------|------------:|
| Effective Communication | Mercury| Mercury strength | Mercury strong, in 2nd/3rd/10th, not combust or hemmed by malefics  |         +3 |
| Effective Communication | 3rd     | 3rd lord        | Strong 3rd lord, benefic-aspected                                   |         +1 |
| Effective Communication | Rahu    | Rahu with Mercury | Rahu with Mercury in air signs (Gemini/Libra/Aquarius)              |         +1 |
| Effective Communication | Mercury | Mercury afflicted | Mercury with Saturn/Mars/Rahu in dusthāna without benefic aspect    |         −2 |

---

### 4.4 Supportiveness

| Trait        | Factor | Astro_Indicator          | Condition                                                 | Score_Delta |
|--------------|--------|--------------------------|-----------------------------------------------------------|------------:|
| Supportiveness| Moon  | Moon & 11th house        | Moon strong & benefic influence on 11th and 4th           |         +2 |
| Supportiveness| Venus | Venus in Kendra/Trikona  | Strong Venus in Kendra/Trikona, no heavy afflictions      |         +1 |
| Supportiveness| Saturn| Saturn harsh on 4th      | Saturn + malefics afflicting 4th without Jupiter relief   |         −2 |

---

### 4.5 Affection & Intimacy

| Trait            | Factor | Astro_Indicator | Condition                                                       | Score_Delta |
|------------------|--------|-----------------|-----------------------------------------------------------------|------------:|
| Affection & Intimacy | Venus | Venus dignity | Venus strong, in Kendra/Trikona or 5th/7th, no harsh malefics  |         +3 |
| Affection & Intimacy | 7th  | 7th lord       | 7th lord strong, benefics in/aspecting 7th                     |         +2 |
| Affection & Intimacy | Malefics | Malefics in 7th | Harsh malefics (Saturn/Mars/Rahu) in 7th with weak Venus       |         −3 |

---

### 4.6 Sense of Humor

| Trait         | Factor | Astro_Indicator     | Condition                                               | Score_Delta |
|---------------|--------|---------------------|---------------------------------------------------------|------------:|
| Sense of Humor| Mercury| Mercury & Jupiter   | Mercury + Jupiter linkage (aspect/conjunction)          |         +2 |
| Sense of Humor| 5th    | 5th house           | Strong 5th house with benefics                          |         +1 |
| Sense of Humor| Saturn | Saturn heaviness    | Very heavy Saturn on Moon & 5th without Jupiter relief  |         −2 |

---

### 4.7 Focus on Well-being

| Trait             | Factor | Astro_Indicator  | Condition                                                        | Score_Delta |
|-------------------|--------|------------------|------------------------------------------------------------------|------------:|
| Focus on Well-being | 1st  | 1st lord & house | 1st lord strong, linked to benefics, no extreme 6/8/12 affliction|        +2 |
| Focus on Well-being | 6th  | 6th house        | 6th strong with benefic influence (proactive about health)       |        +1 |
| Focus on Well-being | 12th | 12th imbalance   | 12th heavily malefic with addictions, escapism                   |        −2 |

---

## 5. Mental Growth & Adaptability

Traits:

- Independence / Self-Motivation  
- Adaptability & Flexibility  
- Curiosity & Inquisitiveness  
- Willingness to Learn  
- Observation & Awareness  
- Problem-Solving  
- Improvisation & Adaptability  

### 5.1 Independence / Self-Motivation

| Trait                    | Factor | Astro_Indicator | Condition                                                 | Score_Delta |
|--------------------------|--------|-----------------|-----------------------------------------------------------|------------:|
| Independence / Self-Motivation | Sun | Sun in Kendra  | Strong Sun in 1st/10th/9th with dignity                   |         +2 |
| Independence / Self-Motivation | Mars| Mars strength  | Strong Mars in Kendra/Upachaya, not overly afflicted      |         +2 |
| Independence / Self-Motivation | Moon| Dependent Moon | Moon very weak and dependent (debilitated, badly afflicted)|        −2 |

---

### 5.2 Adaptability & Flexibility

| Trait                   | Factor | Astro_Indicator   | Condition                                                    | Score_Delta |
|-------------------------|--------|-------------------|--------------------------------------------------------------|------------:|
| Adaptability & Flexibility | Mercury| Dual signs      | Mercury strong in dual signs (Gemini, Virgo, Sagittarius, Pisces) |       +2 |
| Adaptability & Flexibility | Rahu | Rahu with Mercury| Rahu + Mercury in air/dual signs (innovative flexibility)    |         +1 |
| Adaptability & Flexibility | Fixed overload | Many fixed signs | Excessive fixed sign emphasis without Mercury/Jupiter balance|        −2 |

---

### 5.3 Curiosity & Inquisitiveness

| Trait                     | Factor | Astro_Indicator | Condition                                                   | Score_Delta |
|---------------------------|--------|-----------------|-------------------------------------------------------------|------------:|
| Curiosity & Inquisitiveness | Mercury| Mercury strength| Mercury strong in 3rd/5th/9th                               |         +2 |
| Curiosity & Inquisitiveness | Rahu   | Rahu with Mercury| Rahu in 3rd/9th with Mercury (curious, experimental)        |         +1 |
| Curiosity & Inquisitiveness | Saturn | Saturn suppression| Saturn heavily afflicting Mercury and 3rd without benefics |        −1 |

---

### 5.4 Willingness to Learn

| Trait              | Factor | Astro_Indicator | Condition                                      | Score_Delta |
|--------------------|--------|-----------------|------------------------------------------------|------------:|
| Willingness to Learn | Jupiter| Jupiter & 5th/9th| Jupiter strong in 5th/9th, benefic aspects    |         +3 |
| Willingness to Learn | 5th   | 5th lord        | 5th lord strong and not afflicted             |         +1 |
| Willingness to Learn | Saturn| Rigid Saturn    | Strong Saturn without Jupiter/Mercury support |        −1 |

---

### 5.5 Observation & Awareness

| Trait              | Factor  | Astro_Indicator | Condition                                                  | Score_Delta |
|--------------------|---------|-----------------|------------------------------------------------------------|------------:|
| Observation & Awareness | Mercury | Mercury in 3rd| Mercury strong in 3rd/6th (good observer)                  |         +2 |
| Observation & Awareness | Moon    | Moon dignity  | Moon stable and benefic-infused                             |         +1 |
| Observation & Awareness | Rahu    | Rahu fog      | Rahu over Moon/Mercury in 8/12 causing confusion           |         −2 |

---

### 5.6 Problem-Solving

| Trait         | Factor | Astro_Indicator   | Condition                                                 | Score_Delta |
|---------------|--------|-------------------|-----------------------------------------------------------|------------:|
| Problem-Solving| Mercury| Mercury strength | Strong Mercury in Kendra/Trikona                          |         +2 |
| Problem-Solving| Mars  | Mars + Mercury    | Mars + Mercury in trines/upachaya (decisive + analytical) |         +1 |
| Problem-Solving| 6th   | 6th lord          | Strong 6th lord (handles crises, obstacles)               |         +1 |
| Problem-Solving| Moon  | Moon weak         | Weak Moon under heavy affliction                          |         −2 |

---

### 5.7 Improvisation & Adaptability

| Trait                    | Factor | Astro_Indicator | Condition                                               | Score_Delta |
|--------------------------|--------|-----------------|---------------------------------------------------------|------------:|
| Improvisation & Adaptability | Rahu| Rahu in air signs | Rahu in Gemini/Libra/Aquarius, with Mercury/Jupiter support |      +2 |
| Improvisation & Adaptability | Mercury| Mercury exalted | Mercury exalted (Virgo) with Rahu/Ketu connections      |         +1 |
| Improvisation & Adaptability | Saturn| Heavy Saturn     | Heavy Saturn on Lagna/3rd with little Mercury/Rahu help |        −1 |

---

## 6. Work & Collaboration Traits

Traits:

- Strong Work Ethic  
- Positive Attitude  
- Teamwork & Collaboration  
- Leadership  
- Vision & Direction  
- Project Management  
- Risk Taking Ability  

### 6.1 Strong Work Ethic

(Reuse the earlier Work Ethic definition; kept compact.)

| Trait           | Factor | Astro_Indicator | Condition                                                   | Score_Delta |
|-----------------|--------|-----------------|-------------------------------------------------------------|------------:|
| Strong Work Ethic | Saturn| Saturn strength| Saturn strong in Kendra/Trikona, linked to 6th/10th         |         +3 |
| Strong Work Ethic | Mars  | Mars in 3rd/6th/10th | Strong Mars in work houses/upachayas                     |         +2 |
| Strong Work Ethic | 6th   | 6th lord       | Strong 6th lord, benefic support                            |         +1 |
| Strong Work Ethic | 10th  | 10th lord      | Strong 10th lord                                            |         +1 |
| Strong Work Ethic | 6th   | 6th weak       | Very weak 6th lord with malefics                            |         −2 |

---

### 6.2 Positive Attitude

| Trait           | Factor  | Astro_Indicator | Condition                                                     | Score_Delta |
|-----------------|---------|-----------------|---------------------------------------------------------------|------------:|
| Positive Attitude | Jupiter| Jupiter aspect  | Jupiter aspecting Lagna/Moon                                  |         +2 |
| Positive Attitude | Moon   | Moon dignity    | Moon strong and not heavily afflicted                         |         +1 |
| Positive Attitude | Saturn | Heavy Saturn    | Saturn heavily afflicting Moon/Lagna without Jupiter relief   |         −2 |
| Positive Attitude | Rahu   | Rahu over Moon  | Rahu tightly with Moon in 1/4/10 causing anxiety/fear         |         −1 |

---

### 6.3 Teamwork & Collaboration

| Trait               | Factor | Astro_Indicator | Condition                                                            | Score_Delta |
|---------------------|--------|-----------------|---------------------------------------------------------------------|------------:|
| Teamwork & Collaboration | Moon | Moon & 11th   | Moon strong, benefics in/aspecting 11th                              |         +2 |
| Teamwork & Collaboration | Venus| Venus in Libra| Venus strong in Libra/Taurus/7th (relationship-friendly)            |         +1 |
| Teamwork & Collaboration | Saturn| Harsh Saturn | Saturn heavily afflicting 7th/11th without benefic support          |         −2 |

---

### 6.4 Leadership

| Trait      | Factor | Astro_Indicator | Condition                                                     | Score_Delta |
|------------|--------|-----------------|---------------------------------------------------------------|------------:|
| Leadership | Sun    | Sun dignity     | Sun strong in 1st/9th/10th (own/exalted)                     |         +3 |
| Leadership | 10th   | 10th lord       | Strong 10th lord & rāja yogas                                |         +2 |
| Leadership | Mars   | Mars strength   | Mars strong in Kendra                                         |         +1 |
| Leadership | Saturn | Weak Saturn     | Very weak Saturn + malefic assaults on 10th                  |         −2 |

---

### 6.5 Vision & Direction

| Trait            | Factor | Astro_Indicator | Condition                                                 | Score_Delta |
|------------------|--------|-----------------|-----------------------------------------------------------|------------:|
| Vision & Direction | Sun  | Sun in 9th/10th | Strong Sun in 9th/10th                                    |         +2 |
| Vision & Direction | Jupiter| Jupiter in 9th| Jupiter strong in 9th or aspecting 9th/10th               |         +2 |
| Vision & Direction | Rahu | Rahu in 9th     | Rahu afflicting 9th with weak Jupiter                     |         −2 |

---

### 6.6 Project Management

| Trait             | Factor | Astro_Indicator | Condition                                              | Score_Delta |
|-------------------|--------|-----------------|--------------------------------------------------------|------------:|
| Project Management| Saturn | Saturn strength | Saturn strong, in Kendra/Upachaya                     |         +2 |
| Project Management| 10th   | 10th lord       | Strong 10th lord, structured career                   |         +1 |
| Project Management| Mercury| Mercury support | Mercury reasonably strong (planning & communication)   |         +1 |
| Project Management| Moon   | Moon weak      | Very weak Moon (confused, inconsistent)               |         −2 |

---

### 6.7 Risk Taking Ability

| Trait             | Factor | Astro_Indicator   | Condition                                             | Score_Delta |
|-------------------|--------|-------------------|-------------------------------------------------------|------------:|
| Risk Taking Ability| Mars  | Mars strength     | Strong Mars in 3rd/5th/10th                           |         +2 |
| Risk Taking Ability| Rahu  | Rahu dignity      | Rahu strong in 3rd/10th without over-affliction       |         +1 |
| Risk Taking Ability| Saturn| Saturn inhibition | Over-strong Saturn on Lagna/3rd suppressing initiative|        −1 |
| Risk Taking Ability| Moon  | Fearful Moon      | Very weak/fearful Moon                                |        −1 |

---

## 7. Skills & Professional Traits

Traits:

- Technical/Digital Literacy  
- Data Analysis  
- Business Acumen  
- Financial Responsibility  
- Perfectionism & Detail  

### 7.1 Technical/Digital Literacy

| Trait                | Factor | Astro_Indicator   | Condition                                                         | Score_Delta |
|----------------------|--------|-------------------|-------------------------------------------------------------------|------------:|
| Technical/Digital Literacy | Rahu | Rahu in air signs | Rahu strong in Gemini/Libra/Aquarius, linked to 3rd/10th         |         +2 |
| Technical/Digital Literacy | Mercury| Mercury strong | Mercury strong in 3rd/6th/10th                                    |         +1 |
| Technical/Digital Literacy | Saturn| Saturn modern   | Saturn with Rahu in upachaya houses (tech/engineering inclination)|         +1 |
| Technical/Digital Literacy | Mercury| Mercury weak   | Mercury debilitated with malefics                                 |         −2 |

---

### 7.2 Data Analysis

| Trait        | Factor | Astro_Indicator | Condition                                                  | Score_Delta |
|--------------|--------|-----------------|------------------------------------------------------------|------------:|
| Data Analysis| Mercury| Mercury dignity | Mercury strong, especially in Virgo/Gemini                 |         +2 |
| Data Analysis| Saturn | Saturn with Mercury| Saturn + Mercury in air/earth signs                       |         +1 |
| Data Analysis| Moon   | Moon unstable   | Moon very unstable, harms focus                            |         −1 |

---

### 7.3 Business Acumen

| Trait          | Factor | Astro_Indicator | Condition                                                  | Score_Delta |
|----------------|--------|-----------------|------------------------------------------------------------|------------:|
| Business Acumen| 2nd    | 2nd lord        | Strong 2nd lord linked to 10th/11th                        |         +2 |
| Business Acumen| 11th   | 11th lord       | Strong 11th lord with benefic influence                    |         +2 |
| Business Acumen| Saturn | Saturn strength | Saturn strong in upachaya/Kendra                           |         +1 |
| Business Acumen| Jupiter| Jupiter weak    | Very weak Jupiter in 6/8/12 without relief                 |        −1 |

---

### 7.4 Financial Responsibility

| Trait                  | Factor | Astro_Indicator | Condition                                             | Score_Delta |
|------------------------|--------|-----------------|-------------------------------------------------------|------------:|
| Financial Responsibility| Saturn| Saturn & 2nd    | Saturn aspecting/protecting 2nd, not causing scarcity |         +2 |
| Financial Responsibility| Jupiter| Jupiter & 2nd/11th| Strong Jupiter in 2nd/11th                         |         +1 |
| Financial Responsibility| Rahu  | Rahu in 2nd     | Rahu heavily afflicting 2nd with weak 2nd lord       |         −2 |

---

### 7.5 Perfectionism & Detail

| Trait              | Factor | Astro_Indicator | Condition                                                  | Score_Delta |
|--------------------|--------|-----------------|------------------------------------------------------------|------------:|
| Perfectionism & Detail | Virgo| Virgo emphasis | Strong Virgo (Lagna/3rd/6th) with Mercury support         |         +2 |
| Perfectionism & Detail | Mercury| Mercury strong| Mercury strong and involved with 3rd/6th/10th              |         +1 |
| Perfectionism & Detail | Saturn| Saturn strict | Saturn + Virgo combination (high standards)                |         +1 |
| Perfectionism & Detail | Moon  | Overthinking   | Very anxious Moon with Saturn/Mercury                      |         −1 |

---

## 8. Pairwise Synergy & Compatibility Engine (High Level)

Use the existing **Synergy Engine** structure:

- Take all relevant traits (e.g., Trustworthiness, Work Ethic, Communication, Emotional Maturity, Leadership, Financial Responsibility, etc.) for Person A and Person B.
- Compute:

```text
Synergy = 5
  + LeadershipSupport_component
  + EmotionalCompatibility_component
  + WorkstyleComplement_component
  + ValuesAlignment_component
  + Conflict_component
clamped to [1, 10]
```

You can map:

- Leadership / Vision / Responsibility → leadership balance  
- Emotional Maturity / Kindness / Affection / Communication → emotional compatibility  
- Work Ethic / Teamwork / Project Management / Risk Taking → workstyle complement  
- Trustworthiness / Fairness / Shared Values / Financial Responsibility → values alignment  

Conflict can be derived from large gaps (≥4 points) in:

- Financial Responsibility  
- Risk Taking Ability  
- Trustworthiness  
- Emotional Maturity  

---

This grouped document defines:

- All traits  
- Their planet/house-based scoring logic  
- Core synergy categories  

You can now either:

- Use this document directly with an LLM  
- Or convert tables into JSON/database schemas for a full application.

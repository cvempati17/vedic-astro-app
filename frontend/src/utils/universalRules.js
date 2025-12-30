
export const UNIVERSAL_RULES = {
    engine: {
        metadata: {
            name: "Astrogravity Multi-Domain System",
            version: "1.1.0",
            domains: [
                "Business Partnership", "Foreign Travel & Immigration", "Career & Profession",
                "Marriage & Relationships", "Love & Romance", "Finance & Wealth",
                "Health & Well-being", "Education & Studies", "Family & Domestic Life",
                "Children & Parenthood", "Foreign Travel & Settlement", "Spirituality & Life Purpose",
                "Timing & Destiny", "Legal & Disputes", "Personality & Self",
                "Compatibility & Matching", "Marriage + Business Compatibility",
                "Compatibility Scoring", "Consultation Decision Tree"
            ],
            description: "Deterministic scoring system using astrological signals for multiple decision domains",
            author: "Decision-System Architect",
            date: "2025-12-30"
        },
        global_score_scale: { min: 0, max: 10, precision: 1 },
        weight_system: {
            promise: 0.4,
            activation: 0.3,
            timing: 0.2,
            partnership: 0.05,
            learning: 0.05
        }
    },
    houses: [
        { id: 1, weight: 0.05 }, { id: 2, weight: 0.15 }, { id: 3, weight: 0.05 },
        { id: 4, weight: 0.05 }, { id: 5, weight: 0.1 }, { id: 6, weight: -0.05 },
        { id: 7, weight: 0.1 }, { id: 8, weight: 0.1 }, { id: 9, weight: 0.1 },
        { id: 10, weight: 0.1 }, { id: 11, weight: 0.15 }, { id: 12, weight: -0.05 }
    ],
    rashis: [
        { id: 1, modifier: 1.1 }, { id: 2, modifier: 1.2 }, { id: 3, modifier: 1.0 },
        { id: 4, modifier: 0.9 }, { id: 5, modifier: 1.1 }, { id: 6, modifier: 1.0 },
        { id: 7, modifier: 0.95 }, { id: 8, modifier: 1.05 }, { id: 9, modifier: 1.15 },
        { id: 10, modifier: 1.0 }, { id: 11, modifier: 0.95 }, { id: 12, modifier: 0.9 }
    ],
    planets: [
        {
            name: "Sun", base_function: 5.0,
            dignity: { exalted: 7.0, own: 6.0, friendly: 5.5, neutral: 5.0, enemy: 4.5, debilitated: 4.0 },
            avastha: { old: 4.5, mature: 5.5, young: 5.0, infant: 4.0, dead: 3.0 },
            functional: { benefic_logic: "if_house_lord_in [1,5,9,10] then +1 else 0", malefic_logic: "if_house_lord_in [6,8,12] then -1 else 0" }
        },
        {
            name: "Moon", base_function: 5.0,
            dignity: { exalted: 7.0, own: 6.0, friendly: 5.5, neutral: 5.0, enemy: 4.5, debilitated: 4.0 },
            avastha: { old: 4.5, mature: 5.5, young: 5.0, infant: 4.0, dead: 3.0 },
            functional: { benefic_logic: "if_house_lord_in [4,5,7] then +1 else 0", malefic_logic: "if_waning then -0.5 else 0" }
        },
        {
            name: "Mercury", base_function: 5.0,
            dignity: { exalted: 7.0, own: 6.0, friendly: 5.5, neutral: 5.0, enemy: 4.5, debilitated: 4.0 },
            avastha: { old: 4.5, mature: 5.5, young: 5.0, infant: 4.0, dead: 3.0 },
            functional: { benefic_logic: "if_house_lord_in [3,5,9,10] then +1 else 0", malefic_logic: "if_conjunct_malefic then -0.5 else 0" }
        },
        {
            name: "Venus", base_function: 5.0,
            dignity: { exalted: 7.0, own: 6.0, friendly: 5.5, neutral: 5.0, enemy: 4.5, debilitated: 4.0 },
            avastha: { old: 4.5, mature: 5.5, young: 5.0, infant: 4.0, dead: 3.0 },
            functional: { benefic_logic: "if_house_lord_in [2,5,7] then +1 else 0", malefic_logic: "if_house_lord_in [6,8,12] then -1 else 0" }
        },
        {
            name: "Mars", base_function: 5.0,
            dignity: { exalted: 7.0, own: 6.0, friendly: 5.5, neutral: 5.0, enemy: 4.5, debilitated: 4.0 },
            avastha: { old: 4.5, mature: 5.5, young: 5.0, infant: 4.0, dead: 3.0 },
            functional: { benefic_logic: "if_house_lord_in [3,6,10] then +0.5 else 0", malefic_logic: "if_house_lord_in [6,8,12] then -1 else 0" }
        },
        {
            name: "Jupiter", base_function: 5.0,
            dignity: { exalted: 7.0, own: 6.0, friendly: 5.5, neutral: 5.0, enemy: 4.5, debilitated: 4.0 },
            avastha: { old: 4.5, mature: 5.5, young: 5.0, infant: 4.0, dead: 3.0 },
            functional: { benefic_logic: "if_house_lord_in [5,9,11] then +1.5 else 0", malefic_logic: "if_debilitated then -1 else 0" }
        },
        {
            name: "Saturn", base_function: 5.0,
            dignity: { exalted: 7.0, own: 6.0, friendly: 5.5, neutral: 5.0, enemy: 4.5, debilitated: 4.0 },
            avastha: { old: 4.5, mature: 5.5, young: 5.0, infant: 4.0, dead: 3.0 },
            functional: { benefic_logic: "if_house_lord_in [6,10,11] then +0.5 else 0", malefic_logic: "if_house_lord_in [1,4,7] then -1 else 0" }
        },
        {
            name: "Rahu", base_function: 4.0,
            dignity: { exalted: 6.0, own: 5.0, friendly: 4.5, neutral: 4.0, enemy: 3.5, debilitated: 3.0 },
            avastha: null,
            functional: { benefic_logic: "if_in [3,6,10,11] then +1 else 0", malefic_logic: "if_in [1,4,7] then -1.5 else 0" }
        },
        {
            name: "Ketu", base_function: 4.0,
            dignity: { exalted: 6.0, own: 5.0, friendly: 4.5, neutral: 4.0, enemy: 3.5, debilitated: 3.0 },
            avastha: null,
            functional: { benefic_logic: "if_in [3,6,9,12] then +1 else 0", malefic_logic: "if_in [1,5,7] then -1.5 else 0" }
        }
    ],
    combustion: {
        orbs: { Mercury: 14, Venus: 10, Mars: 17, Jupiter: 11, Saturn: 15, Moon: 12 },
        penalties: { full: -2.0, partial: -1.0 },
        mitigation_rules: { if_planet_in_own_sign: 0.5, if_planet_exalted: 1.0, if_retrograde: 0.3 }
    },
    aspects: {
        types: {
            conjunction: { orb: 8, strength: 1.0, grading: "full if orb <=4 else partial" },
            opposition: { orb: 8, strength: "0.8 if benefic else -0.8 if malefic", grading: "full if orb <=4 else partial" },
            trine: { orb: 8, strength: 0.7, grading: "full if orb <=4 else partial" },
            square: { orb: 8, strength: "-0.6 if malefic else 0.6 if benefic", grading: "full if orb <=4 else partial" },
            sextile: { orb: 6, strength: 0.5, grading: "full if orb <=3 else partial" }
        },
        decay_formula: "strength * (1 - (orb_distance / max_orb))"
    },
    planetary_phases: {
        waxing: 0.5,
        waning: -0.5,
        retrograde: { all: -0.3, mercury_venus: -0.1 }
    },
    house_planet_interaction_matrix: {
        1: { Sun: 1.2, Moon: 1.0, Mercury: 0.9, Venus: 1.0, Mars: 1.1, Jupiter: 1.0, Saturn: 0.8, Rahu: 0.7, Ketu: 0.7 },
        2: { Sun: 0.9, Moon: 1.1, Mercury: 1.2, Venus: 1.3, Mars: 0.8, Jupiter: 1.4, Saturn: 0.7, Rahu: 0.6, Ketu: 0.6 },
        3: { Sun: 1.0, Moon: 1.0, Mercury: 1.3, Venus: 1.1, Mars: 1.2, Jupiter: 1.0, Saturn: 0.9, Rahu: 0.8, Ketu: 0.8 },
        4: { Sun: 0.8, Moon: 1.3, Mercury: 1.0, Venus: 1.2, Mars: 0.9, Jupiter: 1.1, Saturn: 0.8, Rahu: 0.7, Ketu: 0.7 },
        5: { Sun: 1.1, Moon: 1.0, Mercury: 1.1, Venus: 1.2, Mars: 1.0, Jupiter: 1.4, Saturn: 0.7, Rahu: 1.0, Ketu: 0.9 },
        6: { Sun: 1.0, Moon: 0.8, Mercury: 1.1, Venus: 0.9, Mars: 1.3, Jupiter: 0.7, Saturn: 1.2, Rahu: 1.1, Ketu: 1.1 },
        7: { Sun: 0.9, Moon: 1.0, Mercury: 1.1, Venus: 1.4, Mars: 0.8, Jupiter: 1.1, Saturn: 0.9, Rahu: 0.7, Ketu: 0.7 },
        8: { Sun: 0.8, Moon: 0.9, Mercury: 0.9, Venus: 0.8, Mars: 1.2, Jupiter: 0.7, Saturn: 1.1, Rahu: 1.3, Ketu: 1.0 },
        9: { Sun: 1.2, Moon: 1.0, Mercury: 1.0, Venus: 1.0, Mars: 1.0, Jupiter: 1.5, Saturn: 0.8, Rahu: 0.9, Ketu: 1.2 },
        10: { Sun: 1.3, Moon: 0.9, Mercury: 1.2, Venus: 1.0, Mars: 1.2, Jupiter: 1.1, Saturn: 1.3, Rahu: 1.0, Ketu: 0.8 },
        11: { Sun: 1.1, Moon: 1.1, Mercury: 1.2, Venus: 1.2, Mars: 1.0, Jupiter: 1.3, Saturn: 1.1, Rahu: 1.2, Ketu: 0.9 },
        12: { Sun: 0.7, Moon: 0.8, Mercury: 0.9, Venus: 0.8, Mars: 0.9, Jupiter: 0.8, Saturn: 1.0, Rahu: 1.1, Ketu: 1.4 }
    },
    dasha_system: {
        vimshottari: {
            periods: { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 },
            calculation: "based_on_moon_nakshatra",
            sub_periods: "antardasha_proportional"
        }
    },
    domains: {
        business_partnership: {
            house_relevances: { 7: 0.9, 10: 0.5, 2: 0.4, 11: 0.4, 6: 0.2 },
            key_planets: ["Venus", "Mercury", "Jupiter"],
            yogas: [
                { name: "partnership_yoga", condition: "lord_7_in_10 or lord_10_in_7", signal: 2.0 },
                { name: "business_success_yoga", condition: "mercury_aspects_7 and jupiter_benefic", signal: 1.5 },
                { name: "malefic_partnership", condition: "saturn_in_7 or rahu_in_7", signal: -1.5 }
            ],
            outcome_axes: { stability: "(house_7_score + house_10_score) / 2", growth: "house_11_score * 1.2" },
            what_is: "Ranked business types (e.g., Trade, Service, Manufacturing) based on planet strengths",
            why_templates: {
                ranking: "Ranking due to {planet} in {house} with {dignity} and {aspect} from {other_planet}, functional {benefic/malefic} status.",
                outcome: "Outcome influenced by conjunction of {planets} in {rashi}, avastha {avastha}."
            },
            when: { best: "during_jupiter_dasha or venus_transit_7", worst: "during_saturn_dasha if malefic" },
            where_what: "Line of business (e.g., Mercury strong: IT/Communication; Mars: Metals/Engineering)",
            chart_intensity: "Table of scores over dasha periods"
        },
        foreign_travel_immigration: {
            house_relevances: { 9: 0.8, 12: 0.7, 3: 0.3, 8: 0.2 },
            key_planets: ["Rahu", "Moon", "Jupiter"],
            yogas: [
                { name: "foreign_yoga", condition: "lord_12_in_9 or rahu_in_12", signal: 2.0 },
                { name: "travel_success", condition: "jupiter_aspects_9", signal: 1.5 },
                { name: "delay_yoga", condition: "saturn_aspects_12", signal: -1.0 }
            ],
            outcome_axes: { settlement: "house_12_score * 1.3", travel: "house_9_score + house_3_score" },
            what_is: "Likelihood of foreign travel/immigration over time",
            why_templates: {
                likelihood: "{Planet} placement in {house} with {aspect}, dignity {dignity} indicates opportunities due to functional {benefic} nature."
            },
            when: { best: "rahu_dasha or jupiter_transit_9", worst: "saturn_dasha if afflicted" },
            where_what: "Direction (e.g., Rahu: North; Jupiter: East)",
            chart_intensity: "Scores over 5-10 years with transit peaks"
        },
        career_profession: {
            house_relevances: { 10: 0.9, 6: 0.3, 11: 0.4, 2: 0.2 },
            key_planets: ["Saturn", "Sun", "Mercury"],
            yogas: [
                { name: "raja_yoga", condition: "lord_10_conjunct_lord_9", signal: 2.5 },
                { name: "career_boost", condition: "sun_in_10 exalted", signal: 1.5 },
                { name: "obstacles", condition: "saturn_debilitated_in_10", signal: -1.5 }
            ],
            outcome_axes: { growth: "house_10_score * 1.5", stability: "house_6_score + house_11_score" },
            what_is: "Career shape over time, possible fields ranked",
            why_templates: {
                shape: "Career influenced by {planet} avastha {avastha}, aspect from {other}, in {rashi}."
            },
            when: { best: "saturn_dasha if benefic, sun_transit_10", worst: "mars_dasha if malefic" },
            where_what: "Profession line (e.g., Sun: Government; Mercury: Business)",
            chart_intensity: "Intensity table per dasha/antardasha"
        },
        marriage_relationships: {
            house_relevances: { 7: 0.9, 2: 0.3, 4: 0.2, 5: 0.2 },
            key_planets: ["Venus", "Jupiter", "Moon"],
            yogas: [
                { name: "marriage_yoga", condition: "venus_in_7 own_sign", signal: 2.0 },
                { name: "harmony_yoga", condition: "jupiter_aspects_7", signal: 1.5 },
                { name: "delay_yoga", condition: "saturn_in_7", signal: -1.5 }
            ],
            outcome_axes: { stability: "house_7_score * 1.4", harmony: "house_4_score + house_2_score" },
            what_is: "Marriage timing and quality over time",
            why_templates: {
                quality: "Due to {planet} conjunction with {other}, functional benefic, in {house}."
            },
            when: { best: "venus_dasha", worst: "rahu_dasha if afflicted" },
            where_what: "Spouse role/characteristics",
            chart_intensity: "Scores per year for 10 years"
        },
        love_romance: {
            house_relevances: { 5: 0.8, 7: 0.4, 11: 0.2 },
            key_planets: ["Venus", "Moon", "Mars"],
            yogas: [
                { name: "romance_yoga", condition: "venus_aspects_5", signal: 1.8 },
                { name: "passion_yoga", condition: "mars_conjunct_venus", signal: 1.2 },
                { name: "heartbreak", condition: "ketu_in_5", signal: -1.5 }
            ],
            outcome_axes: { intensity: "house_5_score * 1.3", fulfillment: "house_11_score" },
            what_is: "Romantic prospects over time",
            why_templates: {
                prospects: "{Planet} in {rashi} with {avastha}, aspected by {benefic/malefic}."
            },
            when: { best: "venus_transit_5", worst: "saturn_aspect_5" },
            where_what: "Type of romance (e.g., passionate, stable)",
            chart_intensity: "Monthly projections for 24 months"
        },
        finance_wealth: {
            house_relevances: { 2: 0.9, 11: 0.9, 5: 0.3, 8: 0.7, 9: 0.3 },
            key_planets: ["Jupiter", "Venus", "Mercury"],
            yogas: [
                { name: "dhana_yoga_1", condition: "jupiter_aspects_2 or venus_in_2", signal: 1.5 },
                { name: "dhana_yoga_2", condition: "lord_2_in_11 or lord_11_in_2", signal: 2.0 },
                { name: "loss_yoga", condition: "lord_12_aspects_2", signal: -1.5 }
            ],
            outcome_axes: { accumulation: "(house_2 + house_11) / 2 * 1.5", risks: "house_5 + house_8" },
            what_is: "Financial situation over periods",
            why_templates: {
                situation: "Wealth due to {planet} dignity {dignity}, conjunction {conjunction}."
            },
            when: { best: "jupiter_dasha", worst: "saturn_dasha if malefic" },
            where_what: "Sources (e.g., inheritance house_8, gains house_11)",
            chart_intensity: "Quarterly scores for 5 years"
        },
        health_wellbeing: {
            house_relevances: { 1: 0.5, 6: 0.8, 8: 0.7, 12: 0.4 },
            key_planets: ["Sun", "Moon", "Mars", "Saturn"],
            yogas: [
                { name: "health_yoga", condition: "sun_exalted_in_1", signal: 2.0 },
                { name: "disease_yoga", condition: "lord_6_in_1", signal: -1.5 },
                { name: "longevity_yoga", condition: "jupiter_aspects_8", signal: 1.5 }
            ],
            outcome_axes: { vitality: "house_1_score * 1.2", issues: "(house_6 + house_8 + house_12) / 3 * -1" },
            what_is: "Health condition over time, affected body parts",
            why_templates: {
                condition: "Health impacted by {planet} in {house}, avastha {avastha}, functional malefic."
            },
            when: { best: "sun_dasha", worst: "saturn_dasha" },
            where_what: "Body parts (e.g., house_1: head; house_6: stomach)",
            chart_intensity: "Annual health scores"
        },
        education_studies: {
            house_relevances: { 4: 0.4, 5: 0.7, 9: 0.5, 2: 0.2 },
            key_planets: ["Mercury", "Jupiter"],
            yogas: [
                { name: "buddhi_yoga", condition: "mercury_conjunct_jupiter", signal: 2.0 },
                { name: "education_success", condition: "lord_5_in_9", signal: 1.5 },
                { name: "obstacles", condition: "rahu_in_5", signal: -1.5 }
            ],
            outcome_axes: { aptitude: "house_5_score * 1.4", higher: "house_9_score" },
            what_is: "Ranked fields (Legal, Accounting, Finance etc.)",
            why_templates: {
                ranking: "Field ranked high due to {planet} aspect on {house}, dignity {dignity}."
            },
            when: { best: "mercury_dasha", worst: "ketu_dasha" },
            where_what: "Fields (e.g., Mercury: Commerce; Jupiter: Law)",
            chart_intensity: "Scores per education phase (school, college)"
        },
        family_domestic_life: {
            house_relevances: { 2: 0.5, 4: 0.8, 7: 0.2 },
            key_planets: ["Moon", "Venus", "Jupiter"],
            yogas: [
                { name: "family_harmony", condition: "moon_in_4 own_sign", signal: 1.8 },
                { name: "domestic_bliss", condition: "venus_aspects_4", signal: 1.2 },
                { name: "disputes", condition: "mars_in_4", signal: -1.5 }
            ],
            outcome_axes: { happiness: "house_4_score * 1.3", relations: "house_2_score" },
            what_is: "Family dynamics over time",
            why_templates: {
                dynamics: "Due to {planet} in {rashi}, conjunction {conjunction}."
            },
            when: { best: "moon_dasha", worst: "mars_dasha" },
            where_what: "Roles in family",
            chart_intensity: "Decadal scores"
        },
        children_parenthood: {
            house_relevances: { 5: 0.9, 9: 0.3, 2: 0.2 },
            key_planets: ["Jupiter", "Moon"],
            yogas: [
                { name: "putra_yoga", condition: "jupiter_in_5", signal: 2.0 },
                { name: "happiness_from_children", condition: "lord_5_benefic", signal: 1.5 },
                { name: "obstacles", condition: "saturn_aspects_5", signal: -1.5 }
            ],
            outcome_axes: { prospects: "house_5_score * 1.5" },
            what_is: "Parenthood timing and quality",
            why_templates: {
                quality: "{Planet} functional benefic, aspect {aspect}."
            },
            when: { best: "jupiter_dasha", worst: "rahu_dasha" },
            where_what: "Number/gender hints",
            chart_intensity: "Scores over reproductive years"
        },
        foreign_travel_settlement: {
            house_relevances: { 12: 0.8, 9: 0.6, 3: 0.2, 7: 0.2 },
            key_planets: ["Rahu", "Ketu", "Moon"],
            yogas: [
                { name: "settlement_yoga", condition: "lord_12_in_9", signal: 2.0 },
                { name: "abroad_success", condition: "rahu_in_12 benefic", signal: 1.5 }
            ],
            outcome_axes: { success: "house_12_score * 1.2" },
            what_is: "Settlement prospects",
            why_templates: {
                prospects: "Due to {planet} in foreign house, dignity {dignity}."
            },
            when: { best: "rahu_dasha", worst: "saturn_delay" },
            where_what: "Country directions",
            chart_intensity: "5-year projections"
        },
        spirituality_life_purpose: {
            house_relevances: { 9: 0.7, 12: 0.8, 5: 0.2, 8: 0.3 },
            key_planets: ["Jupiter", "Ketu", "Sun"],
            yogas: [
                { name: "spiritual_yoga", condition: "ketu_in_12", signal: 2.0 },
                { name: "guru_yoga", condition: "jupiter_exalted", signal: 1.5 }
            ],
            outcome_axes: { awakening: "house_12_score + house_9_score" },
            what_is: "Spiritual path over life",
            why_templates: {
                path: "{Planet} avastha mature, aspect from guru."
            },
            when: { best: "ketu_dasha", worst: "rahu_materialism" },
            where_what: "Purpose (e.g., teaching, healing)",
            chart_intensity: "Lifetime phases"
        },
        timing_destiny: {
            house_relevances: { all: 0.5 },
            key_planets: "all",
            yogas: [
                { name: "destiny_yoga", condition: "strong_lagna_lord", signal: 2.0 }
            ],
            outcome_axes: { overall: "average_all_scores" },
            what_is: "Key life timings",
            why_templates: {
                timing: "Based on dasha of {planet}."
            },
            when: { best: "benefic_dashas", worst: "malefic_dashas" },
            where_what: "Destiny markers",
            chart_intensity: "Full dasha timeline"
        },
        legal_disputes: {
            house_relevances: { 6: 0.9, 8: 0.4, 12: 0.3 },
            key_planets: ["Mars", "Saturn", "Rahu"],
            yogas: [
                { name: "victory_yoga", condition: "mars_strong_in_6", signal: 1.5 },
                { name: "loss_yoga", condition: "lord_6_weak", signal: -1.5 }
            ],
            outcome_axes: { resolution: "house_6_score * -1 if negative" },
            what_is: "Legal outcomes over time",
            why_templates: {
                outcome: "Due to {planet} square aspect, malefic."
            },
            when: { best: "jupiter_transit_6", worst: "saturn_dasha" },
            where_what: "Type of dispute (civil, criminal)",
            chart_intensity: "Case timelines"
        },
        personality_self: {
            house_relevances: { 1: 0.9, 5: 0.3, 9: 0.2 },
            key_planets: ["Sun", "Moon", "Lagna Lord"],
            yogas: [
                { name: "strong_self", condition: "sun_in_1 exalted", signal: 2.0 }
            ],
            outcome_axes: { traits: "house_1_score * 1.5" },
            what_is: "Personality traits",
            why_templates: {
                traits: "{Planet} in lagna, rashi {rashi}."
            },
            when: { best: "sun_dasha", worst: "rahu_confusion" },
            where_what: "Self roles",
            chart_intensity: "Lifelong stability"
        },
        compatibility_matching: {
            house_relevances: { 7: 0.5, 5: 0.3 },
            key_planets: ["Venus", "Moon"],
            yogas: [
                { name: "guna_milan", condition: "ashtakoota_score > 18", signal: 2.0 }
            ],
            outcome_axes: { match: "score" },
            what_is: "Compatibility Match",
            why_templates: { match: "Score based on..." },
            when: { best: "N/A", worst: "N/A" },
            where_what: "Match",
            chart_intensity: "N/A"
        }
    }
};

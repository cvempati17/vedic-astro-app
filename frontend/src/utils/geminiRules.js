
export const GEMINI_RULES = {
    settings: {
        ayanamsa: "Lahiri",
        house_system: "Whole Sign",
        calculation_engine: "Swiss Ephemeris",
        output_format: "JSON"
    },
    output_schema: {
        user_details: { name: "", dob: "", tob: "", pob: "" },
        selected_domain: "String",
        summary_prediction: {
            status: "Excellent | Good | Average | Challenging",
            primary_text: "String explaining the core outcome."
        },
        astrological_reasoning: [],
        timing_analysis: {
            current_dasha: "Mahadasha-Antardasha",
            favorable_periods: [],
            challenging_periods: []
        },
        specifics: {
            direction: "",
            body_part: "",
            profession_type: []
        },
        intensity_chart_data: {
            labels: [],
            datasets: []
        }
    },
    domains: {
        career: {
            primary_houses: [1, 2, 6, 10, 11],
            karaka_planets: ["Saturn", "Sun", "Mercury", "Mars"],
            rules: [
                { if: "lord_10_in_6_8_12", outcome: "Instability or Foreign Connection", why: "Dusthana placement of Career lord indicates struggle or working in isolation/foreign lands.", effect: "Negative" },
                { if: "benefic_in_10", outcome: "High Reputation and Ethical Career", why: "Benefic influence on the 10th house grants professional fame.", effect: "Positive" }
            ],
            business_vs_job_logic: [
                { check: "strength_7_vs_6", why: "7th House (Business) stronger than 6th (Service)." }
            ]
        },
        finance: {
            primary_houses: [2, 11, 5, 9],
            karaka_planets: ["Jupiter", "Venus"],
            rules: [
                { if: "dhana_yoga", outcome: "Excellent Wealth Potential", why: "Connection between houses of wealth and luck creates self-generating income.", effect: "Positive" },
                { if: "ketu_in_2", outcome: "Fluctuating Wealth / Detachment from Money", why: "Ketu dissolves the significations of the house it sits in.", effect: "Neutral" }
            ]
        },
        health: {
            primary_houses: [1, 6, 8, 12],
            body_mapping: {
                1: "Head", 2: "Face/Throat", 3: "Shoulders/Lungs", 4: "Chest/Heart",
                5: "Stomach", 6: "Intestines", 7: "Kidneys/Reproductive",
                8: "Excretory/Sexual", 9: "Thighs", 10: "Knees", 11: "Ankles", 12: "Feet"
            },
            rules: [
                { if: "lord_1_weak_or_afflicted", outcome: "Low Vitality", why: "The Lagna Lord represents physical strength; affliction reduces immunity.", effect: "Negative" },
                { if: "vipareeta_raja_yoga", outcome: "Sudden recovery after illness", why: "Lord of disease in the house of longevity can cancel out negative effects.", effect: "Positive" }
            ]
        },
        education: {
            primary_houses: [2, 4, 5, 9],
            karaka_planets: ["Mercury", "Jupiter"],
            stream_selection: [
                { if: "mars_aspects_4_or_5", outcome: "Engineering/Technical" },
                { if: "mercury_sun_conjunct", outcome: "Accounting/Commerce/Math" },
                { if: "jupiter_moon_conjunct", outcome: "Teaching/Psychology/Humanities" },
                { if: "venus_influence", outcome: "Arts/Creative/Media" },
                { if: "rahu_influence", outcome: "Research/Foreign Studies/Tech" }
            ]
        },
        business_partnership: {
            primary_houses: [7],
            rules: [
                { if: "lord_7_in_6_8_12", outcome: "Conflicts in partnership likely.", why: "7th Lord in dusthana indicates loss or dispute in partnership.", effect: "Negative" },
                { if: "malefic_in_7", outcome: "Partner may be dominating or deceitful.", why: "Malefic influence on partnership house.", effect: "Negative" }
            ]
        },
        foreign_travel: {
            primary_houses: [3, 9, 12],
            rules: [
                { if: "lord_12_in_1_or_lord_4_in_12", outcome: "Permanent Settlement likely.", why: "Connection between home/self and foreign house.", effect: "Positive" },
                { if: "moveable_in_12", outcome: "Frequent Travel.", why: "Moveable signs in 12th indicate constant movement.", effect: "Neutral" }
            ]
        },
        marriage: {
            primary_houses: [7, 2, 4, 8],
            karaka_planets: ["Venus", "Jupiter"],
            rules: [
                { if: "mangal_dosha", outcome: "Potential delay or conflict.", why: "Mars in 1, 2, 4, 7, 8, 12 causes Kuja Dosha.", effect: "Negative" },
                { if: "lord_7_conjunct_venus", outcome: "Love Marriage potential high.", why: "7th Lord with Karaka of Love.", effect: "Positive" }
            ]
        }
    },
    compatibility: {
        logic: {
            marriage: "Standard Ashta Koota (36 points) + Mahendra Koota (Longevity).",
            business: "Focus on Vashya (Control), Tara (Destiny), and Graha Maitri (Psychological friendship)."
        }
    }
};

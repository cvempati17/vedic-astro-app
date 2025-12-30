export const SIGN_INTERPRETATIONS = {
    0: { // Aries
        element: 'Fire',
        quality: 'Cardinal',
        ruler: 'Mars',
        traits: "Dynamic, courageous, and pioneering. You have a strong will and are a natural leader.",
        ascendant: "You approach life with enthusiasm and directness. You are action-oriented and may be impulsive.",
        sun: "Your core self is assertive and independent. You thrive on challenges and initiating new projects.",
        moon: "You react emotionally with speed and passion. You need independence and can be quick-tempered but forgive easily."
    },
    1: { // Taurus
        element: 'Earth',
        quality: 'Fixed',
        ruler: 'Venus',
        traits: "Reliable, patient, and practical. You value stability, comfort, and material security.",
        ascendant: "You project a calm and steady presence. You move at your own pace and can be stubborn.",
        sun: "You are determined and persistent. You value beauty and luxury, and work hard to achieve security.",
        moon: "Your emotions are stable and grounded. You find comfort in routine, good food, and physical touch."
    },
    2: { // Gemini
        element: 'Air',
        quality: 'Mutable',
        ruler: 'Mercury',
        traits: "Adaptable, communicative, and intellectual. You are curious and love to learn and share ideas.",
        ascendant: "You appear youthful and lively. You are constantly in motion and love to talk and socialize.",
        sun: "You identify as a thinker and communicator. You need variety and mental stimulation to feel alive.",
        moon: "You process emotions intellectually. You can be restless and need to talk through your feelings."
    },
    3: { // Cancer
        element: 'Water',
        quality: 'Cardinal',
        ruler: 'Moon',
        traits: "Nurturing, sensitive, and protective. You are deeply connected to family and home.",
        ascendant: "You come across as gentle and caring. You are sensitive to your environment and others' moods.",
        sun: "Your ego is tied to your ability to care for others. You are intuitive and value emotional security.",
        moon: "You are extremely sensitive and moody. You have a strong memory and deep emotional attachments."
    },
    4: { // Leo
        element: 'Fire',
        quality: 'Fixed',
        ruler: 'Sun',
        traits: "Creative, generous, and dramatic. You love to be the center of attention and have a warm heart.",
        ascendant: "You have a regal and confident presence. You radiate warmth and expect respect from others.",
        sun: "You are a natural leader who seeks recognition. You are loyal and express yourself creatively.",
        moon: "You need to feel special and appreciated. You are emotionally dramatic but very generous and loyal."
    },
    5: { // Virgo
        element: 'Earth',
        quality: 'Mutable',
        ruler: 'Mercury',
        traits: "Analytical, practical, and service-oriented. You pay attention to detail and strive for perfection.",
        ascendant: "You appear neat, modest, and intelligent. You are observant and may be critical of yourself and others.",
        sun: "You find purpose in work and service. You are efficient, organized, and health-conscious.",
        moon: "You find emotional security in order and routine. You analyze your feelings and want to be useful."
    },
    6: { // Libra
        element: 'Air',
        quality: 'Cardinal',
        ruler: 'Venus',
        traits: "Diplomatic, charming, and fair. You value relationships, harmony, and balance.",
        ascendant: "You are polite, graceful, and attractive. You seek partnership and avoid conflict.",
        sun: "You define yourself through your relationships. You strive for justice and aesthetic beauty.",
        moon: "You need peace and harmony to feel safe. You can be indecisive because you see all sides."
    },
    7: { // Scorpio
        element: 'Water',
        quality: 'Fixed',
        ruler: 'Mars/Ketu',
        traits: "Intense, passionate, and secretive. You have deep emotional power and investigative skills.",
        ascendant: "You have a magnetic and penetrating gaze. You are private and project an aura of mystery.",
        sun: "You are driven by a desire for transformation and power. You are resilient and feel things deeply.",
        moon: "Your emotions are intense and all-consuming. You are prone to jealousy but are incredibly loyal."
    },
    8: { // Sagittarius
        element: 'Fire',
        quality: 'Mutable',
        ruler: 'Jupiter',
        traits: "Optimistic, adventurous, and philosophical. You seek truth, freedom, and higher knowledge.",
        ascendant: "You appear jovial, open, and enthusiastic. You love to travel and explore new horizons.",
        sun: "You are a seeker of wisdom. You are honest, blunt, and have a strong moral compass.",
        moon: "You need freedom and space emotionally. You are optimistic and find comfort in philosophy or faith."
    },
    9: { // Capricorn
        element: 'Earth',
        quality: 'Cardinal',
        ruler: 'Saturn',
        traits: "Ambitious, disciplined, and responsible. You value structure, tradition, and long-term goals.",
        ascendant: "You appear serious, mature, and reserved. You are hardworking and concerned with reputation.",
        sun: "You are driven to achieve and succeed. You are practical, patient, and can be a bit pessimistic.",
        moon: "You control your emotions and value self-sufficiency. You feel safe when you are in charge."
    },
    10: { // Aquarius
        element: 'Air',
        quality: 'Fixed',
        ruler: 'Saturn/Rahu',
        traits: "Innovative, humanitarian, and independent. You value intellect, friendship, and social change.",
        ascendant: "You appear unique, friendly, but detached. You march to the beat of your own drum.",
        sun: "You identify as a rebel or visionary. You are logical and care about the collective good.",
        moon: "You detach from emotions to analyze them. You need freedom and friendship more than intimacy."
    },
    11: { // Pisces
        element: 'Water',
        quality: 'Mutable',
        ruler: 'Jupiter',
        traits: "Compassionate, artistic, and spiritual. You are intuitive and connected to the unseen world.",
        ascendant: "You appear dreamy, soft, and empathetic. You are adaptable and sensitive to vibes.",
        sun: "You are a dreamer and a healer. You are selfless and imaginative, but can be escapist.",
        moon: "You are a psychic sponge for others' emotions. You need solitude to recharge your sensitive soul."
    }
};

export const HOUSE_INTERPRETATIONS = {
    1: "Self, Appearance, Personality",
    2: "Wealth, Family, Speech",
    3: "Siblings, Courage, Communication",
    4: "Mother, Home, Happiness",
    5: "Children, Creativity, Intelligence",
    6: "Enemies, Health, Service",
    7: "Spouse, Partnerships, Business",
    8: "Longevity, Transformation, Occult",
    9: "Father, Guru, Luck, Dharma",
    10: "Career, Status, Karma",
    11: "Gains, Friends, Aspirations",
    12: "Loss, Liberation, Foreign Lands"
};

export const PLANET_KEYWORDS = {
    Sun: "Soul, Authority, Father, Vitality",
    Moon: "Mind, Emotions, Mother, Comfort",
    Mars: "Energy, Brothers, Courage, Land",
    Mercury: "Intellect, Speech, Business, Logic",
    Jupiter: "Wisdom, Wealth, Children, Guru",
    Venus: "Love, Luxury, Arts, Spouse",
    Saturn: "Discipline, Delay, Servants, Longevity",
    Rahu: "Desire, Illusion, Foreign, Innovation",
    Ketu: "Detachment, Spirituality, Moksha, Intuition",
    Ascendant: "Self, Physique, Nature, Beginning"
};

export const PLANET_HOUSE_INTERPRETATIONS = {
    // 1st House
    "Sun-1": "Sun in the 1st House gives a strong personality, self-confidence, and a royal bearing. You may have a bit of an ego but are a natural leader. Health is generally good, and you have strong recuperative powers.",
    "Moon-1": "Moon in the 1st House makes you emotional, sensitive, and moody. Your appearance may change with your feelings. You are popular and approachable but easily influenced by your environment.",
    "Mars-1": "Mars in the 1st House gives immense energy, courage, and a competitive spirit. You are action-oriented but may be prone to hasty decisions, anger, or minor injuries to the head.",
    "Mercury-1": "Mercury in the 1st House makes you intelligent, curious, and youthful in appearance. You are a great communicator and love learning. You approach life analytically.",
    "Jupiter-1": "Jupiter in the 1st House is a blessing, often protecting the self from harm. You are optimistic, generous, and generally healthy. You likely have a wise and dignified presence.",
    "Venus-1": "Venus in the 1st House gives beauty, charm, and a pleasant personality. You value harmony and are likely attractive to others. You enjoy the comforts of life and have artistic tastes.",
    "Saturn-1": "Saturn in the 1st House adds seriousness, maturity, and discipline. You may have had a childhood with much responsibility. You are hardworking and enduring but can be prone to melancholy.",
    "Rahu-1": "Rahu in the 1st House makes you unconventional and eager to stand out. You may reinvent yourself often. You have a strong desire for personal recognition and may act in unique ways.",
    "Ketu-1": "Ketu in the 1st House can make you detached from your self-image or physical body. You are intuitive and may seem mysterious or introverted. You are likely on a spiritual path.",

    // Generic fallbacks for other houses (Generated pattern: Planet-House)
    // We can add detailed ones for important positions later.
    "Sun-10": "Sun in the 10th House: Excellent for career and authority. You are likely to hold high positions and be respected in your field.",
    "Mars-10": "Mars in the 10th House (Digbala): You have great drive for career success. You are ambitious and can be a leader in technical or military fields.",
    "Saturn-7": "Saturn in the 7th House (Digbala): Partnerships are taken seriously. Marriage may be delayed or with a mature partner. You are loyal and committed.",
    "Jupiter-4": "Jupiter in the 4th House: Great happiness at home. You likely have a big house, good education, and a supportive mother.",
    "Venus-4": "Venus in the 4th House: Your home is beautiful and peaceful. You enjoy domestic happiness and likely have nice vehicles.",
    "Moon-4": "Moon in the 4th House (Digbala): Strong emotional attachment to home and mother. You need a secure base to feel happy.",
    "Mercury-4": "Mercury in the 4th House: Learning and communication happen at home. You might work from home or have a large library.",

    // Default generator templates
    "default": (planet, house) => `${planet} in the ${house} House affects your ${HOUSE_INTERPRETATIONS[house].split(',')[0].toLowerCase()}. ${PLANET_KEYWORDS[planet]} themes will play out here. The energy of ${planet} is directed towards ${HOUSE_INTERPRETATIONS[house]} matters.`
};

export const CONJUNCTION_INTERPRETATIONS = {
    "Sun-Mercury": "Budhaditya Yoga: Excellent intelligence and communication skills. You are likely good with numbers/business.",
    "Moon-Mars": "Chandra Mangala Yoga: Wealth through enterprise. You are emotionally passionate and financially driven.",
    "Moon-Jupiter": "Gaja Kesari Yoga: Fame, wisdom, and virtue. You are respected in society.",
    "Sun-Saturn": "Conflict between authority and discipline. You may feel restricted by father figures or government.",
    "Mars-Saturn": "Struggle and perseverance. Great energy (Mars) meets resistance (Saturn), leading to hard-won success."
};

export const ASPECT_INTERPRETATIONS = {
    Sun: "Sun's aspect adds visibility, ego, and vitality to this house. It illuminates the matters here but can burn if too intense.",
    Moon: "Moon's aspect brings emotional connection, fluctuation, and adaptability to this house. You care deeply about these matters.",
    Mars: "Mars' aspect energizes this house but can cause conflict, aggression, or heat. It creates a drive to conquer this area.",
    Mercury: "Mercury's aspect brings intelligence, communication, and analytical skills to this house. You think a lot about these matters.",
    Jupiter: "Jupiter's aspect is the most beneficial. It brings protection, expansion, luck, and wisdom to this house. It magnifies good results.",
    Venus: "Venus' aspect brings harmony, beauty, luxury, and desire. It eases conflict and makes this area of life pleasant.",
    Saturn: "Saturn's aspect brings delay, discipline, responsibility, and structure. It minimizes fluff and demands hard work here.",
    Rahu: "Rahu's aspect amplifies desire, obsession, and illusion. It can blow things out of proportion or bring foreign influences.",
    Ketu: "Ketu's aspect brings detachment, separation, or spiritual insight. You may feel a sense of lack or disinterest in this area."
};


export const BHAVA_SIGNIFICATIONS = {
    1: ["Physical Body & Vitality", "Self-Image & Confidence", "General Health", "Personality & Temperament", "New Beginnings"],
    2: ["Accumulated Wealth (Savings)", "Family Lineage", "Speech & Voice", "Food Habits", "Right Eye"],
    3: ["Younger Siblings", "Courage & Valor", "Communication Skills", "Short Travels", "Hands & Shoulders"],
    4: ["Mother & Maternal Relations", "Fixed Assets & Vehicles", "Inner Happiness & Peace", "Basic Education", "Heart & Chest"],
    5: ["Children & Progeny", "Intelligence & Creativity", "Past Life Karma (Purva Punya)", "Speculation & Romance", "Mantras & Wisdom"],
    6: ["Enemies & Opposition", "Diseases & Health Issues", "Debts & Litigation", "Daily Work & Service", "Pets & Maternal Uncle"],
    7: ["Spouse & Marriage", "Business Partnerships", "Public Image", "Legal Contracts", "Travel Abroad"],
    8: ["Longevity & Lifespan", "Sudden Events & Transformation", "Occult & Mysticism", "Inheritance & Wills", "Sexual Organs"],
    9: ["Father & Guru", "Higher Learning & Wisdom", "Fortune & Luck (Bhagya)", "Long Distance Travel", "Dharma & Ethics"],
    10: ["Career & Profession", "Social Status & Fame", "Authority & Government", "Karma & Action", "Public Life"],
    11: ["Gains & Profits", "Elder Siblings", "Social Networks & Friends", "Fulfillment of Desires", "Professional Income"],
    12: ["Losses & Expenses", "Isolation & Solitude", "Foreign Lands & Settlement", "Moksha & Spirituality", "Subconscious Mind"]
};

export const ASTRO_QUOTES = [
    "The stars impel, they do not compel.",
    "Astrology is a language. If you understand this language, the sky speaks to you.",
    "A physician without a knowledge of Astrology has no right to call himself a physician. - Hippocrates",
    "As above, so below. As within, so without.",
    "Your path is written in the stars, but your feet determine the journey.",
    "Character is destiny. - Heraclitus"
];

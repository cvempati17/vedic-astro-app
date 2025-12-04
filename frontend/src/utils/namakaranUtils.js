export const NAKSHATRA_SYLLABLES = {
    "Ashwini": ["Chu", "Che", "Cho", "La"],
    "Bharani": ["Li", "Lu", "Le", "Lo"],
    "Krittika": ["A", "Ee", "U", "Ae"],
    "Rohini": ["O", "Va", "Vi", "Vu"],
    "Mrigashira": ["Ve", "Vo", "Ka", "Ki"],
    "Ardra": ["Ku", "Gha", "Nga", "Chha"],
    "Punarvasu": ["Ke", "Ko", "Ha", "Hi"],
    "Pushya": ["Hu", "He", "Ho", "Da"],
    "Ashlesha": ["De", "Doo", "De", "Daw"],
    "Magha": ["Ma", "Mi", "Mu", "Me"],
    "Purva Phalguni": ["Mo", "Ta", "Ti", "Tu"],
    "Uttara Phalguni": ["Te", "To", "Pa", "Pi"],
    "Hasta": ["Pu", "Sha", "Na", "Tha"],
    "Chitra": ["Pe", "Po", "Ra", "Ri"],
    "Swati": ["Ru", "Re", "Ro", "Ta"],
    "Vishakha": ["Ti", "Tu", "Te", "To"],
    "Anuradha": ["Na", "Ni", "Nu", "Ne"],
    "Jyeshtha": ["No", "Ya", "Yi", "Yu"],
    "Mula": ["Ye", "Yo", "Bha", "Bhi"],
    "Purva Ashadha": ["Bhu", "Dha", "Pha", "Dha"],
    "Uttara Ashadha": ["Bhe", "Bho", "Ja", "Ji"],
    "Shravana": ["Khi", "Khu", "Khe", "Kho"],
    "Dhanishta": ["Ga", "Gi", "Gu", "Ge"],
    "Shatabhisha": ["Go", "Sa", "Si", "Su"],
    "Purva Bhadrapada": ["Se", "So", "Da", "Di"],
    "Uttara Bhadrapada": ["Du", "Tha", "Jha", "Na"],
    "Revati": ["De", "Do", "Cha", "Chi"]
};

// Sample Database - In a real app, this would be much larger or fetched from an API
const NAME_DATABASE = [
    // Shiva (Male)
    { name: "Shiva", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "S", meaning: "The Auspicious One" },
    { name: "Shankar", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "S", meaning: "Beneficent, Bringer of happiness" },
    { name: "Shambhu", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "S", meaning: "Abode of Joy" },
    { name: "Mahesh", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "M", meaning: "Great Lord" },
    { name: "Mahadev", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "M", meaning: "Great God" },
    { name: "Rudra", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "R", meaning: "The Roarer, Terrifying" },
    { name: "Bholenath", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "B", meaning: "Lord of Simplicity" },
    { name: "Ishana", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "I", meaning: "The Ruler" },
    { name: "Omkar", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "O", meaning: "Sound of Om" },
    { name: "Pashupati", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "P", meaning: "Lord of Animals" },
    { name: "Gangadhar", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "G", meaning: "Holder of the Ganges" },
    { name: "Trilok", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "T", meaning: "Lord of Three Worlds" },
    { name: "Tripurari", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "T", meaning: "Enemy of Tripura" },
    { name: "Nataraj", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "N", meaning: "King of Dance" },
    { name: "Neelkanth", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "N", meaning: "Blue Throated" },
    { name: "Kailash", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "K", meaning: "Abode of Shiva" },
    { name: "Kedarnath", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "K", meaning: "Lord of Kedar" },
    { name: "Chandrashekhar", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "C", meaning: "Holder of the Moon" },
    { name: "Umapati", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "U", meaning: "Consort of Uma" },
    { name: "Vishwanath", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "V", meaning: "Lord of the Universe" },
    { name: "Veerabhadra", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "V", meaning: "Heroic Friend" },
    { name: "Bhairav", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "B", meaning: "Formidable" },
    { name: "Girish", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "G", meaning: "Lord of Mountains" },
    { name: "Hara", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "H", meaning: "Remover of Sins" },
    { name: "Mrityunjay", gender: "male", religion: "Hindu", tags: ["Shiva"], start: "M", meaning: "Conqueror of Death" },

    // Rama (Male)
    { name: "Ram", gender: "male", religion: "Hindu", tags: ["Rama"], start: "R", meaning: "Pleasing, Charming" },
    { name: "Raghav", gender: "male", religion: "Hindu", tags: ["Rama"], start: "R", meaning: "Descendant of Raghu" },
    { name: "Raghunath", gender: "male", religion: "Hindu", tags: ["Rama"], start: "R", meaning: "Lord of the Raghus" },
    { name: "Rajeev", gender: "male", religion: "Hindu", tags: ["Rama"], start: "R", meaning: "Blue Lotus" },
    { name: "Ramchandra", gender: "male", religion: "Hindu", tags: ["Rama"], start: "R", meaning: "Moon-like Rama" },
    { name: "Raghupati", gender: "male", religion: "Hindu", tags: ["Rama"], start: "R", meaning: "Lord of Raghus" },
    { name: "Kaushik", gender: "male", religion: "Hindu", tags: ["Rama"], start: "K", meaning: "Descendant of Kusha" },
    { name: "Dasharathi", gender: "male", religion: "Hindu", tags: ["Rama"], start: "D", meaning: "Son of Dasharatha" },
    { name: "Siyaram", gender: "male", religion: "Hindu", tags: ["Rama"], start: "S", meaning: "Sita and Ram" },
    { name: "Janakivallabh", gender: "male", religion: "Hindu", tags: ["Rama"], start: "J", meaning: "Beloved of Janaki" },
    { name: "Kodandapani", gender: "male", religion: "Hindu", tags: ["Rama"], start: "K", meaning: "Holder of the Bow" },
    { name: "Maryada", gender: "male", religion: "Hindu", tags: ["Rama"], start: "M", meaning: "Limit, Boundary (of righteousness)" },
    { name: "Purushottam", gender: "male", religion: "Hindu", tags: ["Rama"], start: "P", meaning: "Supreme Being" },
    { name: "Ramabhadra", gender: "male", religion: "Hindu", tags: ["Rama"], start: "R", meaning: "Auspicious Rama" },
    { name: "Shashwat", gender: "male", religion: "Hindu", tags: ["Rama"], start: "S", meaning: "Eternal" },
    { name: "Vedant", gender: "male", religion: "Hindu", tags: ["Rama"], start: "V", meaning: "End of Vedas" },
    { name: "Hari", gender: "male", religion: "Hindu", tags: ["Rama", "Vishnu"], start: "H", meaning: "Remover of Sins" },
    { name: "Jaitra", gender: "male", religion: "Hindu", tags: ["Rama"], start: "J", meaning: "Victorious" },
    { name: "Jitamitra", gender: "male", religion: "Hindu", tags: ["Rama"], start: "J", meaning: "Vanquisher of Foes" },
    { name: "Param", gender: "male", religion: "Hindu", tags: ["Rama"], start: "P", meaning: "Supreme" },
    { name: "Parakram", gender: "male", religion: "Hindu", tags: ["Rama"], start: "P", meaning: "Valour" },
    { name: "Prajapati", gender: "male", religion: "Hindu", tags: ["Rama"], start: "P", meaning: "Lord of Creatures" },
    { name: "Satyavrat", gender: "male", religion: "Hindu", tags: ["Rama"], start: "S", meaning: "One who has taken a vow of truth" },
    { name: "Shaurya", gender: "male", religion: "Hindu", tags: ["Rama"], start: "S", meaning: "Bravery" },
    { name: "Dhanvine", gender: "male", religion: "Hindu", tags: ["Rama"], start: "D", meaning: "Of the Bow" },

    // Krishna (Male)
    { name: "Krishna", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "K", meaning: "Dark, All-attractive" },
    { name: "Kanha", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "K", meaning: "Young Krishna" },
    { name: "Kanhaiya", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "K", meaning: "Adolescent Krishna" },
    { name: "Keshav", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "K", meaning: "Long Haired" },
    { name: "Madhav", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "M", meaning: "Sweet like Honey" },
    { name: "Mohan", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "M", meaning: "Enchanting" },
    { name: "Manmohan", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "M", meaning: "Pleasing to the Heart" },
    { name: "Muralidhar", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "M", meaning: "Holder of the Flute" },
    { name: "Gopal", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "G", meaning: "Protector of Cows" },
    { name: "Govind", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "G", meaning: "Finder of Cows" },
    { name: "Girdhari", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "G", meaning: "Lifter of the Hill" },
    { name: "Ghanshyam", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "G", meaning: "Dark as a Cloud" },
    { name: "Vasudev", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "V", meaning: "Son of Vasudeva" },
    { name: "Nandlal", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "N", meaning: "Beloved of Nanda" },
    { name: "Yashodanandan", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "Y", meaning: "Son of Yashoda" },
    { name: "Shyam", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "S", meaning: "Dark Complexioned" },
    { name: "Hari", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "H", meaning: "Remover of Sins" },
    { name: "Banke", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "B", meaning: "Bent (in three places)" },
    { name: "Bihari", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "B", meaning: "Wanderer" },
    { name: "Darsh", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "D", meaning: "Sight, Vision" },
    { name: "Dev", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "D", meaning: "God" },
    { name: "Ishwar", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "I", meaning: "Supreme Controller" },
    { name: "Jagannath", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "J", meaning: "Lord of the Universe" },
    { name: "Kannan", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "K", meaning: "Krishna (Tamil)" },
    { name: "Mayur", gender: "male", religion: "Hindu", tags: ["Krishna"], start: "M", meaning: "Peacock" },

    // Vishnu (Male)
    { name: "Vishnu", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "V", meaning: "All Pervading" },
    { name: "Narayan", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "N", meaning: "Refuge of Man" },
    { name: "Hari", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "H", meaning: "Remover of Sins" },
    { name: "Achyut", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "A", meaning: "Imperishable" },
    { name: "Anant", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "A", meaning: "Infinite" },
    { name: "Mukunda", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "M", meaning: "Giver of Liberation" },
    { name: "Madhusudan", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "M", meaning: "Slayer of Madhu" },
    { name: "Trivikram", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "T", meaning: "Conqueror of Three Worlds" },
    { name: "Vamana", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "V", meaning: "Dwarf Avatar" },
    { name: "Shridhar", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "S", meaning: "Possessor of Wealth" },
    { name: "Rishikesh", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "R", meaning: "Lord of Senses" },
    { name: "Padmanabh", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "P", meaning: "Lotus Navelled" },
    { name: "Damodar", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "D", meaning: "Rope around Belly" },
    { name: "Janardan", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "J", meaning: "Liberator of Men" },
    { name: "Upendra", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "U", meaning: "Brother of Indra" },
    { name: "Vaikunth", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "V", meaning: "Abode of Vishnu" },
    { name: "Yajnesh", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "Y", meaning: "Lord of Sacrifice" },
    { name: "Pradyumna", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "P", meaning: "Pre-eminently Mighty" },
    { name: "Suresh", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "S", meaning: "Lord of Gods" },
    { name: "Ish", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "I", meaning: "Lord" },
    { name: "Aditya", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "A", meaning: "Son of Aditi" },
    { name: "Bhuvan", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "B", meaning: "World" },
    { name: "Chakradhar", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "C", meaning: "Holder of the Chakra" },
    { name: "Devesh", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "D", meaning: "Lord of Lords" },
    { name: "Garuda", gender: "male", religion: "Hindu", tags: ["Vishnu"], start: "G", meaning: "King of Birds" },

    // Lakshmi (Female)
    { name: "Lakshmi", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "L", meaning: "Goddess of Wealth" },
    { name: "Laxmi", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "L", meaning: "Sign, Mark" },
    { name: "Padma", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "P", meaning: "Lotus" },
    { name: "Padmavati", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "P", meaning: "Possessing Lotuses" },
    { name: "Kamala", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "K", meaning: "Lotus" },
    { name: "Shri", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "S", meaning: "Radiance, Wealth" },
    { name: "Shruti", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "S", meaning: "Vedas, Hearing" },
    { name: "Shreya", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "S", meaning: "Auspicious" },
    { name: "Vaishnavi", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "V", meaning: "Worshipper of Vishnu" },
    { name: "Narayani", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "N", meaning: "Belonging to Narayana" },
    { name: "Bhargavi", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "B", meaning: "Daughter of Bhrigu" },
    { name: "Chanchala", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "C", meaning: "Unsteady (like wealth)" },
    { name: "Rama", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "R", meaning: "Pleasing" },
    { name: "Indira", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "I", meaning: "Beauty" },
    { name: "Haripriya", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "H", meaning: "Beloved of Hari" },
    { name: "Jalaja", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "J", meaning: "Born of Water (Lotus)" },
    { name: "Madhavi", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "M", meaning: "Born of Madhu (Spring)" },
    { name: "Manjula", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "M", meaning: "Lovely" },
    { name: "Nandini", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "N", meaning: "Delightful" },
    { name: "Radha", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "R", meaning: "Success" },
    { name: "Rukmini", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "R", meaning: "Adorned with Gold" },
    { name: "Sita", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "S", meaning: "Furrow" },
    { name: "Varalakshmi", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "V", meaning: "Boon Giving Lakshmi" },
    { name: "Veda", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "V", meaning: "Knowledge" },
    { name: "Yashasvi", gender: "female", religion: "Hindu", tags: ["Lakshmi"], start: "Y", meaning: "Famous" },

    // Durga (Female)
    { name: "Durga", gender: "female", religion: "Hindu", tags: ["Durga"], start: "D", meaning: "Invincible" },
    { name: "Devi", gender: "female", religion: "Hindu", tags: ["Durga"], start: "D", meaning: "Goddess" },
    { name: "Shakti", gender: "female", religion: "Hindu", tags: ["Durga"], start: "S", meaning: "Power" },
    { name: "Parvati", gender: "female", religion: "Hindu", tags: ["Durga"], start: "P", meaning: "Daughter of the Mountain" },
    { name: "Gauri", gender: "female", religion: "Hindu", tags: ["Durga"], start: "G", meaning: "Fair Complexioned" },
    { name: "Amba", gender: "female", religion: "Hindu", tags: ["Durga"], start: "A", meaning: "Mother" },
    { name: "Ambika", gender: "female", religion: "Hindu", tags: ["Durga"], start: "A", meaning: "Mother" },
    { name: "Kali", gender: "female", religion: "Hindu", tags: ["Durga"], start: "K", meaning: "Dark One" },
    { name: "Bhavani", gender: "female", religion: "Hindu", tags: ["Durga"], start: "B", meaning: "Giver of Life" },
    { name: "Chamunda", gender: "female", religion: "Hindu", tags: ["Durga"], start: "C", meaning: "Slayer of Chanda and Munda" },
    { name: "Chandika", gender: "female", religion: "Hindu", tags: ["Durga"], start: "C", meaning: "Fierce" },
    { name: "Jagdamba", gender: "female", religion: "Hindu", tags: ["Durga"], start: "J", meaning: "Mother of the Universe" },
    { name: "Katyayani", gender: "female", religion: "Hindu", tags: ["Durga"], start: "K", meaning: "Worshipped by Katya" },
    { name: "Mahamaya", gender: "female", religion: "Hindu", tags: ["Durga"], start: "M", meaning: "Great Illusion" },
    { name: "Shailputri", gender: "female", religion: "Hindu", tags: ["Durga"], start: "S", meaning: "Daughter of the Rock" },
    { name: "Skandamata", gender: "female", religion: "Hindu", tags: ["Durga"], start: "S", meaning: "Mother of Skanda" },
    { name: "Uma", gender: "female", religion: "Hindu", tags: ["Durga"], start: "U", meaning: "Light" },
    { name: "Vaishnavi", gender: "female", religion: "Hindu", tags: ["Durga"], start: "V", meaning: "Worshipper of Vishnu" },
    { name: "Yogmaya", gender: "female", religion: "Hindu", tags: ["Durga"], start: "Y", meaning: "Illusion of Yoga" },
    { name: "Aparna", gender: "female", religion: "Hindu", tags: ["Durga"], start: "A", meaning: "Leafless" },
    { name: "Dakshayani", gender: "female", religion: "Hindu", tags: ["Durga"], start: "D", meaning: "Daughter of Daksha" },
    { name: "Girija", gender: "female", religion: "Hindu", tags: ["Durga"], start: "G", meaning: "Born of Mountain" },
    { name: "Himani", gender: "female", religion: "Hindu", tags: ["Durga"], start: "H", meaning: "Glacier" },
    { name: "Ishani", gender: "female", religion: "Hindu", tags: ["Durga"], start: "I", meaning: "Consort of Ishana" },
    { name: "Jaya", gender: "female", religion: "Hindu", tags: ["Durga"], start: "J", meaning: "Victory" },

    // General / Alphabet (Mixed)
    { name: "Aarav", gender: "male", religion: "Hindu", tags: [], start: "A", meaning: "Peaceful" },
    { name: "Ayaan", gender: "male", religion: "Hindu", tags: [], start: "A", meaning: "Gift of God" },
    { name: "Aditi", gender: "female", religion: "Hindu", tags: [], start: "A", meaning: "Boundless" },
    { name: "Ananya", gender: "female", religion: "Hindu", tags: [], start: "A", meaning: "Unique" },
    { name: "Bhuvan", gender: "male", religion: "Hindu", tags: [], start: "B", meaning: "World" },
    { name: "Bhavya", gender: "female", religion: "Hindu", tags: [], start: "B", meaning: "Grand" },
    { name: "Chirag", gender: "male", religion: "Hindu", tags: [], start: "C", meaning: "Lamp" },
    { name: "Chahna", gender: "female", religion: "Hindu", tags: [], start: "C", meaning: "Love" },
    { name: "Dhruv", gender: "male", religion: "Hindu", tags: [], start: "D", meaning: "Pole Star" },
    { name: "Diya", gender: "female", religion: "Hindu", tags: [], start: "D", meaning: "Lamp" },
    { name: "Eshan", gender: "male", religion: "Hindu", tags: [], start: "E", meaning: "Lord Shiva" },
    { name: "Esha", gender: "female", religion: "Hindu", tags: [], start: "E", meaning: "Desire" },
    { name: "Farhan", gender: "male", religion: "Muslim", tags: [], start: "F", meaning: "Happy" },
    { name: "Fatima", gender: "female", religion: "Muslim", tags: [], start: "F", meaning: "Captivating" },
    { name: "Gautam", gender: "male", religion: "Hindu", tags: [], start: "G", meaning: "Enlightened" },
    { name: "Gargi", gender: "female", religion: "Hindu", tags: [], start: "G", meaning: "An Ancient Scholar" },
    { name: "Harsh", gender: "male", religion: "Hindu", tags: [], start: "H", meaning: "Happiness" },
    { name: "Hina", gender: "female", religion: "Hindu", tags: [], start: "H", meaning: "Henna" },
    { name: "Ishaan", gender: "male", religion: "Hindu", tags: [], start: "I", meaning: "Sun" },
    { name: "Isha", gender: "female", religion: "Hindu", tags: [], start: "I", meaning: "One who protects" },
    { name: "Jai", gender: "male", religion: "Hindu", tags: [], start: "J", meaning: "Victory" },
    { name: "Jiya", gender: "female", religion: "Hindu", tags: [], start: "J", meaning: "Sweet Heart" },
    { name: "Kabir", gender: "male", religion: "Hindu", tags: [], start: "K", meaning: "Great" },
    { name: "Kavya", gender: "female", religion: "Hindu", tags: [], start: "K", meaning: "Poetry" },
    { name: "Laksh", gender: "male", religion: "Hindu", tags: [], start: "L", meaning: "Aim" },
    { name: "Lara", gender: "female", religion: "Hindu", tags: [], start: "L", meaning: "Protection" },
    { name: "Manav", gender: "male", religion: "Hindu", tags: [], start: "M", meaning: "Man" },
    { name: "Meera", gender: "female", religion: "Hindu", tags: [], start: "M", meaning: "Prosperous" },
    { name: "Nakul", gender: "male", religion: "Hindu", tags: [], start: "N", meaning: "Twin of Sahadev" },
    { name: "Naina", gender: "female", religion: "Hindu", tags: [], start: "N", meaning: "Eyes" },
    { name: "Om", gender: "male", religion: "Hindu", tags: [], start: "O", meaning: "Sacred Syllable" },
    { name: "Ojasvi", gender: "female", religion: "Hindu", tags: [], start: "O", meaning: "Bright" },
    { name: "Pranav", gender: "male", religion: "Hindu", tags: [], start: "P", meaning: "Om" },
    { name: "Priya", gender: "female", religion: "Hindu", tags: [], start: "P", meaning: "Beloved" },
    { name: "Qasim", gender: "male", religion: "Muslim", tags: [], start: "Q", meaning: "Divider" },
    { name: "Quasar", gender: "female", religion: "Muslim", tags: [], start: "Q", meaning: "Meteor" },
    { name: "Rohan", gender: "male", religion: "Hindu", tags: [], start: "R", meaning: "Ascending" },
    { name: "Riya", gender: "female", religion: "Hindu", tags: [], start: "R", meaning: "Singer" },
    { name: "Sahil", gender: "male", religion: "Hindu", tags: [], start: "S", meaning: "Shore" },
    { name: "Sana", gender: "female", religion: "Hindu", tags: [], start: "S", meaning: "Brilliance" },
    { name: "Tanish", gender: "male", religion: "Hindu", tags: [], start: "T", meaning: "Ambition" },
    { name: "Tara", gender: "female", religion: "Hindu", tags: [], start: "T", meaning: "Star" },
    { name: "Uday", gender: "male", religion: "Hindu", tags: [], start: "U", meaning: "Rise" },
    { name: "Urvi", gender: "female", religion: "Hindu", tags: [], start: "U", meaning: "Earth" },
    { name: "Vivaan", gender: "male", religion: "Hindu", tags: [], start: "V", meaning: "Full of Life" },
    { name: "Vanya", gender: "female", religion: "Hindu", tags: [], start: "V", meaning: "Gracious Gift of God" },
    { name: "Wahid", gender: "male", religion: "Muslim", tags: [], start: "W", meaning: "Unique" },
    { name: "Wafa", gender: "female", religion: "Muslim", tags: [], start: "W", meaning: "Faithfulness" },
    { name: "Xavier", gender: "male", religion: "Christian", tags: [], start: "X", meaning: "New House" },
    { name: "Xena", gender: "female", religion: "Christian", tags: [], start: "X", meaning: "Guest" },
    { name: "Yash", gender: "male", religion: "Hindu", tags: [], start: "Y", meaning: "Success" },
    { name: "Yara", gender: "female", religion: "Hindu", tags: [], start: "Y", meaning: "Small Butterfly" },
    { name: "Zain", gender: "male", religion: "Muslim", tags: [], start: "Z", meaning: "Beauty" },
    { name: "Zara", gender: "female", religion: "Muslim", tags: [], start: "Z", meaning: "Princess" },

    // Additional Names for Nakshatra Coverage
    // Ashwini (Chu, Che, Cho, La)
    { name: "Chulbul", gender: "male", religion: "Hindu", tags: [], start: "C", meaning: "Mischievous" },
    { name: "Chetan", gender: "male", religion: "Hindu", tags: [], start: "C", meaning: "Consciousness" },
    { name: "Chetana", gender: "female", religion: "Hindu", tags: [], start: "C", meaning: "Consciousness" },
    { name: "Chola", gender: "male", religion: "Hindu", tags: [], start: "C", meaning: "Kingdom" },
    { name: "Lalit", gender: "male", religion: "Hindu", tags: [], start: "L", meaning: "Beautiful" },
    { name: "Lalita", gender: "female", religion: "Hindu", tags: [], start: "L", meaning: "Beautiful" },
    { name: "Lavanya", gender: "female", religion: "Hindu", tags: [], start: "L", meaning: "Grace" },

    // Bharani (Li, Lu, Le, Lo)
    { name: "Likhith", gender: "male", religion: "Hindu", tags: [], start: "L", meaning: "Written" },
    { name: "Luv", gender: "male", religion: "Hindu", tags: [], start: "L", meaning: "Son of Lord Rama" },
    { name: "Lekha", gender: "female", religion: "Hindu", tags: [], start: "L", meaning: "Writing" },
    { name: "Lokesh", gender: "male", religion: "Hindu", tags: [], start: "L", meaning: "Lord of the World" },
    { name: "Lohit", gender: "male", religion: "Hindu", tags: [], start: "L", meaning: "Red" },

    // Krittika (A, Ee, U, Ae)
    { name: "Aarav", gender: "male", religion: "Hindu", tags: [], start: "A", meaning: "Peaceful" },
    { name: "Eshan", gender: "male", religion: "Hindu", tags: [], start: "E", meaning: "Lord Shiva" },
    { name: "Uday", gender: "male", religion: "Hindu", tags: [], start: "U", meaning: "Rise" },
    { name: "Aesha", gender: "female", religion: "Hindu", tags: [], start: "A", meaning: "Love" },

    // Rohini (O, Va, Vi, Vu)
    { name: "Om", gender: "male", religion: "Hindu", tags: [], start: "O", meaning: "Sacred Syllable" },
    { name: "Varun", gender: "male", religion: "Hindu", tags: [], start: "V", meaning: "God of Water" },
    { name: "Vivan", gender: "male", religion: "Hindu", tags: [], start: "V", meaning: "Full of Life" },
    { name: "Vritika", gender: "female", religion: "Hindu", tags: [], start: "V", meaning: "Thought" },

    // Mrigashira (Ve, Vo, Ka, Ki)
    { name: "Ved", gender: "male", religion: "Hindu", tags: [], start: "V", meaning: "Sacred Knowledge" },
    { name: "Karan", gender: "male", religion: "Hindu", tags: [], start: "K", meaning: "Warrior" },
    { name: "Kiran", gender: "male", religion: "Hindu", tags: [], start: "K", meaning: "Ray of Light" },
    { name: "Kiara", gender: "female", religion: "Hindu", tags: [], start: "K", meaning: "Dark Haired" },

    // Ardra (Ku, Gha, Nga, Chha)
    { name: "Kunal", gender: "male", religion: "Hindu", tags: [], start: "K", meaning: "Lotus" },
    { name: "Ghanashyam", gender: "male", religion: "Hindu", tags: [], start: "G", meaning: "Dark Cloud" },
    { name: "Chhaya", gender: "female", religion: "Hindu", tags: [], start: "C", meaning: "Shadow" },

    // Punarvasu (Ke, Ko, Ha, Hi)
    { name: "Keshav", gender: "male", religion: "Hindu", tags: [], start: "K", meaning: "Krishna" },
    { name: "Komal", gender: "female", religion: "Hindu", tags: [], start: "K", meaning: "Soft" },
    { name: "Harsh", gender: "male", religion: "Hindu", tags: [], start: "H", meaning: "Joy" },
    { name: "Hina", gender: "female", religion: "Hindu", tags: [], start: "H", meaning: "Fragrance" },

    // Pushya (Hu, He, Ho, Da)
    { name: "Hemant", gender: "male", religion: "Hindu", tags: [], start: "H", meaning: "Winter" },
    { name: "Hema", gender: "female", religion: "Hindu", tags: [], start: "H", meaning: "Golden" },
    { name: "Daksh", gender: "male", religion: "Hindu", tags: [], start: "D", meaning: "Capable" },
    { name: "Damini", gender: "female", religion: "Hindu", tags: [], start: "D", meaning: "Lightning" },

    // Ashlesha (De, Doo, De, Daw)
    { name: "Dev", gender: "male", religion: "Hindu", tags: [], start: "D", meaning: "God" },
    { name: "Deepak", gender: "male", religion: "Hindu", tags: [], start: "D", meaning: "Lamp" },
    { name: "Deepika", gender: "female", religion: "Hindu", tags: [], start: "D", meaning: "Light" },

    // Magha (Ma, Mi, Mu, Me)
    { name: "Manish", gender: "male", religion: "Hindu", tags: [], start: "M", meaning: "Lord of the Mind" },
    { name: "Mihir", gender: "male", religion: "Hindu", tags: [], start: "M", meaning: "Sun" },
    { name: "Mukund", gender: "male", religion: "Hindu", tags: [], start: "M", meaning: "Giver of Freedom" },
    { name: "Megha", gender: "female", religion: "Hindu", tags: [], start: "M", meaning: "Cloud" },

    // Purva Phalguni (Mo, Ta, Ti, Tu)
    { name: "Mohit", gender: "male", religion: "Hindu", tags: [], start: "M", meaning: "Attracted" },
    { name: "Tanmay", gender: "male", religion: "Hindu", tags: [], start: "T", meaning: "Engrossed" },
    { name: "Tia", gender: "female", religion: "Hindu", tags: [], start: "T", meaning: "Bird" },
    { name: "Tushar", gender: "male", religion: "Hindu", tags: [], start: "T", meaning: "Snow" },

    // Uttara Phalguni (Te, To, Pa, Pi)
    { name: "Tejas", gender: "male", religion: "Hindu", tags: [], start: "T", meaning: "Brilliance" },
    { name: "Parth", gender: "male", religion: "Hindu", tags: [], start: "P", meaning: "Arjuna" },
    { name: "Piyush", gender: "male", religion: "Hindu", tags: [], start: "P", meaning: "Nectar" },
    { name: "Pari", gender: "female", religion: "Hindu", tags: [], start: "P", meaning: "Fairy" },

    // Hasta (Pu, Sha, Na, Tha)
    { name: "Puneet", gender: "male", religion: "Hindu", tags: [], start: "P", meaning: "Pure" },
    { name: "Shankar", gender: "male", religion: "Hindu", tags: [], start: "S", meaning: "Shiva" },
    { name: "Naveen", gender: "male", religion: "Hindu", tags: [], start: "N", meaning: "New" },
    { name: "Thakur", gender: "male", religion: "Hindu", tags: [], start: "T", meaning: "Lord" },

    // Chitra (Pe, Po, Ra, Ri)
    { name: "Rahul", gender: "male", religion: "Hindu", tags: [], start: "R", meaning: "Conqueror of Misery" },
    { name: "Riya", gender: "female", religion: "Hindu", tags: [], start: "R", meaning: "Singer" },
    { name: "Rishi", gender: "male", religion: "Hindu", tags: [], start: "R", meaning: "Sage" },

    // Swati (Ru, Re, Ro, Ta)
    { name: "Rudra", gender: "male", religion: "Hindu", tags: [], start: "R", meaning: "Shiva" },
    { name: "Rekha", gender: "female", religion: "Hindu", tags: [], start: "R", meaning: "Line" },
    { name: "Rohan", gender: "male", religion: "Hindu", tags: [], start: "R", meaning: "Ascending" },
    { name: "Tanvi", gender: "female", religion: "Hindu", tags: [], start: "T", meaning: "Delicate" },

    // Vishakha (Ti, Tu, Te, To)
    { name: "Tina", gender: "female", religion: "Hindu", tags: [], start: "T", meaning: "Clay" },
    { name: "Tushar", gender: "male", religion: "Hindu", tags: [], start: "T", meaning: "Snow" },
    { name: "Tejal", gender: "female", religion: "Hindu", tags: [], start: "T", meaning: "Radiant" },

    // Anuradha (Na, Ni, Nu, Ne)
    { name: "Naman", gender: "male", religion: "Hindu", tags: [], start: "N", meaning: "Salutation" },
    { name: "Nikhil", gender: "male", religion: "Hindu", tags: [], start: "N", meaning: "Complete" },
    { name: "Nupur", gender: "female", religion: "Hindu", tags: [], start: "N", meaning: "Anklet" },
    { name: "Neha", gender: "female", religion: "Hindu", tags: [], start: "N", meaning: "Love" },

    // Jyeshtha (No, Ya, Yi, Yu)
    { name: "Yash", gender: "male", religion: "Hindu", tags: [], start: "Y", meaning: "Success" },
    { name: "Yamini", gender: "female", religion: "Hindu", tags: [], start: "Y", meaning: "Night" },
    { name: "Yuvraj", gender: "male", religion: "Hindu", tags: [], start: "Y", meaning: "Prince" },

    // Mula (Ye, Yo, Bha, Bhi)
    { name: "Yogesh", gender: "male", religion: "Hindu", tags: [], start: "Y", meaning: "Lord of Yoga" },
    { name: "Bharat", gender: "male", religion: "Hindu", tags: [], start: "B", meaning: "India" },
    { name: "Bhim", gender: "male", religion: "Hindu", tags: [], start: "B", meaning: "Strong" },

    // Purva Ashadha (Bhu, Dha, Pha, Dha)
    { name: "Bhavesh", gender: "male", religion: "Hindu", tags: [], start: "B", meaning: "Lord of the World" },
    { name: "Dhaval", gender: "male", religion: "Hindu", tags: [], start: "D", meaning: "White" },
    { name: "Phalgun", gender: "male", religion: "Hindu", tags: [], start: "P", meaning: "Month in Hindu Calendar" },

    // Uttara Ashadha (Bhe, Bho, Ja, Ji)
    { name: "Bhoomi", gender: "female", religion: "Hindu", tags: [], start: "B", meaning: "Earth" },
    { name: "Jay", gender: "male", religion: "Hindu", tags: [], start: "J", meaning: "Victory" },
    { name: "Jiya", gender: "female", religion: "Hindu", tags: [], start: "J", meaning: "Sweet Heart" },

    // Shravana (Khi, Khu, Khe, Kho)
    { name: "Khushi", gender: "female", religion: "Hindu", tags: [], start: "K", meaning: "Happiness" },
    { name: "Khem", gender: "male", religion: "Hindu", tags: [], start: "K", meaning: "Peace" },

    // Dhanishta (Ga, Gi, Gu, Ge)
    { name: "Gagan", gender: "male", religion: "Hindu", tags: [], start: "G", meaning: "Sky" },
    { name: "Girish", gender: "male", religion: "Hindu", tags: [], start: "G", meaning: "Lord of Mountains" },
    { name: "Gunjan", gender: "female", religion: "Hindu", tags: [], start: "G", meaning: "Humming" },
    { name: "Geeta", gender: "female", religion: "Hindu", tags: [], start: "G", meaning: "Holy Book" },

    // Shatabhisha (Go, Sa, Si, Su)
    { name: "Gopal", gender: "male", religion: "Hindu", tags: [], start: "G", meaning: "Krishna" },
    { name: "Sahil", gender: "male", religion: "Hindu", tags: [], start: "S", meaning: "Shore" },
    { name: "Siddharth", gender: "male", religion: "Hindu", tags: [], start: "S", meaning: "Accomplished" },
    { name: "Suman", gender: "female", religion: "Hindu", tags: [], start: "S", meaning: "Flower" },

    // Purva Bhadrapada (Se, So, Da, Di)
    { name: "Seema", gender: "female", religion: "Hindu", tags: [], start: "S", meaning: "Boundary" },
    { name: "Sohan", gender: "male", religion: "Hindu", tags: [], start: "S", meaning: "Good Looking" },
    { name: "Daksh", gender: "male", religion: "Hindu", tags: [], start: "D", meaning: "Capable" },
    { name: "Divya", gender: "female", religion: "Hindu", tags: [], start: "D", meaning: "Divine" },

    // Uttara Bhadrapada (Du, Tha, Jha, Na)
    { name: "Durga", gender: "female", religion: "Hindu", tags: [], start: "D", meaning: "Invincible" },
    { name: "Thanisha", gender: "female", religion: "Hindu", tags: [], start: "T", meaning: "Ambition" },
    { name: "Jhansi", gender: "female", religion: "Hindu", tags: [], start: "J", meaning: "Queen" },
    { name: "Naina", gender: "female", religion: "Hindu", tags: [], start: "N", meaning: "Eyes" },

    // Revati (De, Do, Cha, Chi)
    { name: "Devansh", gender: "male", religion: "Hindu", tags: [], start: "D", meaning: "Part of God" },
    { name: "Dolly", gender: "female", religion: "Hindu", tags: [], start: "D", meaning: "Doll" },
    { name: "Charan", gender: "male", religion: "Hindu", tags: [], start: "C", meaning: "Feet" },
    { name: "Chirag", gender: "male", religion: "Hindu", tags: [], start: "C", meaning: "Lamp" }
];

export const getNakshatraSyllables = (nakshatra) => {
    return NAKSHATRA_SYLLABLES[nakshatra] || [];
};

export const fetchNameDatabase = async () => {
    try {
        const response = await fetch('/data/names.json');
        if (!response.ok) {
            throw new Error('Failed to fetch name database');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading name database:', error);
        return [];
    }
};

export const generateNames = (criteria, externalDatabase = []) => {
    const { gender, religion, basedOn, specificPreference, nakshatraSyllables } = criteria;

    // Merge hardcoded and external database
    // Use a Map to deduplicate by name
    const combinedNames = new Map();

    // Add hardcoded names first
    NAME_DATABASE.forEach(n => combinedNames.set(n.name.toLowerCase(), n));

    // Add external names (if valid)
    if (Array.isArray(externalDatabase)) {
        externalDatabase.forEach(n => {
            if (n && n.name) {
                // Only add if not already present (prefer hardcoded as they might have better metadata like meaning)
                if (!combinedNames.has(n.name.toLowerCase())) {
                    combinedNames.set(n.name.toLowerCase(), n);
                }
            }
        });
    }

    const allNames = Array.from(combinedNames.values());

    let filteredNames = allNames.filter(n => {
        // Filter by Gender
        if (gender && n.gender && n.gender.toLowerCase() !== gender.toLowerCase()) return false;

        // Filter by Religion (if specified)
        // Note: External dataset defaults to 'Hindu' in my script, but let's be safe
        if (religion && n.religion && n.religion.toLowerCase() !== religion.toLowerCase()) return false;

        return true;
    });

    if (basedOn === 'Deity' && specificPreference) {
        filteredNames = filteredNames.filter(n => n.tags && n.tags.includes(specificPreference));
    } else if (basedOn === 'Alphabet' && specificPreference) {
        filteredNames = filteredNames.filter(n => n.name.toLowerCase().startsWith(specificPreference.toLowerCase()));
    } else if (basedOn === 'Nakshatra' && nakshatraSyllables && nakshatraSyllables.length > 0) {
        // Filter names that start with one of the syllables
        filteredNames = filteredNames.filter(n =>
            nakshatraSyllables.some(syl => n.name.toLowerCase().startsWith(syl.toLowerCase()))
        );
    }

    // Sort alphabetically
    filteredNames.sort((a, b) => a.name.localeCompare(b.name));

    return filteredNames;
};

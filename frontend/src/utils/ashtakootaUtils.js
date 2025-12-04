// Simplified Ashtakoota 36-point matching based on Moon sign & nakshatra
// NOTE: This is an approximate implementation for app use, not a strict
// pandit-grade engine.

// 27 nakshatras in order
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Map nakshatra index -> gana
const GANA = [
  'Deva', 'Manushya', 'Rakshasa', // Ashwini, Bharani, Krittika
  'Manushya', 'Deva', 'Rakshasa', // Rohini, Mrigashira, Ardra
  'Deva', 'Deva', 'Rakshasa',     // Punarvasu, Pushya, Ashlesha
  'Rakshasa', 'Manushya', 'Deva', // Magha, Purva Phalguni, Uttara Phalguni
  'Deva', 'Rakshasa', 'Rakshasa', // Hasta, Chitra, Swati
  'Deva', 'Deva', 'Rakshasa',     // Vishakha, Anuradha, Jyeshtha
  'Rakshasa', 'Manushya', 'Deva', // Mula, Purva Ashadha, Uttara Ashadha
  'Deva', 'Manushya',             // Shravana, Dhanishta
  'Rakshasa', 'Manushya', 'Deva'  // Shatabhisha, Purva Bhadrapada, Uttara Bhadrapada, Revati
];

// Map nakshatra index -> nadi (Adi, Madhya, Antya)
const NADI = [
  'Adi', 'Madhya', 'Antya',
  'Adi', 'Madhya', 'Antya',
  'Adi', 'Madhya', 'Antya',
  'Adi', 'Madhya', 'Antya',
  'Adi', 'Madhya', 'Antya',
  'Adi', 'Madhya', 'Antya',
  'Adi', 'Madhya', 'Antya',
  'Adi', 'Madhya', 'Antya'
];

// Map nakshatra index -> yoni animal (simplified labels)
const YONI = [
  'Horse', 'Elephant', 'Sheep',
  'Serpent', 'Dog', 'Dog',
  'Cat', 'Sheep', 'Cat',
  'Rat', 'Rat', 'Cow',
  'Buffalo', 'Tiger', 'Buffalo',
  'Tiger', 'Deer', 'Deer',
  'Monkey', 'Mongoose', 'Mongoose',
  'Monkey', 'Lion',
  'Horse', 'Lion', 'Elephant'
];

// Zodiac sign index (0..11) for each nakshatra group of 2.25 signs (simplified)
// We will just compute sign from longitude separately; Bhakoot, Varna, Vashya
// will rely on sign index.

const SIGN_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
];

// Varna mapping by sign index
// 0 Aries,1 Taurus,2 Gemini,3 Cancer,4 Leo,5 Virgo,6 Libra,7 Scorpio,8 Sag,9 Cap,10 Aq,11 Pis
const VARNA = [
  'Kshatriya', // Aries
  'Vaishya',   // Taurus
  'Shudra',    // Gemini
  'Brahmin',   // Cancer
  'Kshatriya', // Leo
  'Vaishya',   // Virgo
  'Shudra',    // Libra
  'Brahmin',   // Scorpio
  'Kshatriya', // Sagittarius
  'Vaishya',   // Capricorn
  'Shudra',    // Aquarius
  'Brahmin'    // Pisces
];

// Vashya mapping by sign index (simplified grouping)
const VASHYA = [
  'Chatushpada', // Aries
  'Chatushpada', // Taurus
  'Jalachara',   // Gemini
  'Jalachara',   // Cancer
  'Vanachara',   // Leo
  'Manushya',    // Virgo
  'Manushya',    // Libra
  'Vanachara',   // Scorpio
  'Chatushpada', // Sagittarius
  'Chatushpada', // Capricorn
  'Jalachara',   // Aquarius
  'Jalachara'    // Pisces
];

// Helper to get Moon sign index and nakshatra index from longitude
const getMoonData = (moonLongitude) => {
  const signIndex = Math.floor(moonLongitude / 30); // 0..11
  const nakIndex = Math.floor(moonLongitude / (360 / 27)); // 0..26
  return { signIndex, nakIndex };
};

// --- Individual Koota calculations (very simplified rules) ---

// Varna (max 1)
const varnaScore = (brideSign, groomSign) => {
  const brideVarna = VARNA[brideSign];
  const groomVarna = VARNA[groomSign];
  if (brideVarna === groomVarna) return 1;
  // bride lower or equal than groom gives 1, else 0
  const order = ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];
  return order.indexOf(brideVarna) <= order.indexOf(groomVarna) ? 1 : 0;
};

// Vashya (max 2) – simple: same vashya group = 2, else 1
const vashyaScore = (brideSign, groomSign) => {
  const b = VASHYA[brideSign];
  const g = VASHYA[groomSign];
  if (b === g) return 2;
  return 1; // neutral
};

// Tara (max 3) – based on nakshatra counting; simplified: same group good
const taraScore = (brideNak, groomNak) => {
  const diff = Math.abs(brideNak - groomNak) % 9;
  // 1,2,4,6,8 considered good-ish
  const good = [1, 2, 4, 6, 8];
  if (good.includes(diff)) return 3;
  if (diff === 0 || diff === 3 || diff === 5 || diff === 7) return 1.5;
  return 0;
};

// Yoni (max 4) – same animal 4, friend 3, enemy 0, otherwise 2
const yoniScore = (brideNak, groomNak) => {
  const b = YONI[brideNak];
  const g = YONI[groomNak];
  if (b === g) return 4;
  // Simple friend/enemy approximation using same initial letter
  if (b[0] === g[0]) return 3;
  return 2; // neutral
};

// Graha Maitri (max 5) – based on sign lords friendship (very rough)
const grahaMaitriScore = (brideSign, groomSign) => {
  const brideLord = SIGN_LORDS[brideSign];
  const groomLord = SIGN_LORDS[groomSign];
  if (brideLord === groomLord) return 5;
  // simple friendly pairs
  const friendlyPairs = new Set([
    'Moon-Sun', 'Sun-Moon',
    'Jupiter-Mars', 'Mars-Jupiter',
    'Venus-Mercury', 'Mercury-Venus'
  ]);
  if (friendlyPairs.has(`${brideLord}-${groomLord}`)) return 4;
  return 2.5;
};

// Gana (max 6)
const ganaScore = (brideNak, groomNak) => {
  const b = GANA[brideNak];
  const g = GANA[groomNak];
  if (b === g) return 6;
  if ((b === 'Deva' && g === 'Manushya') || (b === 'Manushya' && g === 'Deva')) return 5;
  if ((b === 'Manushya' && g === 'Rakshasa') || (b === 'Rakshasa' && g === 'Manushya')) return 3;
  return 1.5;
};

// Bhakoot (max 7) – based on sign distance (Moon rashi)
const bhakootScore = (brideSign, groomSign) => {
  const diff = (groomSign - brideSign + 12) % 12; // groom from bride
  // Simplified: 2,3,4,5,7,9,10,11 good; 6,8 problematic
  const bad = [6, 8];
  if (bad.includes(diff)) return 0;
  if (diff === 0) return 7;
  return 5;
};

// Nadi (max 8) – same nadi bad, different good
const nadiScore = (brideNak, groomNak) => {
  const b = NADI[brideNak];
  const g = NADI[groomNak];
  if (b === g) return 0;
  return 8;
};

export const computeAshtakootaScore = (brideData, groomData) => {
  if (!brideData?.Moon || !groomData?.Moon) {
    return { total: 0, kootas: [] };
  }

  const brideMoon = getMoonData(brideData.Moon.longitude);
  const groomMoon = getMoonData(groomData.Moon.longitude);

  const kootas = [];

  const varna = varnaScore(brideMoon.signIndex, groomMoon.signIndex);
  kootas.push({ name: 'Varna', points: Number(varna.toFixed(2)), maxPoints: 1 });

  const vashya = vashyaScore(brideMoon.signIndex, groomMoon.signIndex);
  kootas.push({ name: 'Vashya', points: Number(vashya.toFixed(2)), maxPoints: 2 });

  const tara = taraScore(brideMoon.nakIndex, groomMoon.nakIndex);
  kootas.push({ name: 'Tara', points: Number(tara.toFixed(2)), maxPoints: 3 });

  const yoni = yoniScore(brideMoon.nakIndex, groomMoon.nakIndex);
  kootas.push({ name: 'Yoni', points: Number(yoni.toFixed(2)), maxPoints: 4 });

  const graha = grahaMaitriScore(brideMoon.signIndex, groomMoon.signIndex);
  kootas.push({ name: 'Graha Maitri', points: Number(graha.toFixed(2)), maxPoints: 5 });

  const gana = ganaScore(brideMoon.nakIndex, groomMoon.nakIndex);
  kootas.push({ name: 'Gana', points: Number(gana.toFixed(2)), maxPoints: 6 });

  const bhakoot = bhakootScore(brideMoon.signIndex, groomMoon.signIndex);
  kootas.push({ name: 'Bhakoot', points: Number(bhakoot.toFixed(2)), maxPoints: 7 });

  const nadi = nadiScore(brideMoon.nakIndex, groomMoon.nakIndex);
  kootas.push({ name: 'Nadi', points: Number(nadi.toFixed(2)), maxPoints: 8 });

  const total = kootas.reduce((sum, k) => sum + k.points, 0);

  return {
    total: Number(total.toFixed(2)),
    kootas
  };
};

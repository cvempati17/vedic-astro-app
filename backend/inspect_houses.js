const sweph = require('sweph');
sweph.set_sid_mode(1, 0, 0);
const jul_day_ut = sweph.julday(2000, 1, 1, 12, 1);
const houses = sweph.houses(jul_day_ut, 28.6139, 77.2090, 'P');
console.log('Houses:', houses);

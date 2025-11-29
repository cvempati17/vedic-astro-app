export const getHouseType = (houseNum) => {
    const types = [];
    if ([1, 4, 7, 10].includes(houseNum)) types.push('Kendra (Quadrant)');
    if ([1, 5, 9].includes(houseNum)) types.push('Trikona (Trine)');
    if ([3, 6, 10, 11].includes(houseNum)) types.push('Upachaya (Growth)');
    if ([6, 8, 12].includes(houseNum)) types.push('Dusthana (Difficult)');
    // Secondary
    if ([2, 5, 8, 11].includes(houseNum) && !types.includes('Trikona (Trine)')) types.push('Panapara (Succedent)');
    if ([3, 6, 9, 12].includes(houseNum) && !types.includes('Upachaya (Growth)')) types.push('Apoklima (Cadent)');

    return types;
};

export const getPurushartha = (houseNum) => {
    if ([1, 5, 9].includes(houseNum)) return 'Dharma (Duty)';
    if ([2, 6, 10].includes(houseNum)) return 'Artha (Wealth)';
    if ([3, 7, 11].includes(houseNum)) return 'Kama (Desire)';
    if ([4, 8, 12].includes(houseNum)) return 'Moksha (Liberation)';
    return '';
};

export const getRelationship = (planet1Long, planet2Long) => {
    const rasi1 = Math.floor(planet1Long / 30);
    const rasi2 = Math.floor(planet2Long / 30);

    let diff = (rasi2 - rasi1 + 12) % 12;
    const dist1 = diff + 1; // 1-based distance (e.g., 1st, 2nd...)

    // Calculate the reverse distance
    // If 1->2 is 2nd, then 2->1 is 12th.
    const dist2 = (12 - diff) % 12 + 1;

    // Sort to get the standard pair name (e.g., "6/8" instead of "8/6")
    const pair = [dist1, dist2].sort((a, b) => a - b);
    const key = `${pair[0]}/${pair[1]}`;

    let name = '';
    let quality = '';
    let description = '';

    if (dist1 === 1) {
        name = 'Conjunction (1/1)';
        quality = 'Neutral';
        description = 'Together. Energies merge and intensify.';
    } else if (key === '2/12') {
        name = 'Dwi Dwadash (2/12)';
        quality = 'Inauspicious';
        description = 'Loss, expense, and lack of harmony.';
    } else if (key === '3/11') {
        name = 'Tri Ekadash (3/11)';
        quality = 'Auspicious';
        description = 'Growth, gains, and friendly cooperation.';
    } else if (key === '4/10') {
        name = 'Kendra (4/10)';
        quality = 'Active';
        description = 'Action, tension, and mutual work.';
    } else if (key === '5/9') {
        name = 'Nava Pancham (5/9)';
        quality = 'Very Auspicious';
        description = 'Luck, harmony, and flow of grace.';
    } else if (key === '6/8') {
        name = 'Shadastak (6/8)';
        quality = 'Inauspicious';
        description = 'Conflict, transformation, and sudden changes.';
    } else if (key === '7/7') {
        name = 'Samasaptaka (1/7)';
        quality = 'Neutral/Tense';
        description = 'Mutual aspect. Attraction or opposition.';
    }

    return { name, quality, description, key };
};

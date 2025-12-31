const MuhuratEngine = require('./utils/muhuratEngine');

const run = async () => {
    try {
        console.log("Starting reproduction...");

        const startDate = "2025-12-31";
        const endDate = "2026-01-30";
        const ceremony = "Marriage";
        const members = [
            {
                name: "Test Husband",
                role: "husband",
                birthDetails: {
                    moonLongitude: 45.0, // Rohini
                    moonSignIndex: 2,
                    nakshatraIndex: 4
                }
            },
            {
                name: "Test Wife",
                role: "wife",
                birthDetails: {
                    moonLongitude: 180.0, // Chitra
                    moonSignIndex: 7,
                    nakshatraIndex: 14
                }
            }
        ];
        const location = { lat: 28.61, lng: 77.20, timezone: 5.5 };

        console.log("Calling Calculate...");
        const results = MuhuratEngine.calculate(startDate, endDate, ceremony, members, location);
        console.log("Results count:", results.length);
        if (results.length > 0) {
            console.log("First result:", JSON.stringify(results[0], null, 2));
        }

    } catch (e) {
        console.error("FATAL ERROR:", e);
    }
};

run();

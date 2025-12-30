async function testBackend() {
    try {
        console.log("Testing Backend connection...");
        const payload = {
            date: "1990-01-01",
            time: "12:00",
            latitude: 28.61,
            longitude: 77.20,
            timezone: 5.5,
            ayanamsa: 'lahiri'
        };
        console.log("Sending payload:", payload);
        const response = await fetch('http://localhost:5000/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log("Response Status:", response.status);
        const data = await response.json();
        console.log("Success:", data.success);

        if (data.success) {
            console.log("Data keys:", Object.keys(data.data));
            if (data.data.planets && data.data.ascendant) {
                console.log("Structure appears valid.");
            } else {
                console.error("Structure invalid:", data.data);
            }
        } else {
            console.error("API Error:", data.error);
        }
    } catch (e) {
        console.error("Backend failed:", e.message);
    }
}

testBackend();

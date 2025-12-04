const http = require('http');

const data = JSON.stringify({
    date: "1990-01-01",
    time: "10:00",
    latitude: 17.3850,
    longitude: 78.4867,
    timezone: 5.5,
    city: "Hyderabad"
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/calculate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    let body = '';

    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(body);
            console.log('Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log('Raw Body:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();

const axios = require('axios');

async function test() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.xxx'; // Mock token, won't work without actual key but let's see if we get 401 or 500
    // Actually I should find a real token or just hope the server logs it.
    
    const endpoints = [
        'http://localhost:5000/api/connections/requests',
        'http://localhost:5000/api/connections/stats',
        'http://localhost:5000/api/posts/feed'
    ];

    for (const url of endpoints) {
        try {
            console.log(`Testing ${url}...`);
            await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            console.log(`Result: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
        }
    }
}

test();

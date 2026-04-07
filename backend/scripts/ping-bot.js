import axios from 'axios';

const SITE_URL = 'https://alumedin.onrender.com/api/health';
const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

console.log(`[Keep Alive Bot] Started. Ping interval: ${INTERVAL_MS / 60000} minutes`);

async function pingSite() {
    try {
        const response = await axios.get(SITE_URL);
        if (response.status === 200) {
            console.log(`[Keep Alive Bot] SUCCESS: Site is active. Response: ${JSON.stringify(response.data)} at ${new Date().toLocaleString()}`);
        } else {
            console.warn(`[Keep Alive Bot] WARNING: Received status ${response.status} at ${new Date().toLocaleString()}`);
        }
    } catch (error) {
        console.error(`[Keep Alive Bot] ERROR: Ping failed: ${error.message} at ${new Date().toLocaleString()}`);
    }
}

// Initial ping
pingSite();

// Schedule pings
setInterval(pingSite, INTERVAL_MS);

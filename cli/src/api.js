const axios = require('axios');

const MAX_RETRIES = 3;
const RETRY_BACKOFF = [1000, 2000, 4000];

async function apiRequest(method, url, { headers = {}, data = null, json = false } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await axios({
        method,
        url,
        headers: { 'Content-Type': 'application/json', ...headers },
        data: data ? JSON.stringify(data) : undefined,
        timeout: 30000,
      });
      return resp.data;
    } catch (err) {
      lastError = err;
      if (err.response) {
        const status = err.response.status;
        if (status >= 400 && status < 500) {
          const msg = err.response.data?.message || err.response.data?.error || 'Request failed';
          throw new Error(`[${status}] ${msg}`);
        }
      }
      if (attempt < MAX_RETRIES) {
        console.warn(`Request failed, retrying in ${RETRY_BACKOFF[attempt] / 1000}s...`);
        await sleep(RETRY_BACKOFF[attempt]);
      }
    }
  }
  throw new Error(`Request failed after ${MAX_RETRIES} retries: ${lastError.message}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { apiRequest };

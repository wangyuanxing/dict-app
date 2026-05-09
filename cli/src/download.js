const path = require('path');
const fs = require('fs');
const { unflat } = require('./flat');
const { apiRequest } = require('./api');

async function downloadLocaleFiles(config) {
  const { localeDir, serverUrl, projectId, apiKey } = config;
  const headers = { 'X-Project-Id': projectId, 'X-API-Key': apiKey };

  const result = await apiRequest('GET', `${serverUrl}/api/v1/download`, { headers });
  const locales = Object.keys(result);

  if (locales.length === 0) {
    console.log('No translations found on server.');
    return;
  }

  for (const locale of locales) {
    const nested = unflat(result[locale]);
    const filePath = path.join(localeDir, `${locale}.json`);
    fs.writeFileSync(filePath, JSON.stringify(nested, null, 2), 'utf8');
    const keyCount = Object.keys(result[locale]).length;
    console.log(`Downloaded ${locale}.json (${keyCount} keys)`);
  }

  console.log(`\nDone. Downloaded ${locales.length} locale file(s).`);
}

module.exports = { downloadLocaleFiles };

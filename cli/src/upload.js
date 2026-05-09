const path = require('path');
const fs = require('fs');
const { flat } = require('./flat');
const { apiRequest } = require('./api');

async function uploadLocaleFiles(config) {
  const { localeDir, serverUrl, projectId, apiKey } = config;
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('No .json files found in', localeDir);
    return;
  }

  const headers = { 'X-Project-Id': projectId, 'X-API-Key': apiKey };

  for (const file of files) {
    const locale = file.replace(/\.json$/, '');
    const filePath = path.join(localeDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const entries = flat(content);

    const result = await apiRequest('POST', `${serverUrl}/api/v1/upload`, {
      headers,
      data: { locale, entries },
    });

    console.log(`Uploaded ${file} (${result.count} keys)`);
  }

  console.log(`\nDone. Uploaded ${files.length} locale file(s).`);
}

module.exports = { uploadLocaleFiles };

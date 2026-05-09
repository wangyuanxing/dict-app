const path = require('path');
const fs = require('fs');

function loadConfig() {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, 'package.json');

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    throw new Error(`Cannot read package.json at ${pkgPath}. Run this command in your project root.`);
  }

  const cfg = pkg.dictapp;
  if (!cfg) {
    throw new Error('No "dictapp" config found in package.json. Please add it with projectId, apiKey, serverUrl, and localeDir.');
  }

  const required = ['projectId', 'apiKey', 'serverUrl', 'localeDir'];
  for (const field of required) {
    if (!cfg[field] || typeof cfg[field] !== 'string' || !cfg[field].trim()) {
      throw new Error(`Missing or invalid "dictapp.${field}" in package.json`);
    }
  }

  const localeDir = path.resolve(cwd, cfg.localeDir);
  if (!fs.existsSync(localeDir) || !fs.statSync(localeDir).isDirectory()) {
    throw new Error(`Locale directory not found: ${localeDir}`);
  }

  return {
    projectId: cfg.projectId.trim(),
    apiKey: cfg.apiKey.trim(),
    serverUrl: cfg.serverUrl.trim().replace(/\/+$/, ''),
    localeDir,
  };
}

module.exports = { loadConfig };

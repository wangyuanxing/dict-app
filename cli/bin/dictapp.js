#!/usr/bin/env node
const { Command } = require('commander');
const { loadConfig } = require('../src/config');
const { uploadLocaleFiles } = require('../src/upload');
const { downloadLocaleFiles } = require('../src/download');

const program = new Command();

program
  .name('dictapp')
  .description('Manage i18n locale files: upload to server, download translations')
  .version('1.0.0');

program
  .command('upload')
  .alias('u')
  .description('Upload locale files from configured locale directory to server')
  .action(async () => {
    try {
      const config = loadConfig();
      await uploadLocaleFiles(config);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program
  .command('download')
  .alias('d')
  .description('Download all translated locale files from server to locale directory')
  .action(async () => {
    try {
      const config = loadConfig();
      await downloadLocaleFiles(config);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

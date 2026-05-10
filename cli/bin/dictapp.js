#!/usr/bin/env node
const { Command } = require('commander');
const { loadConfig } = require('../src/config');
const { uploadLocaleFiles } = require('../src/upload');
const { downloadLocaleFiles } = require('../src/download');

// Normalize -u/-d shortcuts to full subcommand names so both forms work:
//   dictapp -u       -> dictapp upload
//   dictapp --upload -> dictapp upload
//   dictapp -d       -> dictapp download
const args = process.argv.slice(2).map((arg) => {
  if (arg === '-u' || arg === '--upload') return 'upload';
  if (arg === '-d' || arg === '--download') return 'download';
  return arg;
});
process.argv = [process.argv[0], process.argv[1], ...args];

const program = new Command();

program
  .name('dictapp')
  .description('Manage i18n locale files: upload to server, download translations')
  .version('1.0.0-beta.0');

const runUpload = async () => {
  try {
    const config = loadConfig();
    await uploadLocaleFiles(config);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

const runDownload = async () => {
  try {
    const config = loadConfig();
    await downloadLocaleFiles(config);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

program
  .command('upload')
  .alias('u')
  .description('Upload locale files from configured locale directory to server')
  .action(runUpload);

program
  .command('download')
  .alias('d')
  .description('Download all translated locale files from server to locale directory')
  .action(runDownload);

// Fallback: if no subcommand is given, default to upload with a helpful hint
program.action(() => {
  console.log('Usage: dictapp <command>');
  console.log('');
  console.log('Commands:');
  console.log('  upload, -u    Upload locale files to server');
  console.log('  download, -d  Download translations from server');
  console.log('');
  console.log('Run dictapp --help for full help.');
});

program.parse(process.argv);

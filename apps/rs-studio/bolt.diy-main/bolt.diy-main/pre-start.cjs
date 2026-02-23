const { execSync } = require('child_process');

const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'no-git-info';
  }
};

const commit = {
  hash: getGitHash(),
  version: process.env.npm_package_version || 'unknown',
};

console.log('BOLT DIY');
console.log('Version:', `v${commit.version}`);
console.log('Commit:', commit.hash);
console.log('Starting dev server...');

process.env.NO_COLOR = process.env.NO_COLOR || '1';
process.env.FORCE_COLOR = process.env.FORCE_COLOR || '0';
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=4096';

try {
  const noop = () => true;
  if (typeof process.stdout?.write === 'function') process.stdout.write = noop;
  if (typeof process.stderr?.write === 'function') process.stderr.write = noop;
} catch {}

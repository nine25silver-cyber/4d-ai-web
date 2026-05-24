import {existsSync, readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const safeCiVars = ['CF_PAGES_BRANCH', 'CF_PAGES_COMMIT_SHA', 'GITHUB_SHA', 'CLOUDFLARE_BRANCH'];

function runCommand(command, args) {
  console.log(`\n$ ${[command, ...args].join(' ')}`);
  execFileSync(command, args, {stdio: 'inherit', shell: process.platform === 'win32'});
}

console.log(`cwd: ${process.cwd()}`);
console.log(`node: ${process.version}`);

for (const name of safeCiVars) {
  const value = process.env[name];
  console.log(`${name}: ${value ? value : '<not set>'}`);
}

const wranglerToml = readFileSync('wrangler.toml', 'utf8');
for (const line of wranglerToml.split(/\r?\n/)) {
  if (line.includes('compatibility_date') || line.includes('compatibility_flags')) {
    console.log(line);
  }
}

runCommand('npx', ['wrangler', '--version']);
runCommand('npm', ['run', 'cf:build']);

console.log(`.open-next/worker.js exists: ${existsSync('.open-next/worker.js')}`);
console.log(`.open-next/assets exists: ${existsSync('.open-next/assets')}`);

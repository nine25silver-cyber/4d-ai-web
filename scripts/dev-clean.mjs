import {spawn, spawnSync} from 'node:child_process';
import {existsSync, realpathSync} from 'node:fs';
import {rm} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = realpathSync(process.cwd());
const nextDir = path.join(repoRoot, '.next');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const cmdExe = 'cmd.exe';

function log(message) {
  console.log(`[dev:clean] ${message}`);
}

function fail(message, error) {
  console.error(`[dev:clean] ${message}`);
  if (error) {
    console.error(error.message || error);
  }
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.error) {
    fail(`Failed to run ${command} ${args.join(' ')}`, result.error);
  }

  if (result.status !== 0) {
    fail(`${command} ${args.join(' ')} exited with code ${result.status}`);
  }
}

function npmRunCommand(script) {
  return process.platform === 'win32'
    ? {command: cmdExe, args: ['/d', '/s', '/c', `${npmCmd} run ${script}`]}
    : {command: npmCmd, args: ['run', script]};
}

function runNpmScript(script) {
  const {command, args} = npmRunCommand(script);
  run(command, args);
}

function isSafeNextDir(target) {
  const resolved = path.resolve(target);
  return path.dirname(resolved) === repoRoot && path.basename(resolved) === '.next';
}

async function removeNextDir(label) {
  if (!isSafeNextDir(nextDir)) {
    fail(`Refusing to delete unexpected .next path: ${nextDir}`);
  }

  if (!existsSync(nextDir)) {
    log(`${label}: .next not present`);
    return;
  }

  try {
    await rm(nextDir, {recursive: true, force: true});
    log(`${label}: removed ${nextDir}`);
  } catch (error) {
    fail(`${label}: failed to remove ${nextDir}`, error);
  }
}

function stopWindowsNextDevServers() {
  const psScript = `
$repo = '${repoRoot.replaceAll("'", "''")}';
$matches = Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -and
    $_.CommandLine -like "*$repo*" -and
    ($_.CommandLine -match "next dev|start-server\\.js")
  } |
  Select-Object -ExpandProperty ProcessId;
if ($matches) {
  $matches | ForEach-Object {
    Write-Host "[dev:clean] Stopping stale Next dev process PID $_";
    Stop-Process -Id $_ -Force -ErrorAction Stop;
  }
}
`;

  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript],
    {cwd: repoRoot, encoding: 'utf8'},
  );

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.error || result.status !== 0) {
    log('Could not automatically stop stale Next dev processes. If port 3000 is busy, stop existing npm run dev / next dev windows and run this again.');
  }
}

function stopUnixNextDevServers() {
  const script = `
set -e
repo=${JSON.stringify(repoRoot)}
pids=$(ps -ax -o pid= -o command= | awk -v repo="$repo" '$0 ~ repo && ($0 ~ /next dev/ || $0 ~ /next\\/dist\\/server\\/lib\\/start-server\\.js/) { print $1 }')
if [ -n "$pids" ]; then
  for pid in $pids; do
    echo "[dev:clean] Stopping stale Next dev process PID $pid"
    kill "$pid" || true
  done
fi
`;

  const result = spawnSync('sh', ['-c', script], {cwd: repoRoot, stdio: 'inherit'});
  if (result.error || result.status !== 0) {
    log('Could not automatically stop stale Next dev processes. If the dev port is busy, stop existing npm run dev / next dev shells and run this again.');
  }
}

function stopStaleNextDevServers() {
  log('Checking for stale Next dev server processes');
  if (process.platform === 'win32') {
    stopWindowsNextDevServers();
  } else {
    stopUnixNextDevServers();
  }
}

function startDevServer() {
  log('Starting npm run dev');
  const {command, args} = npmRunCommand('dev');
  const child = spawn(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  });

  child.on('error', (error) => {
    fail('Failed to start npm run dev', error);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(1);
    }
    process.exit(code ?? 0);
  });
}

stopStaleNextDevServers();
await removeNextDir('Before build');
log('Running npm run build');
runNpmScript('build');
await removeNextDir('After build');
startDevServer();

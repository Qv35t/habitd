import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'
import { platform } from 'os'

const isWin = platform() === 'win32'
const run = (cmd) => execSync(cmd, { stdio: 'inherit', shell: true })

try { run('pnpm --version') } catch { run('npm install -g pnpm') }
if (!existsSync('node_modules')) run('pnpm install')

spawn('pnpm', ['dev', '--open'], { stdio: 'inherit', shell: isWin })
  .on('close', (c) => process.exit(c))

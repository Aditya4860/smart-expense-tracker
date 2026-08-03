import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, '../backend');

// Detect Python executable in virtualenv or system
let pythonCmd = 'python';

const isWin = process.platform === 'win32';
const venvPythonWin = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(backendDir, '.venv', 'bin', 'python');

if (isWin && fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (!isWin && fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

console.log(`[Backend Runner] Starting FastAPI with: ${pythonCmd} in ${backendDir}`);

const proc = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--reload'], {
  cwd: backendDir,
  stdio: 'inherit',
});

proc.on('error', (err) => {
  console.error('[Backend Runner] Failed to start backend process:', err);
});

proc.on('close', (code) => {
  console.log(`[Backend Runner] Backend process exited with code ${code}`);
});

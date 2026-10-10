#!/usr/bin/env node
// Desarrollo: servidor Node (API, :3001) + Vite (SPA, :3000) con proxy /api → :3001.
import { spawn } from 'node:child_process';

const procs = [
  spawn('npm', ['run', 'dev:server'], { stdio: 'inherit', env: { ...process.env, PORT: process.env.BACKEND_PORT ?? '3001' } }),
  spawn('npm', ['run', 'dev:web'], { stdio: 'inherit' }),
];
const stop = () => procs.forEach((p) => p.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', (code) => { stop(); process.exit(code ?? 0); }));

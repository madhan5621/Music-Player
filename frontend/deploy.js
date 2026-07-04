/**
 * Custom deploy script for GitHub Pages.
 * Bypasses gh-pages to avoid Windows ENAMETOOLONG errors.
 * Uses a short temp path (C:\tmp\deploy) for the git clone.
 */

import { execSync } from 'child_process';
import { cpSync, mkdirSync, rmSync, existsSync } from 'fs';
import { resolve } from 'path';

const REPO = 'https://github.com/madhan5621/Music-Player.git';
const BRANCH = 'gh-pages';
const DIST = resolve('dist');
const TEMP = 'C:\\tmp\\deploy';

function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

try {
  // Clean up any previous temp directory
  if (existsSync(TEMP)) {
    rmSync(TEMP, { recursive: true, force: true });
  }
  mkdirSync(TEMP, { recursive: true });

  // Initialize a fresh git repo in the short temp path
  run('git init', TEMP);
  run('git checkout --orphan gh-pages', TEMP);

  // Copy built dist files into temp directory
  console.log(`Copying dist files from ${DIST} to ${TEMP}...`);
  cpSync(DIST, TEMP, { recursive: true });

  // Add a .nojekyll file so GitHub doesn't ignore underscore-prefixed files
  const nojekyll = resolve(TEMP, '.nojekyll');
  if (!existsSync(nojekyll)) {
    const { writeFileSync } = await import('fs');
    writeFileSync(nojekyll, '');
  }

  // Commit and push
  run('git add -A', TEMP);
  run('git commit -m "Deploy to GitHub Pages"', TEMP);
  run(`git remote add origin ${REPO}`, TEMP);
  run(`git push origin gh-pages --force`, TEMP);

  console.log('\n✅ Deployed successfully to GitHub Pages!');
  console.log(`🌐 https://madhan5621.github.io/Music-Player/`);
} catch (err) {
  console.error('\n❌ Deploy failed:', err.message);
  process.exit(1);
} finally {
  // Clean up temp directory
  if (existsSync(TEMP)) {
    try {
      rmSync(TEMP, { recursive: true, force: true });
    } catch { /* ignore cleanup errors */ }
  }
}

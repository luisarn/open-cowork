#!/usr/bin/env node
/**
 * One-shot branded build: apply brand → build → reset.
 *
 * Usage:
 *   node scripts/build-brand.js <brand-id>
 *
 * This is the recommended command for CI and producing distributables.
 */

const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const brandId = process.argv[2];

if (!brandId) {
  console.error('Usage: node scripts/build-brand.js <brand-id>');
  process.exit(1);
}

try {
  // 1. Apply brand
  console.log(`[build-brand] Applying brand: ${brandId}`);
  execSync(`node scripts/apply-brand.js ${brandId}`, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });

  // 2. Build
  console.log('[build-brand] Running production build...');
  execSync('npm run build', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });

  // 3. Reset
  console.log('[build-brand] Resetting brand...');
  execSync('node scripts/reset-brand.js', {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });

  console.log(`[build-brand] Successfully built release/${brandId}/`);
} catch (error) {
  console.error('[build-brand] Build failed. Attempting reset...');
  try {
    execSync('node scripts/reset-brand.js', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  } catch {
    // ignore reset failure
  }
  process.exit(1);
}

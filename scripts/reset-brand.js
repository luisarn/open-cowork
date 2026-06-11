#!/usr/bin/env node
/**
 * Reset branding changes to repository defaults.
 *
 * Restores:
 * - package.json (from .bak)
 * - electron-builder.yml (from .bak)
 *
 * Removes:
 * - src/shared/branding/__generated-brand.ts
 * - Backup files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');
const BUILDER_YML_PATH = path.join(PROJECT_ROOT, 'electron-builder.yml');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'index.html');
const GENERATED_BRAND_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'shared',
  'branding',
  '__generated-brand.ts'
);

function restoreFile(filePath) {
  const bakPath = `${filePath}.bak`;
  if (fs.existsSync(bakPath)) {
    fs.copyFileSync(bakPath, filePath);
    fs.unlinkSync(bakPath);
    console.log(`[brand] Restored ${path.basename(filePath)}`);
  } else {
    console.log(`[brand] No backup found for ${path.basename(filePath)} (skipping)`);
  }
}

function main() {
  console.log('[brand] Resetting to default brand...');
  restoreFile(PACKAGE_JSON_PATH);
  restoreFile(BUILDER_YML_PATH);
  restoreFile(INDEX_HTML_PATH);
  restoreFile(GENERATED_BRAND_PATH);
  console.log('[brand] Reset complete.');
}

main();

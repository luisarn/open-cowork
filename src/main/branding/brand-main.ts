/**
 * Main-process branding application.
 *
 * This module applies brand configuration to Electron's main-process APIs:
 * - app name (dock, menu bar, OS-level app identity)
 * - about panel (macOS)
 * - tray icon and tooltip
 *
 * It imports the generated brand config which is baked at build time.
 */

import { app } from 'electron';
import { join } from 'path';
import { BRAND_CONFIG } from '../../shared/branding/__generated-brand';

/**
 * Apply all main-process branding settings.
 * Call this as early as possible in the app lifecycle (before menus are built).
 */
export function applyMainBranding(): void {
  // App name affects dock label, menu bar, and window title defaults
  app.setName(BRAND_CONFIG.productName);

  // About panel (macOS)
  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: BRAND_CONFIG.productName,
      applicationVersion: app.getVersion(),
      copyright: BRAND_CONFIG.copyright,
    });
  }
}

/**
 * Resolve the platform-appropriate tray icon path.
 * Falls back to generic tray icon if platform-specific variant is missing.
 */
export function resolveTrayIconPath(): string {
  const resourcesPath = process.resourcesPath || join(__dirname, '../../../../resources');

  const platformMap: Record<string, string> = {
    darwin: BRAND_CONFIG.assets.trayMac,
    win32: BRAND_CONFIG.assets.trayWin,
    linux: BRAND_CONFIG.assets.tray,
  };

  const assetName = platformMap[process.platform] || BRAND_CONFIG.assets.tray;
  return join(resourcesPath, assetName);
}

/**
 * Get the tooltip text for the tray icon.
 */
export function getTrayTooltip(): string {
  return BRAND_CONFIG.productName;
}

/**
 * Access the full brand config for any other main-process usage.
 */
export function getBrandConfig() {
  return BRAND_CONFIG;
}

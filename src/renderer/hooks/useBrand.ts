/**
 * Brand hook for renderer components.
 *
 * Provides access to the current brand config (name, colors, assets)
 * so components can display branded text and logos.
 */

import { useMemo } from 'react';
import { getBrandConfig } from '@/shared/branding/brand-runtime';

export function useBrand() {
  return useMemo(() => getBrandConfig(), []);
}

import type { ScormVersion, Scorm12RawApi, Scorm2004RawApi } from '../types/common';

/** Result of the API locator search. */
export interface LocatorResult {
  /** The found API object, or null if not found. */
  api: Scorm12RawApi | Scorm2004RawApi | null;
  /** Where the API was found, for diagnostics. */
  source: string | null;
}

/** Options for the API locator. */
export interface LocatorOptions {
  /** Maximum depth to traverse window.parent. Default: 10. */
  maxParentDepth?: number;
  /** Whether to also check window.opener. Default: true. */
  checkOpener?: boolean;
}

/**
 * Search for the SCORM API object in the window hierarchy.
 *
 * For SCORM 1.2, looks for `window.API`.
 * For SCORM 2004, looks for `window.API_1484_11`.
 *
 * Traverses window.parent up to `maxParentDepth`, then checks window.opener.
 * All cross-origin property accesses are wrapped in try/catch to handle SecurityError.
 */
export function findScormApi(
  version: ScormVersion,
  options: LocatorOptions = {},
): LocatorResult {
  const { maxParentDepth = 10, checkOpener = true } = options;
  const apiName = version === '1.2' ? 'API' : 'API_1484_11';

  // Search starting from a given window, traversing parents
  const searchFrom = (startWindow: Window, label: string): LocatorResult => {
    let current: Window = startWindow;
    for (let depth = 0; depth <= maxParentDepth; depth++) {
      try {
        const api = (current as unknown as Record<string, unknown>)[apiName];
        if (api && typeof api === 'object') {
          return {
            api: api as Scorm12RawApi | Scorm2004RawApi,
            source: `${label}${depth > 0 ? ` (parent depth ${depth})` : ''}`,
          };
        }
      } catch {
        // Cross-origin SecurityError — stop this branch
        return { api: null, source: null };
      }

      // Move to parent
      try {
        if (current.parent === current || current.parent == null) {
          break; // Reached top of frame hierarchy
        }
        current = current.parent;
      } catch {
        // Cross-origin SecurityError on accessing parent
        break;
      }
    }
    return { api: null, source: null };
  };

  // 1. Search current window and its parents
  const result = searchFrom(window, 'window');
  if (result.api) return result;

  // 2. Check window.opener if configured
  if (checkOpener) {
    try {
      if (window.opener && window.opener !== window) {
        const openerResult = searchFrom(window.opener as Window, 'opener');
        if (openerResult.api) return openerResult;
      }
    } catch {
      // Cross-origin SecurityError on accessing opener
    }
  }

  return { api: null, source: null };
}

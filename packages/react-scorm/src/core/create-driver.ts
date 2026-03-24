import type { ScormVersion, Scorm12RawApi, Scorm2004RawApi } from '../types/common';
import type { IScormDriver } from '../types/driver';
import type { ScormProviderOptions } from '../types/options';
import type { Logger } from '../debug/logger';
import { ok, err, type Result } from '../result/result';
import { ScormError } from '../errors/scorm-error';
import { findScormApi } from './locator';
import { Scorm12Driver } from './scorm12-driver';
import { Scorm2004Driver } from './scorm2004-driver';
import { createMockDriver } from '../mock/mock-driver';

/**
 * Create the appropriate SCORM driver based on version and options.
 *
 * 1. Uses the locator to find the real SCORM API object.
 * 2. If found, wraps it in the version-specific driver.
 * 3. If not found, applies the noLmsBehavior strategy:
 *    - "error" (default): returns an error Result
 *    - "mock": creates an in-memory mock driver
 *    - "throw": throws a ScormError
 */
export function createDriver(
  version: ScormVersion,
  options: ScormProviderOptions,
  logger: Logger,
): Result<IScormDriver, ScormError> {
  const { api } = findScormApi(version, {
    maxParentDepth: options.maxParentDepth,
    checkOpener: options.checkOpener,
  });

  if (api) {
    logger.debug(`SCORM ${version} API found`);
    const driver = version === '1.2'
      ? new Scorm12Driver(api as Scorm12RawApi, logger)
      : new Scorm2004Driver(api as Scorm2004RawApi, logger);
    return ok(driver);
  }

  // No API found — apply noLmsBehavior
  const behavior = options.noLmsBehavior ?? 'error';
  logger.warn(`SCORM ${version} API not found, using behavior: ${behavior}`);

  switch (behavior) {
    case 'mock':
      return ok(createMockDriver(version, logger));

    case 'throw':
      throw new ScormError({
        version,
        operation: 'createDriver',
        code: 0,
        errorString: 'SCORM API not found',
        diagnostic: `No ${version === '1.2' ? 'window.API' : 'window.API_1484_11'} found in window hierarchy`,
        apiFound: false,
        initialized: false,
      });

    case 'error':
    default:
      return err(new ScormError({
        version,
        operation: 'createDriver',
        code: 0,
        errorString: 'SCORM API not found',
        diagnostic: `No ${version === '1.2' ? 'window.API' : 'window.API_1484_11'} found in window hierarchy`,
        apiFound: false,
        initialized: false,
      }));
  }
}

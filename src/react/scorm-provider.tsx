import { useMemo, useRef } from 'react';
import { ScormContext, type ScormContextValue } from './scorm-context';
import { createDriver } from '../core/create-driver';
import { ScormApi } from '../api/scorm-api';
import { createLogger } from '../debug/logger';
import type { ScormProviderProps } from '../types/options';
import type { ScormStatus } from '../types/status';

/**
 * SCORM Provider component.
 *
 * Locates the SCORM API object and makes the driver + high-level API
 * available to descendants via React context.
 *
 * **Does NOT auto-initialize.** The consumer must call `api.initialize()` explicitly.
 *
 * @example
 * ```tsx
 * <ScormProvider version="1.2" options={{ noLmsBehavior: 'mock' }}>
 *   <CourseContent />
 * </ScormProvider>
 * ```
 */
export function ScormProvider({ version, options = {}, children }: ScormProviderProps) {
  const loggerRef = useRef(createLogger(options.debug ?? false));

  const contextValue = useMemo<ScormContextValue>(() => {
    const driverResult = createDriver(version, options, loggerRef.current);

    if (driverResult.ok) {
      const driver = driverResult.value;
      const api = new ScormApi(driver);
      const status: ScormStatus = {
        version,
        apiFound: true,
        initialized: false,
        terminated: false,
        noLmsBehavior: options.noLmsBehavior ?? 'error',
      };
      return { status, raw: driver, api };
    }

    // API not found and noLmsBehavior === 'error'
    const status: ScormStatus = {
      version,
      apiFound: false,
      initialized: false,
      terminated: false,
      noLmsBehavior: options.noLmsBehavior ?? 'error',
    };
    return { status, raw: null, api: null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, options.noLmsBehavior, options.maxParentDepth, options.checkOpener, options.debug]);

  return (
    <ScormContext.Provider value={contextValue}>
      {children}
    </ScormContext.Provider>
  );
}

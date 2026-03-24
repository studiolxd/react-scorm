import { useState, useCallback } from 'react';
import { useScorm } from './use-scorm';
import type { ScormContextValue } from './scorm-context';
import type { Result } from '../result/result';
import type { ScormError } from '../errors/scorm-error';

export interface ScormSessionValue extends ScormContextValue {
  /**
   * Whether `initialize()` has been called and succeeded in this session.
   * Reactive — triggers re-render when it changes.
   */
  initialized: boolean;
  /**
   * Whether `terminate()` has been called and succeeded in this session.
   * Reactive — triggers re-render when it changes.
   */
  terminated: boolean;
  /**
   * Call `api.initialize()` and update reactive `initialized` state on success.
   * Returns `undefined` when no SCORM API is available (`noLmsBehavior: 'error'`).
   */
  initialize: () => Result<true, ScormError> | undefined;
  /**
   * Call `api.terminate()` and update reactive `initialized`/`terminated` state on success.
   * Returns `undefined` when no SCORM API is available.
   */
  terminate: () => Result<true, ScormError> | undefined;
  /**
   * Call `api.commit()`. State is not affected.
   * Returns `undefined` when no SCORM API is available.
   */
  commit: () => Result<true, ScormError> | undefined;
}

/**
 * Drop-in replacement for `useScorm()` that tracks reactive initialization state.
 *
 * `useScorm()` intentionally keeps `status.initialized` as a static snapshot —
 * the provider does not own lifecycle state. This hook wraps it and exposes
 * `initialized` and `terminated` as local React state that updates on successful
 * `initialize()` / `terminate()` calls.
 *
 * Use this hook when you need to re-render based on session state without
 * managing that state yourself.
 *
 * @example
 * ```tsx
 * function Course() {
 *   const { initialized, initialize, terminate, api } = useScormSession();
 *
 *   useEffect(() => { initialize(); }, [initialize]);
 *
 *   if (!initialized) return <p>Connecting…</p>;
 *   return <CourseContent api={api} onFinish={terminate} />;
 * }
 * ```
 */
export function useScormSession(): ScormSessionValue {
  const context = useScorm();
  const { api } = context;
  const [initialized, setInitialized] = useState(false);
  const [terminated, setTerminated] = useState(false);

  const initialize = useCallback((): Result<true, ScormError> | undefined => {
    if (!api) return undefined;
    const result = api.initialize();
    if (result.ok) setInitialized(true);
    return result;
  }, [api]);

  const terminate = useCallback((): Result<true, ScormError> | undefined => {
    if (!api) return undefined;
    const result = api.terminate();
    if (result.ok) {
      setInitialized(false);
      setTerminated(true);
    }
    return result;
  }, [api]);

  const commit = useCallback((): Result<true, ScormError> | undefined => {
    if (!api) return undefined;
    return api.commit();
  }, [api]);

  return { ...context, initialized, terminated, initialize, terminate, commit };
}

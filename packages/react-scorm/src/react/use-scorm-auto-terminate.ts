import { useEffect, useRef } from 'react';
import { useScorm } from './use-scorm';

/** Options for the auto-terminate hook. */
export interface AutoTerminateOptions {
  /** Track session time and set it before terminate. Default: true. */
  trackSessionTime?: boolean;
  /** Listen to beforeunload/pagehide events. Default: true. */
  handleUnload?: boolean;
  /** Listen to the 'freeze' event (Page Lifecycle API). Default: true. */
  handleFreeze?: boolean;
}

/**
 * Opt-in hook that handles SCORM lifecycle events automatically.
 *
 * - Calls `api.initialize()` on mount.
 * - On unmount or page unload/freeze: commits data, sets session time, and terminates.
 *
 * This is purely opt-in — if you don't call this hook, nothing happens automatically.
 *
 * @example
 * ```tsx
 * function CourseContent() {
 *   const { api } = useScorm();
 *   useScormAutoTerminate({ trackSessionTime: true });
 *   // api is auto-initialized, will auto-terminate on unmount/unload
 * }
 * ```
 */
export function useScormAutoTerminate(options: AutoTerminateOptions = {}): void {
  const { api } = useScorm();
  const sessionStart = useRef<number | null>(null);
  const hasTerminated = useRef(false);
  const {
    trackSessionTime = true,
    handleUnload = true,
    handleFreeze = true,
  } = options;

  useEffect(() => {
    if (!api) return;

    // Reset termination guard so a re-initialized session (e.g. api identity changed)
    // can terminate correctly. Without this reset, doTerminate would be a no-op if
    // the effect re-runs after the first session was terminated.
    hasTerminated.current = false;
    sessionStart.current = null;

    const initResult = api.initialize();
    if (initResult.ok) {
      sessionStart.current = Date.now();
    }

    const doTerminate = () => {
      if (hasTerminated.current) return;
      hasTerminated.current = true;

      if (trackSessionTime && sessionStart.current !== null) {
        const elapsed = Date.now() - sessionStart.current;
        api.setSessionTime(elapsed);
      }
      // Commit errors are intentionally not re-thrown here — we are in an unload/
      // cleanup path where throwing would swallow the terminate call entirely.
      api.commit();
      api.terminate();
    };

    if (handleUnload) {
      window.addEventListener('beforeunload', doTerminate);
      window.addEventListener('pagehide', doTerminate, { capture: true });
    }
    if (handleFreeze) {
      window.addEventListener('freeze', doTerminate);
    }

    return () => {
      doTerminate();
      if (handleUnload) {
        window.removeEventListener('beforeunload', doTerminate);
        window.removeEventListener('pagehide', doTerminate, { capture: true });
      }
      if (handleFreeze) {
        window.removeEventListener('freeze', doTerminate);
      }
    };
  }, [api, trackSessionTime, handleUnload, handleFreeze]);
}

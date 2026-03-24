/**
 * SessionContext — shares a single useScormSession() instance across all demo sections.
 *
 * ScormProvider intentionally keeps status.initialized = false (static snapshot).
 * useScormSession() maintains reactive initialized/terminated state, but only within
 * the component that calls it. By hoisting the call to ScormDemoShell and distributing
 * it via context, all sections share the same live session state.
 */
import { createContext, useContext } from 'react';
import { useScormSession } from '@studiolxd/react-scorm';

type SessionValue = ReturnType<typeof useScormSession>;

export const SessionContext = createContext<SessionValue | null>(null);

export function useSessionContext(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext must be used inside ScormDemoShell');
  return ctx;
}

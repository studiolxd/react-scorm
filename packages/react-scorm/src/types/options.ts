import type { ScormVersion } from './common';

/**
 * Behavior when no LMS API object is found:
 * - "error": Operations return typed ScormError results. status.apiFound=false.
 * - "mock": Use an in-memory mock (for local dev/tests).
 * - "throw": Throw a ScormError immediately (for strict environments).
 */
export type NoLmsBehavior = 'error' | 'mock' | 'throw';

/** Configuration options for ScormProvider. */
export interface ScormProviderOptions {
  /** Maximum depth to traverse window.parent chain. Default: 10. */
  maxParentDepth?: number;
  /** Whether to check window.opener. Default: true. */
  checkOpener?: boolean;
  /** Behavior when no LMS API is found. Default: 'error'. */
  noLmsBehavior?: NoLmsBehavior;
  /** Enable debug logging of all SCORM calls. Default: false. */
  debug?: boolean;
}

/** Props for the <ScormProvider> component. */
export interface ScormProviderProps {
  /** Which SCORM version to use. */
  version: ScormVersion;
  /** Provider configuration options. */
  options?: ScormProviderOptions;
  /** React children. */
  children: React.ReactNode;
}

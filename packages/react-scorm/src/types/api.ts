import type { Result } from '../result/result';
import type { ScormError } from '../errors/scorm-error';
import type { ScormVersion } from './common';

/**
 * Supported SCORM interaction types.
 * "long-fill-in" is SCORM 2004 only.
 */
export type InteractionType =
  | 'true-false'
  | 'choice'
  | 'fill-in'
  | 'matching'
  | 'performance'
  | 'sequencing'
  | 'likert'
  | 'numeric'
  | 'long-fill-in'
  | 'other';

/** Data for recording an interaction. */
export interface InteractionRecord {
  /** Unique identifier for this interaction. */
  id: string;
  /** Type of interaction. */
  type: InteractionType;
  /** Human-readable description (2004 only). */
  description?: string;
  /** The learner's response. */
  learnerResponse?: string;
  /** Correct response pattern(s). */
  correctResponses?: string[];
  /** Result: "correct", "incorrect", "unanticipated", "neutral", or a numeric score. */
  result?: string;
  /** Relative weighting for this interaction. */
  weighting?: number;
  /** Latency (time to respond). Will be formatted per version. */
  latency?: string;
  /** Timestamp of the interaction (2004: ISO 8601, 1.2: HH:MM:SS). */
  timestamp?: string;
  /** Objective IDs associated with this interaction. */
  objectiveIds?: string[];
}

/** Data for an objective. */
export interface ObjectiveRecord {
  /** Unique identifier for this objective. */
  id: string;
  /** Raw score. */
  scoreRaw?: number;
  /** Minimum possible score. */
  scoreMin?: number;
  /** Maximum possible score. */
  scoreMax?: number;
  /** Scaled score (-1.0 to 1.0). SCORM 2004 only. */
  scoreScaled?: number;
  /** Status (1.2: passed/failed/completed/incomplete/browsed/not attempted). */
  status?: string;
  /** Success status (2004 only: passed/failed/unknown). */
  successStatus?: string;
  /** Completion status (2004 only: completed/incomplete/not attempted/unknown). */
  completionStatus?: string;
  /** Progress measure (2004 only: 0.0 to 1.0). */
  progressMeasure?: number;
  /** Description (2004 only). */
  description?: string;
}

/** Score components. */
export interface ScoreData {
  /** Raw score value. */
  raw?: number;
  /** Minimum possible score. */
  min?: number;
  /** Maximum possible score. */
  max?: number;
  /** Scaled score (-1.0 to 1.0). SCORM 2004 only. */
  scaled?: number;
}

/** High-level version-agnostic SCORM API interface. */
export interface IScormApi {
  readonly version: ScormVersion;

  // --- Lifecycle ---
  initialize(): Result<true, ScormError>;
  terminate(): Result<true, ScormError>;
  commit(): Result<true, ScormError>;

  // --- Learner info (read-only) ---
  getLearnerId(): Result<string, ScormError>;
  getLearnerName(): Result<string, ScormError>;

  // --- Launch / course data ---
  getLaunchData(): Result<string, ScormError>;
  getMode(): Result<string, ScormError>;
  getCredit(): Result<string, ScormError>;
  getEntry(): Result<string, ScormError>;

  // --- Location & suspend data ---
  getLocation(): Result<string, ScormError>;
  setLocation(value: string): Result<string, ScormError>;
  getSuspendData(): Result<string, ScormError>;
  setSuspendData(value: string): Result<string, ScormError>;

  // --- Completion / success status ---
  setComplete(): Result<string, ScormError>;
  setIncomplete(): Result<string, ScormError>;
  setPassed(): Result<string, ScormError>;
  setFailed(): Result<string, ScormError>;
  getCompletionStatus(): Result<string, ScormError>;
  getSuccessStatus(): Result<string, ScormError>;

  // --- Score ---
  setScore(data: ScoreData): Result<true, ScormError>;
  getScore(): Result<ScoreData, ScormError>;

  // --- Progress (2004 only, returns ok for 1.2 with no-op) ---
  setProgressMeasure(value: number): Result<string, ScormError>;

  // --- Session time ---
  setSessionTime(milliseconds: number): Result<string, ScormError>;
  getTotalTime(): Result<string, ScormError>;

  // --- Exit ---
  setExit(value: string): Result<string, ScormError>;

  // --- Objectives ---
  getObjectiveCount(): Result<number, ScormError>;
  getObjective(index: number): Result<ObjectiveRecord, ScormError>;
  setObjective(index: number, objective: ObjectiveRecord): Result<true, ScormError>;

  // --- Interactions ---
  getInteractionCount(): Result<number, ScormError>;
  recordInteraction(index: number, interaction: InteractionRecord): Result<true, ScormError>;

  // --- Comments (2004 primarily) ---
  addLearnerComment(comment: string, location?: string, timestamp?: string): Result<true, ScormError>;
  getLearnerCommentCount(): Result<number, ScormError>;
  getLmsCommentCount(): Result<number, ScormError>;

  // --- Preferences ---
  getPreferences(): Result<Record<string, string>, ScormError>;
  setPreference(key: string, value: string): Result<string, ScormError>;

  // --- Student data (1.2, read-only from LMS) ---
  getMasteryScore(): Result<string, ScormError>;
  getMaxTimeAllowed(): Result<string, ScormError>;
  getTimeLimitAction(): Result<string, ScormError>;

  // --- ADL Navigation (2004 only) ---
  setNavRequest(request: string): Result<string, ScormError>;
  getNavRequestValid(type: 'continue' | 'previous'): Result<string, ScormError>;

  // --- Raw escape hatch ---
  getRaw(path: string): Result<string, ScormError>;
  setRaw(path: string, value: string): Result<string, ScormError>;
}

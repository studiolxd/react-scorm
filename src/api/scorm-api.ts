import type { IScormApi, InteractionRecord, ObjectiveRecord, ScoreData } from '../types/api';
import type { IScormDriver } from '../types/driver';
import type { ScormVersion } from '../types/common';
import { ok, err, type Result } from '../result/result';
import type { ScormError } from '../errors/scorm-error';
import { formatScorm12Time, formatScorm2004Time } from './time-format';

/**
 * High-level, version-agnostic SCORM API.
 *
 * Wraps an IScormDriver and provides ergonomic methods that
 * internally branch on the SCORM version to use the correct CMI paths.
 */
export class ScormApi implements IScormApi {
  readonly version: ScormVersion;
  private readonly driver: IScormDriver;

  constructor(driver: IScormDriver) {
    this.driver = driver;
    this.version = driver.version;
  }

  // --- Lifecycle ---

  initialize(): Result<true, ScormError> {
    return this.driver.initialize();
  }

  terminate(): Result<true, ScormError> {
    return this.driver.terminate();
  }

  commit(): Result<true, ScormError> {
    return this.driver.commit();
  }

  // --- Learner info ---

  getLearnerId(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.core.student_id' : 'cmi.learner_id',
    );
  }

  getLearnerName(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.core.student_name' : 'cmi.learner_name',
    );
  }

  // --- Launch / course data ---

  getLaunchData(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.launch_data' : 'cmi.launch_data',
    );
  }

  getMode(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.core.lesson_mode' : 'cmi.mode',
    );
  }

  getCredit(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.core.credit' : 'cmi.credit',
    );
  }

  getEntry(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.core.entry' : 'cmi.entry',
    );
  }

  // --- Location & suspend data ---

  getLocation(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.core.lesson_location' : 'cmi.location',
    );
  }

  setLocation(value: string): Result<string, ScormError> {
    return this.driver.setValue(
      this.version === '1.2' ? 'cmi.core.lesson_location' : 'cmi.location',
      value,
    );
  }

  getSuspendData(): Result<string, ScormError> {
    return this.driver.getValue('cmi.suspend_data');
  }

  setSuspendData(value: string): Result<string, ScormError> {
    return this.driver.setValue('cmi.suspend_data', value);
  }

  // --- Completion / success status ---

  setComplete(): Result<string, ScormError> {
    if (this.version === '1.2') {
      return this.driver.setValue('cmi.core.lesson_status', 'completed');
    }
    return this.driver.setValue('cmi.completion_status', 'completed');
  }

  setIncomplete(): Result<string, ScormError> {
    if (this.version === '1.2') {
      return this.driver.setValue('cmi.core.lesson_status', 'incomplete');
    }
    return this.driver.setValue('cmi.completion_status', 'incomplete');
  }

  setPassed(): Result<string, ScormError> {
    if (this.version === '1.2') {
      return this.driver.setValue('cmi.core.lesson_status', 'passed');
    }
    return this.driver.setValue('cmi.success_status', 'passed');
  }

  setFailed(): Result<string, ScormError> {
    if (this.version === '1.2') {
      return this.driver.setValue('cmi.core.lesson_status', 'failed');
    }
    return this.driver.setValue('cmi.success_status', 'failed');
  }

  getCompletionStatus(): Result<string, ScormError> {
    if (this.version === '1.2') {
      return this.driver.getValue('cmi.core.lesson_status');
    }
    return this.driver.getValue('cmi.completion_status');
  }

  getSuccessStatus(): Result<string, ScormError> {
    if (this.version === '1.2') {
      // SCORM 1.2 doesn't have a separate success status
      return this.driver.getValue('cmi.core.lesson_status');
    }
    return this.driver.getValue('cmi.success_status');
  }

  // --- Score ---

  setScore(data: ScoreData): Result<true, ScormError> {
    const prefix = this.version === '1.2' ? 'cmi.core.score' : 'cmi.score';
    const results: Result<string, ScormError>[] = [];

    if (data.raw !== undefined) {
      results.push(this.driver.setValue(`${prefix}.raw`, String(data.raw)));
    }
    if (data.min !== undefined) {
      results.push(this.driver.setValue(`${prefix}.min`, String(data.min)));
    }
    if (data.max !== undefined) {
      results.push(this.driver.setValue(`${prefix}.max`, String(data.max)));
    }
    if (data.scaled !== undefined && this.version === '2004') {
      results.push(this.driver.setValue('cmi.score.scaled', String(data.scaled)));
    }

    const firstError = results.find(r => !r.ok);
    if (firstError && !firstError.ok) return err(firstError.error);
    return ok(true);
  }

  getScore(): Result<ScoreData, ScormError> {
    const prefix = this.version === '1.2' ? 'cmi.core.score' : 'cmi.score';
    const scoreData: ScoreData = {};

    const rawResult = this.driver.getValue(`${prefix}.raw`);
    if (rawResult.ok && rawResult.value !== '') {
      scoreData.raw = parseFloat(rawResult.value);
    } else if (!rawResult.ok) {
      return err(rawResult.error);
    }

    const minResult = this.driver.getValue(`${prefix}.min`);
    if (minResult.ok && minResult.value !== '') {
      scoreData.min = parseFloat(minResult.value);
    }

    const maxResult = this.driver.getValue(`${prefix}.max`);
    if (maxResult.ok && maxResult.value !== '') {
      scoreData.max = parseFloat(maxResult.value);
    }

    if (this.version === '2004') {
      const scaledResult = this.driver.getValue('cmi.score.scaled');
      if (scaledResult.ok && scaledResult.value !== '') {
        scoreData.scaled = parseFloat(scaledResult.value);
      }
    }

    return ok(scoreData);
  }

  // --- Progress (2004 only) ---

  setProgressMeasure(value: number): Result<string, ScormError> {
    if (this.version === '1.2') {
      // No equivalent in SCORM 1.2, return success as no-op
      return ok('');
    }
    return this.driver.setValue('cmi.progress_measure', String(value));
  }

  // --- Session time ---

  setSessionTime(milliseconds: number): Result<string, ScormError> {
    const formatted = this.version === '1.2'
      ? formatScorm12Time(milliseconds)
      : formatScorm2004Time(milliseconds);
    const path = this.version === '1.2' ? 'cmi.core.session_time' : 'cmi.session_time';
    return this.driver.setValue(path, formatted);
  }

  getTotalTime(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.core.total_time' : 'cmi.total_time',
    );
  }

  // --- Exit ---

  setExit(value: string): Result<string, ScormError> {
    return this.driver.setValue(
      this.version === '1.2' ? 'cmi.core.exit' : 'cmi.exit',
      value,
    );
  }

  // --- Objectives ---

  getObjectiveCount(): Result<number, ScormError> {
    const result = this.driver.getValue('cmi.objectives._count');
    if (!result.ok) return err(result.error);
    return ok(parseInt(result.value, 10) || 0);
  }

  getObjective(index: number): Result<ObjectiveRecord, ScormError> {
    const base = `cmi.objectives.${index}`;
    const record: ObjectiveRecord = { id: '' };

    const idResult = this.driver.getValue(`${base}.id`);
    if (!idResult.ok) return err(idResult.error);
    record.id = idResult.value;

    // Score fields
    const rawResult = this.driver.getValue(`${base}.score.raw`);
    if (rawResult.ok && rawResult.value !== '') record.scoreRaw = parseFloat(rawResult.value);

    const minResult = this.driver.getValue(`${base}.score.min`);
    if (minResult.ok && minResult.value !== '') record.scoreMin = parseFloat(minResult.value);

    const maxResult = this.driver.getValue(`${base}.score.max`);
    if (maxResult.ok && maxResult.value !== '') record.scoreMax = parseFloat(maxResult.value);

    if (this.version === '1.2') {
      const statusResult = this.driver.getValue(`${base}.status`);
      if (statusResult.ok && statusResult.value !== '') record.status = statusResult.value;
    } else {
      // SCORM 2004 additional fields
      const scaledResult = this.driver.getValue(`${base}.score.scaled`);
      if (scaledResult.ok && scaledResult.value !== '') record.scoreScaled = parseFloat(scaledResult.value);

      const successResult = this.driver.getValue(`${base}.success_status`);
      if (successResult.ok && successResult.value !== '') record.successStatus = successResult.value;

      const completionResult = this.driver.getValue(`${base}.completion_status`);
      if (completionResult.ok && completionResult.value !== '') record.completionStatus = completionResult.value;

      const progressResult = this.driver.getValue(`${base}.progress_measure`);
      if (progressResult.ok && progressResult.value !== '') record.progressMeasure = parseFloat(progressResult.value);

      const descResult = this.driver.getValue(`${base}.description`);
      if (descResult.ok && descResult.value !== '') record.description = descResult.value;
    }

    return ok(record);
  }

  setObjective(index: number, objective: ObjectiveRecord): Result<true, ScormError> {
    const base = `cmi.objectives.${index}`;
    const results: Result<string, ScormError>[] = [];

    results.push(this.driver.setValue(`${base}.id`, objective.id));

    if (objective.scoreRaw !== undefined) {
      results.push(this.driver.setValue(`${base}.score.raw`, String(objective.scoreRaw)));
    }
    if (objective.scoreMin !== undefined) {
      results.push(this.driver.setValue(`${base}.score.min`, String(objective.scoreMin)));
    }
    if (objective.scoreMax !== undefined) {
      results.push(this.driver.setValue(`${base}.score.max`, String(objective.scoreMax)));
    }

    if (this.version === '1.2') {
      if (objective.status) {
        results.push(this.driver.setValue(`${base}.status`, objective.status));
      }
    } else {
      if (objective.scoreScaled !== undefined) {
        results.push(this.driver.setValue(`${base}.score.scaled`, String(objective.scoreScaled)));
      }
      if (objective.successStatus) {
        results.push(this.driver.setValue(`${base}.success_status`, objective.successStatus));
      }
      if (objective.completionStatus) {
        results.push(this.driver.setValue(`${base}.completion_status`, objective.completionStatus));
      }
      if (objective.progressMeasure !== undefined) {
        results.push(this.driver.setValue(`${base}.progress_measure`, String(objective.progressMeasure)));
      }
      if (objective.description) {
        results.push(this.driver.setValue(`${base}.description`, objective.description));
      }
    }

    const firstError = results.find(r => !r.ok);
    if (firstError && !firstError.ok) return err(firstError.error);
    return ok(true);
  }

  // --- Interactions ---

  getInteractionCount(): Result<number, ScormError> {
    const result = this.driver.getValue('cmi.interactions._count');
    if (!result.ok) return err(result.error);
    return ok(parseInt(result.value, 10) || 0);
  }

  recordInteraction(index: number, interaction: InteractionRecord): Result<true, ScormError> {
    const base = `cmi.interactions.${index}`;
    const results: Result<string, ScormError>[] = [];

    results.push(this.driver.setValue(`${base}.id`, interaction.id));
    results.push(this.driver.setValue(`${base}.type`, interaction.type));

    if (interaction.timestamp) {
      const timeField = this.version === '1.2' ? 'time' : 'timestamp';
      results.push(this.driver.setValue(`${base}.${timeField}`, interaction.timestamp));
    }

    if (interaction.weighting !== undefined) {
      results.push(this.driver.setValue(`${base}.weighting`, String(interaction.weighting)));
    }

    if (interaction.learnerResponse) {
      const responseField = this.version === '1.2' ? 'student_response' : 'learner_response';
      results.push(this.driver.setValue(`${base}.${responseField}`, interaction.learnerResponse));
    }

    if (interaction.result) {
      results.push(this.driver.setValue(`${base}.result`, interaction.result));
    }

    if (interaction.latency) {
      results.push(this.driver.setValue(`${base}.latency`, interaction.latency));
    }

    if (interaction.description && this.version === '2004') {
      results.push(this.driver.setValue(`${base}.description`, interaction.description));
    }

    // Correct responses
    if (interaction.correctResponses) {
      for (let i = 0; i < interaction.correctResponses.length; i++) {
        results.push(this.driver.setValue(
          `${base}.correct_responses.${i}.pattern`,
          interaction.correctResponses[i]!,
        ));
      }
    }

    // Objective IDs
    if (interaction.objectiveIds) {
      for (let i = 0; i < interaction.objectiveIds.length; i++) {
        results.push(this.driver.setValue(
          `${base}.objectives.${i}.id`,
          interaction.objectiveIds[i]!,
        ));
      }
    }

    const firstError = results.find(r => !r.ok);
    if (firstError && !firstError.ok) return err(firstError.error);
    return ok(true);
  }

  // --- Comments ---

  addLearnerComment(comment: string, location?: string, timestamp?: string): Result<true, ScormError> {
    if (this.version === '1.2') {
      // SCORM 1.2 comments are a single concatenated string
      const existing = this.driver.getValue('cmi.comments');
      const current = existing.ok ? existing.value : '';
      const newComment = current ? `${current}\n${comment}` : comment;
      const result = this.driver.setValue('cmi.comments', newComment);
      if (!result.ok) return err(result.error);
      return ok(true);
    }

    // SCORM 2004: indexed comments_from_learner
    const countResult = this.driver.getValue('cmi.comments_from_learner._count');
    const count = countResult.ok ? (parseInt(countResult.value, 10) || 0) : 0;
    const base = `cmi.comments_from_learner.${count}`;
    const results: Result<string, ScormError>[] = [];

    results.push(this.driver.setValue(`${base}.comment`, comment));
    if (location) {
      results.push(this.driver.setValue(`${base}.location`, location));
    }
    if (timestamp) {
      results.push(this.driver.setValue(`${base}.timestamp`, timestamp));
    }

    const firstError = results.find(r => !r.ok);
    if (firstError && !firstError.ok) return err(firstError.error);
    return ok(true);
  }

  getLearnerCommentCount(): Result<number, ScormError> {
    if (this.version === '1.2') {
      // SCORM 1.2 doesn't have indexed learner comments
      return ok(0);
    }
    const result = this.driver.getValue('cmi.comments_from_learner._count');
    if (!result.ok) return err(result.error);
    return ok(parseInt(result.value, 10) || 0);
  }

  getLmsCommentCount(): Result<number, ScormError> {
    if (this.version === '1.2') {
      return ok(0);
    }
    const result = this.driver.getValue('cmi.comments_from_lms._count');
    if (!result.ok) return err(result.error);
    return ok(parseInt(result.value, 10) || 0);
  }

  // --- Preferences ---

  getPreferences(): Result<Record<string, string>, ScormError> {
    const prefs: Record<string, string> = {};

    if (this.version === '1.2') {
      const keys = ['audio', 'language', 'speed', 'text'] as const;
      for (const key of keys) {
        const result = this.driver.getValue(`cmi.student_preference.${key}`);
        if (result.ok) prefs[key] = result.value;
      }
    } else {
      const keys = ['audio_level', 'language', 'delivery_speed', 'audio_captioning'] as const;
      for (const key of keys) {
        const result = this.driver.getValue(`cmi.learner_preference.${key}`);
        if (result.ok) prefs[key] = result.value;
      }
    }

    return ok(prefs);
  }

  setPreference(key: string, value: string): Result<string, ScormError> {
    const prefix = this.version === '1.2'
      ? 'cmi.student_preference'
      : 'cmi.learner_preference';
    return this.driver.setValue(`${prefix}.${key}`, value);
  }

  // --- Student data (1.2, read-only from LMS) ---

  getMasteryScore(): Result<string, ScormError> {
    if (this.version === '1.2') {
      return this.driver.getValue('cmi.student_data.mastery_score');
    }
    return this.driver.getValue('cmi.scaled_passing_score');
  }

  getMaxTimeAllowed(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.student_data.max_time_allowed' : 'cmi.max_time_allowed',
    );
  }

  getTimeLimitAction(): Result<string, ScormError> {
    return this.driver.getValue(
      this.version === '1.2' ? 'cmi.student_data.time_limit_action' : 'cmi.time_limit_action',
    );
  }

  // --- ADL Navigation (2004 only) ---

  setNavRequest(request: string): Result<string, ScormError> {
    if (this.version === '1.2') {
      return ok('');
    }
    return this.driver.setValue('adl.nav.request', request);
  }

  getNavRequestValid(type: 'continue' | 'previous'): Result<string, ScormError> {
    if (this.version === '1.2') {
      return ok('');
    }
    return this.driver.getValue(`adl.nav.request_valid.${type}`);
  }

  // --- Raw escape hatch ---

  getRaw(path: string): Result<string, ScormError> {
    return this.driver.getValue(path);
  }

  setRaw(path: string, value: string): Result<string, ScormError> {
    return this.driver.setValue(path, value);
  }
}

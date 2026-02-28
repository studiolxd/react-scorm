/**
 * Format milliseconds as SCORM 1.2 session time: HH:MM:SS.SS
 *
 * Hours can exceed 99. Minutes are 0-59. Seconds are 0-59.99.
 * The fractional seconds use 2 decimal places.
 */
export function formatScorm12Time(milliseconds: number): string {
  if (milliseconds < 0) milliseconds = 0;

  const totalSeconds = milliseconds / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = seconds.toFixed(2).padStart(5, '0');

  return `${hh}:${mm}:${ss}`;
}

/**
 * Format milliseconds as SCORM 2004 ISO 8601 duration: PT#H#M#S
 *
 * Examples: PT1H30M15S, PT0H2M30.5S, PT45S, PT0S
 * Always includes at least seconds to avoid empty "PT".
 */
export function formatScorm2004Time(milliseconds: number): string {
  if (milliseconds < 0) milliseconds = 0;

  const totalSeconds = milliseconds / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;

  // Format seconds: use integer if whole number, 2 decimal places otherwise
  const secondsStr = seconds === Math.floor(seconds)
    ? String(seconds)
    : seconds.toFixed(2);
  duration += `${secondsStr}S`;

  return duration;
}

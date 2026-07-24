/**
 * goalUtils.js - Pure functions for goal math.
 * Ensures zero division, NaN, and negative progress bugs do not occur.
 */

export function calculateGoalProgressRaw(currentAmount, targetAmount) {
  const current = Number(currentAmount) || 0;
  const target = Number(targetAmount) || 0;
  
  if (target <= 0) return 0;
  
  const pct = (current / target) * 100;
  // Ensure we don't return Infinity or NaN, and cap at 100%
  return parseFloat(Math.min(100, Math.max(0, pct)).toFixed(2)) || 0;
}

export function calculateGoalRemainingRaw(currentAmount, targetAmount) {
  const current = Number(currentAmount) || 0;
  const target = Number(targetAmount) || 0;
  
  // Remaining can't be negative
  return parseFloat(Math.max(0, target - current).toFixed(2)) || 0;
}

export function calculateRemainingMonthsRaw(targetDate) {
  if (!targetDate) return 0;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  
  if (isNaN(target.getTime()) || target <= now) return 0;
  
  const diffTime = target - now;
  // 30.44 days per month on average
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)) || 0;
}

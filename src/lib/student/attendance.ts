/**
 * Utility functions for Student Attendance Calculations
 */

export interface AttendanceResult {
  total: number;
  attended: number;
  missed: number;
  currentPercentage: number;
  requiredPercentage: number;
  status: 'above' | 'below' | 'exact' | 'unreachable';
  classesToAttend: number;
  classesCanMiss: number;
  projectedAttendanceIfAttended?: {
    futureAttended: number;
    newTotal: number;
    newAttended: number;
    newPercentage: number;
  };
  projectedAttendanceIfMissed?: {
    futureMissed: number;
    newTotal: number;
    newAttended: number;
    newPercentage: number;
  };
  message: string;
}

export interface SubjectAttendance {
  id: string;
  name: string;
  total: number;
  attended: number;
  requiredPercentage: number;
}

/**
 * Calculates current attendance and future requirements
 */
export function calculateAttendance(
  totalClasses: number,
  attendedClasses: number,
  requiredPercentage: number = 75
): AttendanceResult {
  const total = Math.max(0, Math.floor(totalClasses));
  const attended = Math.max(0, Math.floor(attendedClasses));
  const req = Math.min(100, Math.max(0, requiredPercentage));
  const missed = Math.max(0, total - attended);

  if (total === 0) {
    return {
      total: 0,
      attended: 0,
      missed: 0,
      currentPercentage: 0,
      requiredPercentage: req,
      status: 'exact',
      classesToAttend: 0,
      classesCanMiss: 0,
      message: 'No classes have been conducted yet. Enter total classes to begin calculating.',
    };
  }

  // Raw current percentage
  const currentPercentage = (attended / total) * 100;
  const targetFraction = req / 100;

  // Case 1: Attendance is exactly on target
  if (Math.abs(currentPercentage - req) < 0.001) {
    return {
      total,
      attended,
      missed,
      currentPercentage,
      requiredPercentage: req,
      status: 'exact',
      classesToAttend: 0,
      classesCanMiss: 0,
      message: `Your attendance is exactly at the required ${req}%. Attend every upcoming class to maintain this threshold.`,
    };
  }

  // Case 2: Attendance is below required
  if (currentPercentage < req) {
    // If target is 100% and student already missed a class (missed > 0), they can never reach 100%
    if (req >= 100) {
      return {
        total,
        attended,
        missed,
        currentPercentage,
        requiredPercentage: req,
        status: 'unreachable',
        classesToAttend: 0,
        classesCanMiss: 0,
        message: `With ${missed} missed ${missed === 1 ? 'class' : 'classes'}, it is mathematically impossible to attain a 100% attendance rate.`,
      };
    }

    // Formula: (attended + x) / (total + x) >= targetFraction
    // attended + x >= targetFraction * total + targetFraction * x
    // x * (1 - targetFraction) >= targetFraction * total - attended
    // x >= (targetFraction * total - attended) / (1 - targetFraction)
    const numerator = targetFraction * total - attended;
    const denominator = 1 - targetFraction;
    const needed = Math.ceil(numerator / denominator);
    const classesToAttend = Math.max(0, needed);

    const newAttended = attended + classesToAttend;
    const newTotal = total + classesToAttend;
    const newPercentage = (newAttended / newTotal) * 100;

    return {
      total,
      attended,
      missed,
      currentPercentage,
      requiredPercentage: req,
      status: 'below',
      classesToAttend,
      classesCanMiss: 0,
      projectedAttendanceIfAttended: {
        futureAttended: classesToAttend,
        newTotal,
        newAttended,
        newPercentage,
      },
      message: `You must attend ${classesToAttend} consecutive ${classesToAttend === 1 ? 'class' : 'classes'} to bring your attendance back up to ${req}%.`,
    };
  }

  // Case 3: Attendance is above required
  // Formula: attended / (total + y) >= targetFraction
  // attended >= targetFraction * total + targetFraction * y
  // targetFraction * y <= attended - targetFraction * total
  // y <= (attended - targetFraction * total) / targetFraction = (attended / targetFraction) - total
  let classesCanMiss = 0;
  if (targetFraction <= 0) {
    classesCanMiss = 999; // Unlimited
  } else {
    const rawMissable = (attended / targetFraction) - total;
    classesCanMiss = Math.max(0, Math.floor(rawMissable));
  }

  const newTotalIfMissed = total + classesCanMiss;
  const newPercentageIfMissed = (attended / newTotalIfMissed) * 100;

  return {
    total,
    attended,
    missed,
    currentPercentage,
    requiredPercentage: req,
    status: 'above',
    classesToAttend: 0,
    classesCanMiss,
    projectedAttendanceIfMissed: {
      futureMissed: classesCanMiss,
      newTotal: newTotalIfMissed,
      newAttended: attended,
      newPercentage: newPercentageIfMissed,
    },
    message: classesCanMiss > 0
      ? `You can safely miss ${classesCanMiss} upcoming ${classesCanMiss === 1 ? 'class' : 'classes'} while remaining at or above ${req}%.`
      : `You are currently above ${req}%, but missing the very next class will drop your attendance below the required threshold.`,
  };
}

/**
 * Calculates aggregate attendance across multiple subjects
 */
export function calculateAggregateAttendance(subjects: SubjectAttendance[]): {
  totalClasses: number;
  attendedClasses: number;
  missedClasses: number;
  overallPercentage: number;
  belowThresholdCount: number;
} {
  let totalClasses = 0;
  let attendedClasses = 0;
  let belowThresholdCount = 0;

  subjects.forEach((s) => {
    totalClasses += s.total;
    attendedClasses += s.attended;
    const pct = s.total > 0 ? (s.attended / s.total) * 100 : 0;
    if (s.total > 0 && pct < s.requiredPercentage) {
      belowThresholdCount++;
    }
  });

  const missedClasses = Math.max(0, totalClasses - attendedClasses);
  const overallPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

  return {
    totalClasses,
    attendedClasses,
    missedClasses,
    overallPercentage,
    belowThresholdCount,
  };
}

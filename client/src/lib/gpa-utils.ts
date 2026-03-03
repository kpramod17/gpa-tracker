export const gradePoints: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0,
};

export const gradeOptions = Object.keys(gradePoints);

export interface Course {
  id: string;
  name: string;
  units: number;
  grade: string;
}

export interface TermStats {
  gpa: number;
  totalUnits: number;
  totalPoints: number;
}

export function calculateTermGPA(courses: Course[]): TermStats {
  let totalPoints = 0;
  let totalUnits = 0;

  courses.forEach(course => {
    const points = gradePoints[course.grade] * course.units;
    totalPoints += points;
    totalUnits += course.units;
  });

  const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  return {
    gpa: Math.round(gpa * 100) / 100,
    totalUnits,
    totalPoints,
  };
}

export function calculateCumulativeGPA(terms: Array<{ courses: Course[] }>): TermStats {
  let totalPoints = 0;
  let totalUnits = 0;

  terms.forEach(term => {
    term.courses.forEach(course => {
      const points = gradePoints[course.grade] * course.units;
      totalPoints += points;
      totalUnits += course.units;
    });
  });

  const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  return {
    gpa: Math.round(gpa * 100) / 100,
    totalUnits,
    totalPoints,
  };
}

export function getProgressPercentage(totalUnits: number, requiredUnits = 72): number {
  return Math.min(Math.round((totalUnits / requiredUnits) * 100), 100);
}

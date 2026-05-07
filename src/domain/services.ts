/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exam, StudentAttempt, ExamResult, Question } from './models';

export interface IGrader {
  evaluate(attempt: StudentAttempt): ExamResult;
}

export class Grader implements IGrader {
  /**
   * Evaluates a StudentAttempt using Question polymorphism.
   */
  public evaluate(attempt: StudentAttempt): ExamResult {
    let earnedPoints = 0;
    const { exam, student, answers } = attempt;

    exam.questions.forEach(question => {
      const studentAnswer = answers.get(question.id);
      if (studentAnswer !== undefined && question.validateAnswer(studentAnswer)) {
        earnedPoints += question.points;
      }
    });

    const totalPossible = exam.totalPoints;
    const scorePercentage = (earnedPoints / totalPossible) * 100;
    const passThreshold = 60;

    return new ExamResult(
      exam.title,
      student.name,
      earnedPoints,
      totalPossible,
      scorePercentage >= passThreshold,
      new Date()
    );
  }
}

export class ExamService {
  public isSubmissionTimedOut(attempt: StudentAttempt): boolean {
    const elapsedMs = attempt.endTime.getTime() - attempt.startTime.getTime();
    const allowedMs = attempt.exam.durationMinutes * 60 * 1000;
    return elapsedMs > allowedMs;
  }
}

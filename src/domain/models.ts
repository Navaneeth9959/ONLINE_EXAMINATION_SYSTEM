/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  TRUE_FALSE = 'true-false',
}

export abstract class Question {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly type: QuestionType,
    public readonly points: number
  ) {}

  abstract validateAnswer(answer: any): boolean;
}

export class MultipleChoiceQuestion extends Question {
  constructor(
    id: string,
    text: string,
    points: number,
    public readonly options: string[],
    private readonly correctAnswerIndex: number
  ) {
    super(id, text, QuestionType.MULTIPLE_CHOICE, points);
  }

  validateAnswer(answer: number): boolean {
    return answer === this.correctAnswerIndex;
  }
}

export class TrueFalseQuestion extends Question {
  constructor(
    id: string,
    text: string,
    points: number,
    private readonly correctAnswer: boolean
  ) {
    super(id, text, QuestionType.TRUE_FALSE, points);
  }

  validateAnswer(answer: boolean): boolean {
    return answer === this.correctAnswer;
  }
}

export class Exam {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly durationMinutes: number,
    public readonly questions: Question[]
  ) {}

  get totalPoints(): number {
    return this.questions.reduce((sum, q) => sum + q.points, 0);
  }
}

export class Student {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {}
}

export class StudentAttempt {
  constructor(
    public readonly student: Student,
    public readonly exam: Exam,
    public readonly answers: Map<string, any>,
    public readonly startTime: Date,
    public readonly endTime: Date
  ) {}
}

export class ExamResult {
  constructor(
    public readonly examTitle: string,
    public readonly studentName: string,
    public readonly score: number,
    public readonly totalPossible: number,
    public readonly passed: boolean,
    public readonly completedAt: Date
  ) {}
}

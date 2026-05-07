/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exam, StudentAttempt, Student, ExamResult } from './models';
import { Grader } from './services';

export enum ExamSessionStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

export type StateChangeCallback = () => void;

/**
 * Controller class to manage interactive exam state.
 * Uses the Observer pattern to notify UI of changes.
 */
export class ExamController {
  private status: ExamSessionStatus = ExamSessionStatus.NOT_STARTED;
  private answers: Map<string, any> = new Map();
  private startTime?: Date;
  private result?: ExamResult;
  private listeners: StateChangeCallback[] = [];

  constructor(
    public readonly exam: Exam,
    public readonly student: Student,
    private readonly grader: Grader
  ) {}

  public subscribe(callback: StateChangeCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  public start(): void {
    if (this.status !== ExamSessionStatus.NOT_STARTED) return;
    this.startTime = new Date();
    this.status = ExamSessionStatus.IN_PROGRESS;
    this.notify();
  }

  public setAnswer(questionId: string, answer: any): void {
    if (this.status !== ExamSessionStatus.IN_PROGRESS) return;
    this.answers.set(questionId, answer);
    this.notify();
  }

  public submit(): void {
    if (this.status !== ExamSessionStatus.IN_PROGRESS || !this.startTime) return;
    
    // Create StudentAttempt using Composition
    const attempt = new StudentAttempt(
      this.student,
      this.exam,
      new Map(this.answers),
      this.startTime,
      new Date()
    );

    // Evaluate using the Grader
    this.result = this.grader.evaluate(attempt);
    this.status = ExamSessionStatus.COMPLETED;
    this.notify();
  }

  // Getters (Encapsulation)
  public getStatus(): ExamSessionStatus { return this.status; }
  public getAnswers(): Map<string, any> { return new Map(this.answers); }
  public getResult(): ExamResult | undefined { return this.result; }
  public getTimeRemainingMs(): number {
    if (!this.startTime) return this.exam.durationMinutes * 60 * 1000;
    const elapsed = Date.now() - this.startTime.getTime();
    return Math.max(0, (this.exam.durationMinutes * 60 * 1000) - elapsed);
  }
}

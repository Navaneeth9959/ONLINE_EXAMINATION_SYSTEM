/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from './models';

/**
 * Singleton AuthSession to manage the current user.
 * Demonstrates the Singleton Pattern and Encapsulation.
 */
export class AuthSession {
  private static instance: AuthSession;
  private currentStudent: Student | null = null;

  private constructor() {}

  public static getInstance(): AuthSession {
    if (!AuthSession.instance) {
      AuthSession.instance = new AuthSession();
    }
    return AuthSession.instance;
  }

  public login(name: string, email: string): Student {
    const id = `s-${Math.random().toString(36).substr(2, 9)}`;
    this.currentStudent = new Student(id, name, email);
    return this.currentStudent;
  }

  public logout(): void {
    this.currentStudent = null;
  }

  public getStudent(): Student | null {
    return this.currentStudent;
  }

  public isAuthenticated(): boolean {
    return this.currentStudent !== null;
  }
}

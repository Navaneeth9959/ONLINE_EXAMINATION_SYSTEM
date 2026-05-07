/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  LogOut,
  ClipboardList,
  AlertCircle,
  User,
  Mail,
  ArrowRight
} from 'lucide-react';

import { 
  MultipleChoiceQuestion, 
  TrueFalseQuestion, 
  Exam, 
  Student, 
  Question 
} from './domain/models';
import { Grader } from './domain/services';
import { ExamController, ExamSessionStatus } from './domain/controller';
import { AuthSession } from './domain/auth';

/**
 * Login View Component
 */
const LoginView: React.FC<{ onLogin: (name: string, email: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) onLogin(name, email);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto w-full bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-black/5"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold italic font-serif">Assessment Login</h2>
        <p className="text-sm text-gray-500 font-mono uppercase tracking-widest mt-2">EduQuest Authentication</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase opacity-50 ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input 
              required
              id="input-name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Akshith Emmadi"
              className="w-full bg-black/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-black outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase opacity-50 ml-1">Academic Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input 
              required
              id="input-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="akshith@university.edu"
              className="w-full bg-black/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-black outline-none transition-all font-medium"
            />
          </div>
        </div>

        <button 
          id="btn-login-submit"
          type="submit"
          className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-[0px] transition-all shadow-xl shadow-black/10"
        >
          Access Exam Portal <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-black/5 text-center">
        <p className="text-[10px] font-mono opacity-30 uppercase">Authorized Educational Access Only</p>
      </div>
    </motion.div>
  );
};

/**
 * Component to handle Question Rendering based on Type (Polymorphic behavior in UI)
 */
const QuestionRenderer: React.FC<{
  question: Question;
  currentAnswer: any;
  onAnswer: (val: any) => void;
}> = ({ question, currentAnswer, onAnswer }) => {
  if (question instanceof MultipleChoiceQuestion) {
    return (
      <div className="space-y-4">
        {question.options.map((option, idx) => (
          <button
            key={`${question.id}-opt-${idx}`}
            id={`q-${question.id}-opt-${idx}`}
            onClick={() => onAnswer(idx)}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              currentAnswer === idx 
                ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' 
                : 'bg-white/50 border-black/10 hover:border-black/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono opacity-50">{String.fromCharCode(65 + idx)}.</span>
              <span className="font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (question instanceof TrueFalseQuestion) {
    return (
      <div className="flex gap-4">
        {[true, false].map((val) => (
          <button
            key={`${question.id}-${val}`}
            id={`q-${question.id}-${val}`}
            onClick={() => onAnswer(val)}
            className={`flex-1 p-4 rounded-lg border transition-all text-center ${
              currentAnswer === val 
                ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' 
                : 'bg-white/50 border-black/10 hover:border-black/30'
            }`}
          >
            {val ? 'TRUE' : 'FALSE'}
          </button>
        ))}
      </div>
    );
  }

  return <div>Unknown question type</div>;
};

export default function App() {
  const [student, setStudent] = useState<Student | null>(AuthSession.getInstance().getStudent());
  const [controller, setController] = useState<ExamController | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [ticker, setTicker] = useState(0);

  // Initialize Exam Controller when student logs in
  useEffect(() => {
    if (!student) {
      setController(null);
      return;
    }

    const questions: Question[] = [
      new MultipleChoiceQuestion(
        'q-1', 
        'Which OOP principle is primarily used to bundle data and methods together?', 
        10, 
        ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], 
        2
      ),
      new TrueFalseQuestion(
        'q-2', 
        'In strict OOP, an object is an instance of a class.', 
        10, 
        true
      ),
      new MultipleChoiceQuestion(
        'q-3', 
        'What allows a class to have multiple methods with the same name but different parameters?', 
        10, 
        ['Method Overriding', 'Method Overloading', 'Recursion', 'Static Typing'], 
        1
      ),
      new MultipleChoiceQuestion(
        'q-4', 
        'Which concept allows a subclass to provide a specific implementation of a method that is already defined in its superclass?', 
        10, 
        ['Encapsulation', 'Abstraction', 'Method Overriding', 'Coupling'], 
        2
      ),
    ];

    const exam = new Exam('ex-1', 'Advanced OOP Concepts', 'Test your knowledge of Object-Oriented principles and practices.', 2, questions);
    const grader = new Grader();
    const ctrl = new ExamController(exam, student, grader);

    // Subscribe to controller changes (Observer Pattern)
    const unsubscribe = ctrl.subscribe(() => {
      setTicker(t => t + 1);
    });

    setController(ctrl);
    return unsubscribe;
  }, [student]);

  // Timer logic
  useEffect(() => {
    if (!controller || controller.getStatus() !== ExamSessionStatus.IN_PROGRESS) return;
    const interval = setInterval(() => setTicker(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [controller]);

  const handleLogin = (name: string, email: string) => {
    const s = AuthSession.getInstance().login(name, email);
    setStudent(s);
  };

  const handleLogout = () => {
    AuthSession.getInstance().logout();
    setStudent(null);
    setController(null);
    setCurrentIdx(0);
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const status = controller?.getStatus();
  const answers = controller?.getAnswers();
  const result = controller?.getResult();

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="mb-8 flex justify-between items-end border-b border-black pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest opacity-50">Online Assessment System</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic font-serif uppercase">EduQuest {controller ? `/ ${controller.exam.title}` : ''}</h1>
        </div>
        {student && (
          <div className="text-right flex items-center gap-4">
            <div className="hidden md:block">
              <p className="text-[10px] font-mono opacity-50 uppercase">Student</p>
              <p className="font-bold whitespace-nowrap">{student.name}</p>
            </div>
            <button 
              id="btn-logout"
              onClick={handleLogout}
              className="p-2 hover:bg-black/5 rounded-full transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:text-red-500" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 relative flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!student ? (
            <LoginView key="login" onLogin={handleLogin} />
          ) : !controller ? (
            <div key="loading" className="text-center font-mono animate-pulse">Initializing Controller...</div>
          ) : (
            <div key="exam-content" className="w-full">
              {status === ExamSessionStatus.NOT_STARTED && (
                <motion.div 
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-2xl border border-black/5"
                >
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4 italic font-serif">Welcome to the Exam Portal</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {controller.exam.description} This assessment consists of 
                      <span className="font-bold text-black"> {controller.exam.questions.length} questions</span>. 
                      You have <span className="font-bold text-black">{controller.exam.durationMinutes} minutes</span> to complete it.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-black/5 rounded-xl border border-black/5 flex items-start gap-3">
                        <Timer className="w-5 h-5 mt-1" />
                        <div>
                          <p className="text-xs font-mono uppercase opacity-50">Time Limit</p>
                          <p className="font-bold">{controller.exam.durationMinutes} Minutes</p>
                        </div>
                      </div>
                      <div className="p-4 bg-black/5 rounded-xl border border-black/5 flex items-start gap-3">
                        <Trophy className="w-5 h-5 mt-1" />
                        <div>
                          <p className="text-xs font-mono uppercase opacity-50">Total Points</p>
                          <p className="font-bold">{controller.exam.totalPoints} Marks</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      id="btn-start"
                      onClick={() => controller.start()}
                      className="bg-[#141414] text-[#E4E3E0] px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      Start Assessment <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {status === ExamSessionStatus.IN_PROGRESS && (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full"
                >
                  {/* Question Area */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/80 p-8 rounded-[2rem] shadow-xl border border-black/5 min-h-[400px] flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-xs font-mono uppercase bg-black text-white px-3 py-1 rounded-full">
                          Question {currentIdx + 1} of {controller.exam.questions.length}
                        </span>
                        <span className="text-xs font-mono opacity-50">
                          POINT VALUE: {controller.exam.questions[currentIdx].points}
                        </span>
                      </div>

                      <h3 className="text-2xl font-medium mb-8 leading-snug">
                        {controller.exam.questions[currentIdx].text}
                      </h3>

                      <div className="flex-1">
                        <QuestionRenderer 
                          question={controller.exam.questions[currentIdx]}
                          currentAnswer={answers?.get(controller.exam.questions[currentIdx].id)}
                          onAnswer={(val) => controller.setAnswer(controller.exam.questions[currentIdx].id, val)}
                        />
                      </div>

                      <div className="flex justify-between mt-8 pt-8 border-t border-black/5">
                        <button 
                          id="btn-prev"
                          disabled={currentIdx === 0}
                          onClick={() => setCurrentIdx(prev => prev - 1)}
                          className="px-6 py-2 rounded-full border border-black/10 disabled:opacity-30 flex items-center gap-2 hover:bg-black/5 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        {currentIdx === controller.exam.questions.length - 1 ? (
                          <button 
                            id="btn-submit"
                            onClick={() => {
                              if (confirm('Are you sure you want to submit your exam?')) {
                                controller.submit();
                              }
                            }}
                            className="px-8 py-2 rounded-full bg-black text-white font-bold hover:scale-105 transition-transform"
                          >
                            Submit Exam
                          </button>
                        ) : (
                          <button 
                            id="btn-next"
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                            className="px-6 py-2 rounded-full border border-black/10 flex items-center gap-2 hover:bg-black/5 transition-colors"
                          >
                            Next <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Sidebar */}
                  <aside className="lg:col-span-4 space-y-6">
                    <div className="bg-white/80 p-6 rounded-2xl shadow-xl border border-black/5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-mono uppercase tracking-widest opacity-50">Time Remaining</h4>
                        <Timer className="w-4 h-4 opacity-50" />
                      </div>
                      <div className={`text-4xl font-mono font-bold tabular-nums ${controller.getTimeRemainingMs() < (60 * 1000) ? 'text-red-600 animate-pulse' : ''}`}>
                        {formatTime(controller.getTimeRemainingMs())}
                      </div>
                    </div>

                    <div className="bg-white/80 p-6 rounded-2xl shadow-xl border border-black/5">
                      <h4 className="text-xs font-mono uppercase tracking-widest opacity-50 mb-4">Assessment Map</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {controller.exam.questions.map((q, idx) => (
                          <button
                            key={q.id}
                            onClick={() => setCurrentIdx(idx)}
                            className={`aspect-square rounded-lg flex items-center justify-center font-mono text-sm border transiton-all ${
                              currentIdx === idx ? 'border-black bg-black text-white' : 
                              answers?.has(q.id) ? 'bg-black/10 border-black/5' : 'bg-transparent border-black/10'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </aside>
                </motion.div>
              )}

              {status === ExamSessionStatus.COMPLETED && result && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto w-full bg-white/80 p-12 rounded-[2.5rem] shadow-2xl border border-black/5 text-center"
                >
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {result.passed ? <CheckCircle2 className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
                  </div>
                  
                  <h2 className="text-4xl font-bold mb-2 italic font-serif">Assessment Finished</h2>
                  <p className="text-gray-500 mb-8 uppercase tracking-widest text-xs font-mono">Submission Received Successfully</p>

                  <div className="bg-black/5 rounded-3xl p-8 mb-8 border border-black/5">
                    <div className="grid grid-cols-2 gap-8 divide-x divide-black/10">
                      <div className="text-center p-4">
                        <p className="text-xs font-mono opacity-50 uppercase mb-1">Your Score</p>
                        <p className="text-5xl font-bold italic font-serif">{result.score} <span className="text-xl opacity-30 font-sans not-italic">/ {result.totalPossible}</span></p>
                      </div>
                      <div className="text-center p-4">
                        <p className="text-xs font-mono opacity-50 uppercase mb-1">Status</p>
                        <p className={`text-4xl font-bold font-serif italic ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <button 
                      id="btn-restart"
                      onClick={() => window.location.reload()}
                      className="px-8 py-4 bg-black text-white rounded-full font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                    >
                      <Trophy className="w-5 h-5" /> Retake Assessment
                    </button>
                    <button 
                      id="btn-exit"
                      onClick={handleLogout}
                      className="px-8 py-4 border border-black/10 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-black/5 transition-colors"
                    >
                      <LogOut className="w-5 h-5" /> Exit Portal
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-12 py-6 border-t border-black/5 text-center">
        <p className="text-[10px] font-mono tracking-tighter opacity-40 uppercase">
          Proprietary Educational Assessment Software &copy; 2024 AI Studio / STRICT_OOP_COMPLIANT_ENGINE
        </p>
      </footer>
    </div>
  );
}

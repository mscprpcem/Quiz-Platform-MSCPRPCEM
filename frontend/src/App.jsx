import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Page Imports
import Home from './pages/Home';
import JoinQuiz from './pages/JoinQuiz';
import WaitingRoom from './pages/WaitingRoom';
import LiveQuiz from './pages/LiveQuiz';
import Results from './pages/Results';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import QuizManagement from './pages/QuizManagement';
import QuestionManagement from './pages/QuestionManagement';
import Analytics from './pages/Analytics';
import PracticeQuiz from './pages/PracticeQuiz';
import RunQuiz from './pages/RunQuiz';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import CodeOfConduct from './pages/CodeOfConduct';
import Disclaimer from './pages/Disclaimer';
import AccessibilityStatement from './pages/AccessibilityStatement';
import QuizRules from './pages/QuizRules';
import FAQDetails from './pages/FAQDetails';
import UserGuide from './pages/UserGuide';
import SupportSLA from './pages/SupportSLA';
import ReportIssue from './pages/ReportIssue';
import Documentation from './pages/Documentation';
import Courses from './pages/Courses';
import AdminCourses from './pages/AdminCourses';
import AdminScheduledQuizzes from './pages/AdminScheduledQuizzes';
import ScheduledQuizDetails from './pages/ScheduledQuizDetails';
import ScheduledQuizTake from './pages/ScheduledQuizTake';
import CreateScheduledQuiz from './pages/CreateScheduledQuiz';
import VanityRedirect from './pages/VanityRedirect';
import StudentAuth from './pages/StudentAuth';
import AuthCallback from './pages/AuthCallback';
import AdminEmailDispatch from './pages/AdminEmailDispatch';
import AdminCumulativeLeaderboard from './pages/AdminCumulativeLeaderboard';
import AdminUsers from './pages/AdminUsers';
import EventRegister from './pages/EventRegister';
import SqlPractice from './pages/SqlPractice';
import SqlCourseHub from './pages/SqlCourseHub';
import GitCourseHub from './pages/GitCourseHub';
import GitPractice from './pages/GitPractice';
import AdminGit from './pages/AdminGit';
import SqlIntroPresentation from './pages/SqlIntroPresentation';
import LeaderboardPreview from './pages/LeaderboardPreview';
import TournamentStandings from './pages/TournamentStandings';
import NotFound from './pages/NotFound';
import RequireAuth from './components/RequireAuth';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Quiz App ErrorBoundary caught rendering exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-segoe text-center">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              🏆
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">Quiz Session Recovery</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                {this.state.error?.message || "An issue occurred while loading this view."}
              </p>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Return to Quiz Portal Homepage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Private Route Enforcer for Admin pages
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-purple-600 font-extrabold text-sm">
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/frogger/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-segoe">
              <Navbar />

            <main className="flex-grow">
              <Routes>
                {/* Public Participant Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/join" element={<JoinQuiz />} />
                <Route path="/join/:joinCode" element={<JoinQuiz />} />
                <Route path="/waiting" element={<WaitingRoom />} />
                <Route path="/waiting/:participantId" element={<WaitingRoom />} />
                <Route path="/live" element={<LiveQuiz />} />
                <Route path="/live-quiz" element={<LiveQuiz />} />
                <Route path="/live/:participantId" element={<LiveQuiz />} />
                <Route path="/results" element={<Results />} />
                <Route path="/leaderboard" element={<TournamentStandings />} />
                <Route path="/tournament-standings" element={<TournamentStandings />} />
                <Route path="/standings" element={<TournamentStandings />} />
                <Route path="/leaderboard-preview" element={<LeaderboardPreview />} />
                {/* SQL Intro Interactive Presentation Routes (Public & Student) */}
                <Route path="/sql/intro" element={<SqlIntroPresentation />} />
                <Route path="/sql/slides" element={<SqlIntroPresentation />} />
                <Route path="/courses/sql/intro" element={<SqlIntroPresentation />} />
                <Route path="/courses/sql/slides" element={<SqlIntroPresentation />} />
                
                {/* Protected Learn, Practice & Lab Routes (Requires Login) */}
                <Route path="/courses/sql" element={<RequireAuth><SqlCourseHub /></RequireAuth>} />
                <Route path="/courses/sql/:tab" element={<RequireAuth><SqlCourseHub /></RequireAuth>} />
                <Route path="/sql" element={<RequireAuth><SqlCourseHub /></RequireAuth>} />
                <Route path="/sql/learn" element={<RequireAuth><SqlCourseHub /></RequireAuth>} />
                <Route path="/sql/:tab" element={<RequireAuth><SqlCourseHub /></RequireAuth>} />
                <Route path="/practice/sql" element={<RequireAuth><SqlCourseHub /></RequireAuth>} />
                <Route path="/practice/sql/lab" element={<RequireAuth><SqlPractice /></RequireAuth>} />
                <Route path="/practice/sql/:challengeId" element={<RequireAuth><SqlPractice /></RequireAuth>} />
                
                {/* Git & GitHub Learning & Interactive Lab Routes (Requires Login) */}
                <Route path="/courses/git" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/courses/git/learn" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/courses/git/roadmap" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/courses/git/cheatsheet" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/courses/git/:tab" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/git" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/git/learn" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/git/roadmap" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/git/cheatsheet" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/git/:tab" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/practice/git" element={<RequireAuth><GitCourseHub /></RequireAuth>} />
                <Route path="/practice/git/lab" element={<RequireAuth><GitPractice /></RequireAuth>} />
                <Route path="/practice/git/:challengeId" element={<RequireAuth><GitPractice /></RequireAuth>} />
                <Route path="/practice" element={<RequireAuth><PracticeQuiz /></RequireAuth>} />
                <Route path="/practice/:category" element={<RequireAuth><PracticeQuiz /></RequireAuth>} />
                <Route path="/courses" element={<RequireAuth><Courses /></RequireAuth>} />
                <Route path="/scheduled-quiz/:occurrenceId" element={<ScheduledQuizTake />} />
                <Route path="/q/:slug" element={<ScheduledQuizTake />} />
                <Route path="/quiz/:slug" element={<ScheduledQuizTake />} />
                <Route path="/q" element={<Navigate to="/" replace />} />
                <Route path="/:slug" element={<VanityRedirect />} />

                {/* Central OAuth 2.0 PKCE Callback Route */}
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Public Event Registration Routes */}
                <Route path="/register/:slug" element={<EventRegister />} />
                <Route path="/event/:slug" element={<EventRegister />} />
                <Route path="/events/:slug" element={<EventRegister />} />

                {/* Student Auth Routes with Verification Portal Sync */}
                <Route path="/login" element={<StudentAuth />} />
                <Route path="/register" element={<StudentAuth />} />
                <Route path="/student/login" element={<StudentAuth />} />
                <Route path="/student/register" element={<StudentAuth />} />

                {/* Footer Policy Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/code-of-conduct" element={<CodeOfConduct />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/accessibility" element={<AccessibilityStatement />} />
                <Route path="/rules" element={<QuizRules />} />
                <Route path="/faq" element={<FAQDetails />} />
                <Route path="/guide" element={<UserGuide />} />
                <Route path="/sla" element={<SupportSLA />} />
                <Route path="/report-issue" element={<ReportIssue />} />
                <Route path="/docs" element={<Documentation />} />

                {/* Admin Auth Route */}
                <Route path="/frogger/login" element={<AdminLogin />} />
                <Route path="/frogger" element={<Navigate to="/frogger/login" replace />} />
                <Route path="/admin/login" element={<Navigate to="/frogger/login" replace />} />
                <Route path="/admin" element={<Navigate to="/frogger/login" replace />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/quizzes"
                  element={
                    <AdminRoute>
                      <QuizManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/scheduled-quizzes"
                  element={
                    <AdminRoute>
                      <AdminScheduledQuizzes />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/scheduled-quizzes/create"
                  element={
                    <AdminRoute>
                      <CreateScheduledQuiz />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/scheduled-quizzes/edit/:id"
                  element={
                    <AdminRoute>
                      <CreateScheduledQuiz />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/scheduled-quizzes/:id"
                  element={
                    <AdminRoute>
                      <ScheduledQuizDetails />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/quizzes/:id"
                  element={
                    <AdminRoute>
                      <QuestionManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/run-quiz/:id"
                  element={
                    <AdminRoute>
                      <RunQuiz />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AdminRoute>
                      <Analytics />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/analytics/:id"
                  element={
                    <AdminRoute>
                      <Analytics />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/courses"
                  element={
                    <AdminRoute>
                      <AdminCourses />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/git"
                  element={
                    <AdminRoute>
                      <AdminGit />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/email-dispatch"
                  element={
                    <AdminRoute>
                      <AdminEmailDispatch />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/cumulative-leaderboard"
                  element={
                    <AdminRoute>
                      <AdminCumulativeLeaderboard />
                    </AdminRoute>
                  }
                />

                {/* Fallback 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  </ToastProvider>
</ErrorBoundary>
);
}

export default App;

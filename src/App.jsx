import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Page imports
import Landing from './pages/Landing';
import CoachDashboard from './pages/CoachDashboard';
import Students from './pages/Students';
import Exercises from './pages/Exercises';
import Routines from './pages/Routines';
import Evaluations from './pages/Evaluations';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Coaching from './pages/Coaching';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';
import StudentDashboard from './pages/StudentDashboard';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import CoachRegister from './pages/CoachRegister';
import SuperAdmin from './pages/SuperAdmin';
import Messages from './pages/Messages';
import DemoSignup from './pages/DemoSignup';
import Nutrition from './pages/Nutrition';
import Progression from './pages/Progression';
import ContentLibrary from './pages/ContentLibrary';
import Habits from './pages/Habits';
import ExerciseLibrary from './pages/ExerciseLibrary';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();
  const location = useLocation();
  const isPublicRoute = ['/', '/demo', '/coach-register'].includes(location.pathname);

  if (isLoadingAuth && !isPublicRoute) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
            <span className="text-white font-display font-bold text-lg">W</span>
          </div>
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError && !isPublicRoute) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/demo" element={<DemoSignup />} />
      <Route path="/coach-register" element={<CoachRegister />} />
      <Route path="/super-admin" element={<SuperAdmin />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<CoachDashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/chat" element={<Messages />} />
        <Route path="/coaching" element={<Coaching />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/my-dashboard" element={<StudentDashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/progression" element={<Progression />} />
        <Route path="/library" element={<ContentLibrary />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/exercise-library" element={<ExerciseLibrary />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
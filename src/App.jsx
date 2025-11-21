import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import PlanDetail from './pages/PlanDetail';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

// V2 - Coach pages
import CoachMarketplace from './pages/CoachMarketplace';
import CoachProfile from './pages/CoachProfile';
import CoachDashboard from './pages/CoachDashboard';
import CreateCoachProfile from './pages/CreateCoachProfile';

// V2 - Group pages
import GroupsMarketplace from './pages/GroupsMarketplace';
import GroupDetail from './pages/GroupDetail';
import MyGroups from './pages/MyGroups';
import CoachGroups from './pages/CoachGroups';
import CreateGroup from './pages/CreateGroup';
import CreateGroupSession from './pages/CreateGroupSession';
import SessionDetail from './pages/SessionDetail';

function ProtectedRoute({ children }) {
  const token = useAuthStore(state => state.token);
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/:id" element={<PlanDetail />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<Profile />} />
          
          {/* V2 - Coach routes */}
          <Route path="coaches" element={<CoachMarketplace />} />
          <Route path="coaches/:coachId" element={<CoachProfile />} />
          <Route path="coach/dashboard" element={<CoachDashboard />} />
          <Route path="coach/create-profile" element={<CreateCoachProfile />} />

          {/* V2 - Group routes */}
          <Route path="groups" element={<GroupsMarketplace />} />
          <Route path="groups/:groupId" element={<GroupDetail />} />
          <Route path="my-groups" element={<MyGroups />} />
          <Route path="coach/groups" element={<CoachGroups />} />
          <Route path="coach/create-group" element={<CreateGroup />} />
          <Route path="coach/create-group-session" element={<CreateGroupSession />} />
          <Route path="groups/session/:sessionId" element={<SessionDetail />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
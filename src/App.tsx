import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthPagesLayout, JoinLayout } from '@/components/route-guards';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import Join from '@/pages/Join';
import Agents from '@/pages/dashboard/Agents';
import Contacts from '@/pages/dashboard/Contacts';
import Dashboard from '@/pages/dashboard/Dashboard';
import Inbox from '@/pages/dashboard/Inbox';
import Notifications from '@/pages/dashboard/Notifications';
import Pipelines from '@/pages/dashboard/Pipelines';
import Settings from '@/pages/dashboard/Settings';
import Automations from '@/pages/automations/Automations';
import NewAutomation from '@/pages/automations/NewAutomation';
import EditAutomation from '@/pages/automations/EditAutomation';
import AutomationLogs from '@/pages/automations/AutomationLogs';
import Broadcasts from '@/pages/broadcasts/Broadcasts';
import NewBroadcast from '@/pages/broadcasts/NewBroadcast';
import BroadcastDetail from '@/pages/broadcasts/BroadcastDetail';
import Flows from '@/pages/flows/Flows';
import FlowEditor from '@/pages/flows/FlowEditor';
import FlowRuns from '@/pages/flows/FlowRuns';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<AuthPagesLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<JoinLayout />}>
        <Route path="/join/:token" element={<Join />} />
      </Route>

      <Route element={<DashboardShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/pipelines" element={<Pipelines />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/automations/new" element={<NewAutomation />} />
        <Route path="/automations/:id/edit" element={<EditAutomation />} />
        <Route path="/automations/:id/logs" element={<AutomationLogs />} />
        <Route path="/broadcasts" element={<Broadcasts />} />
        <Route path="/broadcasts/new" element={<NewBroadcast />} />
        <Route path="/broadcasts/:id" element={<BroadcastDetail />} />
        <Route path="/flows" element={<Flows />} />
        <Route path="/flows/:id" element={<FlowEditor />} />
        <Route path="/flows/:id/runs" element={<FlowRuns />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

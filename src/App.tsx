import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { DashboardHost } from './pages/DashboardHost';
import { DashboardCleaner } from './pages/DashboardCleaner';
import { GuardedLayout } from './components/layout/GuardedLayout';
import { Onboard as HostOnboard } from './routes/host/Onboard';
import { Apartments as HostApartments } from './routes/host/Apartments';
import { Cleaners as HostCleaners } from './routes/host/Cleaners';
import { Tasks as HostTasks } from './routes/host/Tasks';
import { Calendar as HostCalendar } from './routes/host/Calendar';
import { Settings as HostSettings } from './routes/host/Settings';
import { Apartments as CleanerApartments } from './routes/cleaner/Apartments';
import { Tasks as CleanerTasks } from './routes/cleaner/Tasks';
import { Calendar as CleanerCalendar } from './routes/cleaner/Calendar';

// Lucide icons (inherit currentColor → white on dark header)
import {
  Handshake,
  Building2,
  Users,
  ClipboardList,
  CalendarDays,
  Settings as SettingsIcon,
} from 'lucide-react';

const hostTabs = [
  { to: '/host/onboard', label: 'Onboard', icon: Handshake },
  { to: '/host/apartments', label: 'Apartments', icon: Building2 },
  { to: '/host/cleaners', label: 'Reinigungskräfte', icon: Users },
  { to: '/host/tasks', label: 'Reinigungsplan', icon: ClipboardList },
  { to: '/host/calendar', label: 'Kalender', icon: CalendarDays },
  { to: '/host/settings', label: 'Einstellungen', icon: SettingsIcon },
];

const cleanerTabs = [
  { to: '/cleaner/apartments', label: 'Apartments', icon: Building2 },
  { to: '/cleaner/tasks', label: 'Reinigungsaufträge', icon: ClipboardList },
  { to: '/cleaner/calendar', label: 'Kalender', icon: CalendarDays },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/host" element={<GuardedLayout requiredRole="Host" tabs={hostTabs} />}>
          <Route index element={<DashboardHost />} />
           <Route path="onboard" element={<HostOnboard />} />
          <Route path="apartments" element={<HostApartments />} />
          <Route path="cleaners" element={<HostCleaners />} />
          <Route path="tasks" element={<HostTasks />} />
          <Route path="calendar" element={<HostCalendar />} />
          <Route path="settings" element={<HostSettings />} />
        </Route>

        <Route path="/cleaner" element={<GuardedLayout requiredRole="Cleaner" tabs={cleanerTabs} />}>
          <Route index element={<DashboardCleaner />} />
          <Route path="apartments" element={<CleanerApartments />} />
          <Route path="tasks" element={<CleanerTasks />} />
          <Route path="calendar" element={<CleanerCalendar />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

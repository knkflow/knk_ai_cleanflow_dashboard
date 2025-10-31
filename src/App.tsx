import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { DashboardHost } from './pages/DashboardHost';
import { DashboardCleaner } from './pages/DashboardCleaner';
import { GuardedLayout } from './components/layout/GuardedLayout';
import { Apartments as HostApartments } from './routes/host/Apartments';
import { Cleaners as HostCleaners } from './routes/host/Cleaners';
import { Tasks as HostTasks } from './routes/host/Tasks';
import { Calendar as HostCalendar } from './routes/host/Calendar';
import { Settings as HostSettings } from './routes/host/Settings';
import { Apartments as CleanerApartments } from './routes/cleaner/Apartments';
import { Tasks as CleanerTasks } from './routes/cleaner/Tasks';
import { Calendar as CleanerCalendar } from './routes/cleaner/Calendar';


const hostTabs = [
  { to: '/host/apartments', label: '🏢 Apartments' },
  { to: '/host/cleaners', label: '🧑‍🔧 Reinigungskräfte' },
  { to: '/host/tasks', label: '🧭 Reinigungsplan' },
  { to: '/host/calendar', label: '🗓️ Kalender' },
  { to: 'host/settings', label: '⚙️ Einstellungen '}
];

const cleanerTabs = [
  { to: '/cleaner/apartments', label: 'Apartments' },
  { to: '/cleaner/tasks', label: 'Reinigungsaufträge' },
  { to: '/cleaner/calendar', label: 'Kalender' },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/host" element={<GuardedLayout requiredRole="Host" tabs={hostTabs} />}>
          <Route index element={<DashboardHost />} />
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

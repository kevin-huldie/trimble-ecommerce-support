import { Navigate, Route, Routes } from 'react-router-dom';
import { ConnectedSandboxUtilityBar } from './components/SandboxUtilityBar';
import { MainHeader } from './components/MainHeader';
import { SandboxProvider } from './context/SandboxContext';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { HomePage } from './pages/HomePage';
import { LogDetailsPage } from './pages/LogDetailsPage';
import { TrialFrequencyCapSearchPage } from './pages/TrialFrequencyCapSearchPage';

export default function App() {
  return (
    <SandboxProvider>
      {/* 1. Global sandbox diagnostic and governance controls */}
      <ConnectedSandboxUtilityBar />

      {/* 2. Authoritative Trimble application header & session bar */}
      <MainHeader />

      {/* 3. Operational workspace routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/logs" element={<ActivityLogsPage />} />
        <Route path="/email-activity-logs" element={<ActivityLogsPage />} />
        <Route path="/logs/:logId" element={<LogDetailsPage />} />
        <Route path="/email-details-actions/:logId" element={<LogDetailsPage />} />
        <Route path="/trial-frequency-cap/search" element={<TrialFrequencyCapSearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SandboxProvider>
  );
}
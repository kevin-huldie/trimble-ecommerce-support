import { Navigate, Route, Routes } from 'react-router-dom';
import { ConnectedHorizonControlPanel } from './components/HorizonControlPanel';
import { HorizonProvider } from './context/HorizonContext';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { HomePage } from './pages/HomePage';
import { LogDetailsPage } from './pages/LogDetailsPage';
import { TrialFrequencyCapSearchPage } from './pages/TrialFrequencyCapSearchPage';

export default function App() {
  return (
    <HorizonProvider>
      <ConnectedHorizonControlPanel />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/logs" element={<ActivityLogsPage />} />
        <Route path="/logs/:logId" element={<LogDetailsPage />} />
        <Route path="/trial-frequency-cap/search" element={<TrialFrequencyCapSearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HorizonProvider>
  );
}

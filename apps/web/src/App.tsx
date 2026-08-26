import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ProgressProvider } from '@/state/ProgressContext';
import { GameFrame } from '@/components/shell/GameFrame';
import { AppShell } from '@/components/shell/AppShell';
import { MapScreen } from '@/screens/MapScreen';
import { MissionDetailScreen } from '@/screens/MissionDetailScreen';
import { LessonScreen } from '@/screens/LessonScreen';
import { MissionCompleteRoute } from '@/screens/MissionCompleteRoute';
import { MissionUnlockedRoute } from '@/screens/MissionUnlockedRoute';
import { AIPracticeHubScreen } from '@/screens/AIPracticeHubScreen';
import { AIPracticeScreen } from '@/screens/AIPracticeScreen';
import { FieldGuideScreen } from '@/screens/FieldGuideScreen';
import { MonkeyBarsScreen } from '@/screens/MonkeyBarsScreen';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ProgressProvider>
        <BrowserRouter>
          <GameFrame>
            <Routes>
              <Route element={<AppShell />}>
                {/* Journey is the landing page — the map itself is the home screen. */}
                <Route path="/" element={<Navigate to="/map" replace />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/missions/:missionId" element={<MissionDetailScreen />} />
                <Route path="/field-guide" element={<FieldGuideScreen />} />
                <Route path="/practice" element={<AIPracticeHubScreen />} />
                <Route path="/practice/:scenarioId" element={<AIPracticeScreen />} />
                {/* Old routes, kept as redirects so stale links/bookmarks never land on a blank page. */}
                <Route path="/missions" element={<Navigate to="/map" replace />} />
                <Route path="/rewards" element={<Navigate to="/map" replace />} />
                <Route path="/phrasebook" element={<Navigate to="/field-guide" replace />} />
                <Route
                  path="/culturebook"
                  element={<Navigate to="/field-guide" replace state={{ tab: 'culture' }} />}
                />
                <Route path="/lessons/:lessonId/play" element={<LessonScreen />} />
                <Route path="*" element={<Navigate to="/map" replace />} />
              </Route>
              <Route
                path="/missions/:missionId/monkey-bars"
                element={<MonkeyBarsScreen />}
              />
              <Route
                path="/missions/:missionId/complete"
                element={<MissionCompleteRoute />}
              />
              <Route
                path="/missions/:missionId/unlocked"
                element={<MissionUnlockedRoute />}
              />
            </Routes>
          </GameFrame>
        </BrowserRouter>
      </ProgressProvider>
    </MotionConfig>
  );
}

export default App;

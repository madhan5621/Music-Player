import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopHeader from './TopHeader';
import RightPanel from './RightPanel';
import MusicPlayer from '../player/MusicPlayer';
import MiniPlayer from '../player/MiniPlayer';
import FullScreenPlayer from '../player/FullScreenPlayer';
import QueueDrawer from './QueueDrawer';
import useUIStore from '../../store/useUIStore';
import usePlayerStore from '../../store/usePlayerStore';

export default function AppLayout() {
  const { isMobile, isDesktop } = useUIStore();
  const { currentSong, showFullScreen } = usePlayerStore();

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-bg-primary">
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Header */}
        {isMobile && <TopHeader />}

        {/* Content + Right Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className={`flex-1 overflow-y-auto ${isMobile ? 'pb-32' : 'pb-24'}`}>
            <div className="mx-auto max-w-7xl p-4 md:p-6">
              <Outlet />
            </div>
          </main>

          {/* Desktop Right Panel */}
          {isDesktop && <RightPanel />}
        </div>

        {/* Player */}
        {currentSong && !isMobile && <MusicPlayer />}
        {currentSong && isMobile && <MiniPlayer />}

        {/* Mobile Bottom Navigation */}
        {isMobile && <BottomNav />}
      </div>

      {/* Queue Drawer */}
      <QueueDrawer />

      {/* Full Screen Player (Mobile) */}
      <AnimatePresence>
        {showFullScreen && <FullScreenPlayer />}
      </AnimatePresence>
    </div>
  );
}

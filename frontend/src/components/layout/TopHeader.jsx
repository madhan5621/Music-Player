import { Menu, Bell } from 'lucide-react';
import { Music2 } from 'lucide-react';
import useUIStore from '../../store/useUIStore';

export default function TopHeader() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="flex items-center justify-between px-4 py-3 glass border-b border-border">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 hover:bg-bg-hover transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-text-primary" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
          <Music2 className="h-4 w-4 text-accent" />
        </div>
        <span className="text-base font-bold text-text-primary">Madhan Music</span>
      </div>

      <button className="rounded-lg p-2 hover:bg-bg-hover transition-colors">
        <Bell className="h-5 w-5 text-text-secondary" />
      </button>
    </header>
  );
}

import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: false,
  queueDrawerOpen: false,
  isMobile: window.innerWidth < 768,
  isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
  isDesktop: window.innerWidth >= 1024,

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleQueueDrawer: () => set(s => ({ queueDrawerOpen: !s.queueDrawerOpen })),
  closeQueueDrawer: () => set({ queueDrawerOpen: false }),

  updateBreakpoints: () => {
    const w = window.innerWidth;
    set({
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
    });
  },
}));

// Listen for resize events
if (typeof window !== 'undefined') {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      useUIStore.getState().updateBreakpoints();
    }, 150);
  });
}

export default useUIStore;

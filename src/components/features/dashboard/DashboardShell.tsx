import { type ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  sidebar: ReactNode;
  topbar: ReactNode;
}

export function DashboardShell({
  children,
  isSidebarOpen,
  onCloseSidebar,
  sidebar,
  topbar,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen dashboard-wrapper relative overflow-x-hidden text-neutral-900 antialiased selection:bg-primary-100 selection:text-primary-900 font-sans">
      {/* Styles Block for premium bento glassmorphic dashboard animations and styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-wrapper {
          background: var(--bg-main);
        }

        .topbar-glass {
          background: rgba(247, 243, 238, 0.4);
          border-bottom: 1px solid var(--border-soft);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .sidebar-premium {
          background: linear-gradient(180deg, var(--navy-soft) 0%, var(--navy-card) 52%, var(--navy-main) 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            inset -1px 0 0 rgba(255, 255, 255, 0.04),
            4px 0 24px rgba(16, 32, 51, 0.03);
        }

        .nav-item-active {
          background: rgba(255, 255, 255, 0.10) !important;
          border: 1px solid rgba(249, 115, 22, 0.32) !important;
          box-shadow: inset 3px 0 0 #F97316;
          border-radius: 12px;
          color: #ffffff !important;
        }

        .nav-item-inactive {
          color: rgba(255, 255, 255, 0.66) !important;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .nav-item-inactive:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff !important;
        }

        .nav-item-inactive .icon-container {
          color: rgba(255, 255, 255, 0.46);
          transition: all 0.2s ease;
        }

        .nav-item-inactive:hover .icon-container {
          color: #ffffff;
        }

        .bento-card {
          background: var(--bg-section);
          border-radius: 28px;
          border: 1px solid var(--border-soft);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
          padding: 20px; /* Reduced for mobile */
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }

        @media (min-width: 640px) {
          .bento-card {
            padding: 28px;
          }
        }

        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px rgba(15, 23, 42, 0.1);
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(100px, auto);
          gap: 16px; /* Reduced for mobile */
        }

        @media (min-width: 640px) {
          .bento-grid {
            gap: 24px;
          }
        }

        /* Premium chart bar styling */
        .chart-bar {
          background: linear-gradient(180deg, rgba(249, 115, 22, 0.8) 0%, rgba(249, 115, 22, 0.3) 100%);
          border-radius: 12px 12px 0 0;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .chart-bar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%);
        }

        .chart-bar:hover {
          background: linear-gradient(180deg, #ea580c 0%, rgba(234, 88, 12, 0.5) 100%);
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
        }

        .glass-panel {
          background: var(--surface-card-soft);
          border: 1px solid var(--border-soft);
        }

        .glass-panel-dark {
          background:
            radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(31, 127, 212, 0.2) 0%, transparent 60%),
            linear-gradient(135deg, var(--navy-soft) 0%, var(--navy-card) 50%, var(--navy-main) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            inset 0 1px 1px rgba(255, 255, 255, 0.05),
            0 20px 40px rgba(2, 9, 18, 0.15);
        }

        @keyframes shimmer {
          100% {
            transform: skew(-12deg) translateX(200%);
          }
        }
      `}} />

      {/* SideNavBar backdrop on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onCloseSidebar}
        />
      )}

      {sidebar}

      {/* Main Content Wrapper */}
      <main className="lg:ml-[280px] lg:w-[calc(100%_-_280px)] w-full min-w-0 min-h-screen flex flex-col">
        {topbar}

        {/* Dashboard Content */}
        {children}
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="flex h-dvh w-full flex-row">
      <Sidebar />

      <div className="flex h-dvh min-w-0 flex-1 flex-col">
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-4">
          <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

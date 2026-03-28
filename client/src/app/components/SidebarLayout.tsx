import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function SidebarLayout({
  role,
  children,
}: {
  role: 'teacher' | 'student';
  children: ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      <Sidebar role={role} />
      <main className="h-screen overflow-y-auto ml-16 md:ml-64 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors">
        {children}
      </main>
    </div>
  );
}


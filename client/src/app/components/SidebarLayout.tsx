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
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <Sidebar role={role} />
      <main className="h-screen overflow-y-auto ml-16 md:ml-64">
        {children}
      </main>
    </div>
  );
}


'use client';
import { useProgress } from './ProgressProvider';

interface Props {
  children:  React.ReactNode;
  className?: string;
}

export default function ReaderShell({ children, className = 'pt-14 pb-24' }: Props) {
  const { sidebarOpen } = useProgress();
  return (
    <main
      className={`${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ${className} min-h-screen transition-[margin-left] duration-300 ease-in-out`}
    >
      {children}
    </main>
  );
}

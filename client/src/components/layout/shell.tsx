import { Header } from "./header";
import { Navbar } from "./navbar";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header onLogout={handleLogout} />
      <Navbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
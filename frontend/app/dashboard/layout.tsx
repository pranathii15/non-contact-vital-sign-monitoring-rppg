'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  History,
  Users,
  Brain,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Activity,
  Bell,
  Settings,
  User,
} from 'lucide-react';
import { VitalProvider } from '@/lib/vital-context';
import { useUser } from '@/lib/user-context';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { AlertOverlay } from '@/components/dashboard/alert-overlay';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vital History', href: '/dashboard/history', icon: History },
  { name: 'Family Space', href: '/dashboard/family', icon: Users },
  { name: 'AI Insights', href: '/dashboard/insights', icon: Brain },
  { name: 'Help / FAQ', href: '/dashboard/help', icon: HelpCircle },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useUser();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-72 z-50',
          'lg:translate-x-0 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full glass-card rounded-none lg:rounded-r-2xl p-6 flex flex-col border-r border-glass-border">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">VitalAI</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    'hover:bg-glass hover:shadow-lg',
                    isActive
                      ? 'bg-primary/20 text-primary shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="mt-auto pt-6 border-t border-glass-border space-y-4">
            <div className="flex items-center gap-3 px-4">
              {isLoading ? (
                <>
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user ? getInitials(user.fullName) : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isLoading } = useUser();
  
  // Get first name
  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <header className="sticky top-0 z-30 px-4 lg:px-8 py-4">
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden sm:block">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-48" />
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-foreground">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground">Monitor your health in real-time</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-glass transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </button>
          <button className="p-2 rounded-xl hover:bg-glass transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
          
          {/* Profile avatar for mobile */}
          <div className="sm:hidden">
            {isLoading ? (
              <Skeleton className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {user ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <VitalProvider>
      <div className="min-h-screen bg-background">
        {/* Gradient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, oklch(0.55 0.22 280) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute top-1/2 -left-40 w-80 h-80 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, oklch(0.65 0.18 250) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, oklch(0.70 0.18 170) 0%, transparent 70%)',
            }}
          />
        </div>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:pl-72 min-h-screen">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <div className="px-4 lg:px-8 pb-8">{children}</div>
        </main>

        <AlertOverlay />
      </div>
    </VitalProvider>
  );
}

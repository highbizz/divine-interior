import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Users, UserCog, LogOut, Menu, Bell, Settings,
  ExternalLink, BarChart2, HelpCircle, ClipboardList,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminStore } from '@/stores/adminStore';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/studio',           icon: LayoutDashboard },
      { label: 'Analytics', href: '/studio/analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Enquiries',    href: '/studio/orders',    icon: ClipboardList },
    ],
  },
  {
    label: 'Store',
    items: [
      { label: 'Products',  href: '/studio/products',  icon: Package },
      { label: 'Customers', href: '/studio/customers', icon: Users },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Blogs',     href: '/studio/blogs',     icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings',      href: '/studio/users', icon: Settings },
      { label: 'Staff members', href: '/studio/users', icon: UserCog },
    ],
  },
];

const PAGE_NAMES: Record<string, string> = {
  '':          'Dashboard',
  'analytics': 'Analytics',
  'products':  'Products',
  'orders':    'Enquiries',
  'blogs':     'Blogs',
  'customers': 'Customers',
  'users':     'Settings',
};

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { adminProfile, signOut } = useAdminStore();

  const handleSignOut = async () => { await signOut(); navigate('/studio/login'); };

  const initials = adminProfile?.name
    ? adminProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const currentPage = PAGE_NAMES[location.pathname.split('/').pop() ?? ''] ?? 'Dashboard';

  const NavItem = ({ item }: { item: { label: string; href: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    const isActive = item.href === '/studio'
      ? location.pathname === '/studio'
      : location.pathname.startsWith(item.href);

    return (
      <Link
        to={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
          isActive
            ? 'bg-black text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-black'
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-gray-400')} />
        {item.label}
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-gray-200 px-5">
        <Link to="/studio" className="flex items-center gap-3">
          <img src="/banner/office-furnisho-logo.png?v=2" alt="Office Furnisho Logo" className="h-12 w-auto object-contain" />
          <span className="rounded bg-gray-100 px-1.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-widest text-gray-500">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => <NavItem key={item.href + item.label} item={item} />)}
            </div>
          </div>
        ))}

        {/* Footer links */}
        <div className="border-t border-gray-100 pt-4 space-y-0.5">
          <Link
            to="/" target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-400 hover:bg-gray-100 hover:text-black transition-all"
          >
            <ExternalLink className="h-4 w-4" />
            View Store
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-colors">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-black text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-sans text-xs font-semibold text-black truncate leading-none">
                  {adminProfile?.name ?? 'Admin'}
                </p>
                <p className="font-sans text-[10px] text-gray-400 truncate mt-0.5">
                  {adminProfile?.role?.replace('_', ' ') ?? 'Administrator'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 mb-1">
            <DropdownMenuLabel className="font-normal">
              <p className="font-semibold text-sm">{adminProfile?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{adminProfile?.email ?? ''}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/studio/users"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 flex h-full w-56 flex-col"
            >
              <Sidebar />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-sans text-sm font-semibold text-black hidden sm:block">
              {currentPage}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-black ring-2 ring-white" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-black text-white text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden font-sans text-xs font-semibold text-black sm:block">
                    {adminProfile?.name?.split(' ')[0] ?? 'Admin'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-semibold text-sm">{adminProfile?.name ?? 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{adminProfile?.email ?? ''}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/studio/users"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};

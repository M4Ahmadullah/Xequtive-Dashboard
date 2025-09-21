import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaChartPie,
  FaCog,
  FaEnvelope,
  FaTimes,
  FaBars,
} from "react-icons/fa";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <FaHome className="h-6 w-6" />,
      exact: true,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <FaCalendarAlt className="h-6 w-6" />,
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: <FaUsers className="h-6 w-6" />,
    },
    {
      name: "Contact Messages",
      href: "/dashboard/contact-messages",
      icon: <FaEnvelope className="h-6 w-6" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <FaChartPie className="h-6 w-6" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <FaCog className="h-6 w-6" />,
    },
  ];

  return (
    <div className={`h-full bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 relative ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-500">X</span>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-white">Xequtive</span>
            )}
          </Link>
        </div>
      </div>
      
      {/* Toggle button at the edge */}
      {onToggle && (
        <div className="absolute top-4 right-0 z-50">
          <button
            onClick={onToggle}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-l-lg transition-colors duration-200 text-gray-400 hover:text-white border border-gray-700 border-r-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaBars className="h-4 w-4" /> : <FaTimes className="h-4 w-4" />}
          </button>
        </div>
      )}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActiveLink = item.exact
            ? pathname === item.href
            : isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isActiveLink
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-gray-500 border-t border-gray-800">
        {!isCollapsed && <p>Xequtive Dashboard v1.0</p>}
      </div>
    </div>
  );
}

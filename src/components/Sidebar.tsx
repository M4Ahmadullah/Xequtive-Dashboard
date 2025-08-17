import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaChartPie,
  FaCog,
} from "react-icons/fa";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <FaHome className="h-5 w-5" />,
      exact: true,
    },
    {
      name: "Bookings",
      href: "/dashboard/bookings",
      icon: <FaCalendarAlt className="h-5 w-5" />,
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: <FaUsers className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: <FaChartPie className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <FaCog className="h-5 w-5" />,
    },
  ];

  return (
    <div className="h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-purple-500">X</span>
          <span className="text-lg font-semibold text-white">Xequtive</span>
        </Link>
      </div>
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
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-gray-500 border-t border-gray-800">
        <p>Xequtive Dashboard v1.0</p>
      </div>
    </div>
  );
}

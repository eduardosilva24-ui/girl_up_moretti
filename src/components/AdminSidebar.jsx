import { NavLink } from "react-router-dom";
import { Archive, BookOpen, LayoutDashboard, Newspaper } from "lucide-react";
import { adminNavigation } from "../data/navigation";

const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/modulos": BookOpen,
  "/admin/posts": Newspaper,
  "/admin/biblioteca": Archive,
};

export function AdminSidebar() {
  return (
    <aside className="rounded-[2rem] border border-aura-100 bg-white p-3 shadow-card lg:sticky lg:top-24">
      <nav className="grid gap-1">
        {adminNavigation.map((item) => {
          const Icon = ICONS[item.to] || LayoutDashboard;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-aura-800 text-white"
                    : "text-ink-700 hover:bg-aura-50 hover:text-aura-900"
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

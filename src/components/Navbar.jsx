import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogIn, Menu, Shield, UserRound, X } from "lucide-react";
import { primaryNavigation } from "../data/navigation";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./common/Button";

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `focus-ring rounded-full px-3 py-2 text-sm font-semibold transition ${
          isActive ? "bg-aura-800 text-white" : "text-ink-700 hover:bg-aura-50 hover:text-aura-900"
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-aura-100/80 bg-white/88 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="focus-ring flex min-w-0 items-center gap-3 rounded-full" onClick={closeMenu}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-aura-800 text-lg font-bold text-white shadow-card">
            G
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink-900 sm:text-base">
              Girl Up Áurea Moretti
            </span>
            <span className="block text-xs font-medium text-ink-600">Platform</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {primaryNavigation.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isAdmin ? (
            <Button as={Link} to="/admin" variant="subtle" icon={Shield}>
              Admin
            </Button>
          ) : null}
          {isAuthenticated ? (
            <>
              <Button as={Link} to="/perfil" variant="secondary" icon={UserRound}>
                Perfil
              </Button>
              <Button variant="ghost" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <Button as={Link} to="/login" icon={LogIn}>
              Entrar
            </Button>
          )}
        </div>

        <button
          type="button"
          className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-800 transition hover:bg-aura-50 lg:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={`grid border-t border-aura-100/80 bg-white transition-[grid-template-rows] duration-300 lg:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {primaryNavigation.map((item) => (
              <NavItem key={item.to} item={item} onClick={closeMenu} />
            ))}
            <div className="mt-2 grid gap-2 border-t border-aura-100 pt-4">
              {isAdmin ? (
                <Button as={Link} to="/admin" variant="subtle" icon={Shield} onClick={closeMenu}>
                  Admin
                </Button>
              ) : null}
              {isAuthenticated ? (
                <>
                  <Button as={Link} to="/perfil" variant="secondary" icon={UserRound} onClick={closeMenu}>
                    Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Button as={Link} to="/login" icon={LogIn} onClick={closeMenu}>
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

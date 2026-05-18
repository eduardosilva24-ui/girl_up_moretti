import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-aura-100 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-ink-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-ink-900">Girl Up Áurea Moretti Platform</p>
          <p className="mt-1">Formação e gestão de conteúdo educacional.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="transition hover:text-aura-800" to="/quem-somos">
            Quem Somos
          </Link>
          <Link className="transition hover:text-aura-800" to="/contato">
            Contato
          </Link>
          <Link className="transition hover:text-aura-800" to="/login">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

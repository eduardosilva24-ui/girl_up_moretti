import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import {
  getGoogleClientId,
  isGoogleConfigured,
  loadGoogleIdentityScript,
} from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";

export default function LoginPage() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithCredential, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname || "/", { replace: true });
    }
  }, [isAuthenticated, location.state?.from?.pathname, navigate]);

  useEffect(() => {
    if (!isGoogleConfigured() || !buttonRef.current) return undefined;

    let cancelled = false;

    loadGoogleIdentityScript()
      .then((google) => {
        if (cancelled || !buttonRef.current) return;

        google.accounts.id.initialize({
          client_id: getGoogleClientId(),
          callback: async (response) => {
            try {
              await signInWithCredential(response.credential);
              showToast({ type: "success", title: "Login realizado" });
              navigate(location.state?.from?.pathname || "/", { replace: true });
            } catch (nextError) {
              setError(nextError.message || "Não foi possível validar o login.");
            }
          },
        });

        buttonRef.current.innerHTML = "";
        google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "signin_with",
          locale: "pt-BR",
          width: Math.min(360, buttonRef.current.clientWidth || 360),
        });
      })
      .catch(() => setError("Não foi possível carregar o login Google."));

    return () => {
      cancelled = true;
      if (buttonRef.current) buttonRef.current.innerHTML = "";
    };
  }, [location.state?.from?.pathname, navigate, showToast, signInWithCredential]);

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Login"
        title="Entrar com Google"
        description="A autenticação usa Google Identity Services. Contas administrativas são identificadas pelo domínio autorizado."
      />
      <section className="mx-auto max-w-xl px-4 pb-16 sm:px-6 lg:px-8">
        {!isGoogleConfigured() ? (
          <EmptyState
            icon={LogIn}
            title="Login Google não configurado"
            description="Defina VITE_GOOGLE_CLIENT_ID para ativar a entrada na plataforma."
          />
        ) : (
          <div className="rounded-[2rem] border border-aura-100 bg-white p-7 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-aura-50 text-aura-700">
              <ShieldCheck className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-ink-900">Acesse sua conta</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-600">
              Seu perfil será sincronizado com o backend após a validação do token Google.
            </p>
            <div ref={buttonRef} className="mt-7 flex min-h-11 justify-center" />
            {error ? <p className="mt-5 text-sm font-medium text-blush-500">{error}</p> : null}
          </div>
        )}
      </section>
    </main>
  );
}

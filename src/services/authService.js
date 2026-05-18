import { ADMIN_EMAIL_DOMAIN } from "../utils/constants";
import { apiPost, isApiConfigured } from "./api";

const SESSION_KEY = "girl-up-moretti:auth-session";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
let googleScriptPromise;

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return decodeURIComponent(
    Array.from(window.atob(padded))
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

export function isGoogleConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export function getGoogleClientId() {
  return GOOGLE_CLIENT_ID;
}

export function loadGoogleIdentityScript() {
  if (!isGoogleConfigured()) {
    return Promise.reject(new Error("Google Client ID não configurado."));
  }

  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function decodeGoogleCredential(credential) {
  if (!credential || typeof credential !== "string") {
    throw new Error("Credencial Google inválida.");
  }

  const [, payload] = credential.split(".");
  if (!payload) throw new Error("Credencial Google incompleta.");

  return JSON.parse(decodeBase64Url(payload));
}

export function buildUserFromCredential(credential) {
  const payload = decodeGoogleCredential(credential);
  const email = payload.email || "";

  return {
    id: payload.sub,
    name: payload.name || email,
    email,
    picture: payload.picture || "",
    role: email.endsWith(ADMIN_EMAIL_DOMAIN) ? "admin" : "user",
    expiresAt: payload.exp ? payload.exp * 1000 : 0,
  };
}

export function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session?.credential || !session?.user?.expiresAt) return null;
    if (Date.now() >= session.user.expiresAt) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function saveStoredSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function verifySessionWithBackend(credential) {
  if (!isApiConfigured()) return null;
  return apiPost("verifyUser", { idToken: credential }, { retries: 0 });
}

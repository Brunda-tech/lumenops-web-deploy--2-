import type { AdminUser } from '../types/lumenops';

const SESSION_STORAGE_KEY = 'lumenops_admin_session_v1';

const DEMO_OPERATORS: Array<{ email: string; password: string; user: AdminUser }> = [
  {
    email: 'admin@bescom.gov.in',
    password: 'BESCOM@2026',
    user: {
      id: 'ADM-BLR-01',
      email: 'admin@bescom.gov.in',
      name: 'R. Venkatesh',
      role: 'Chief Control Room Dispatcher',
      division: 'Bengaluru Metro & Regional Circles',
    },
  },
  {
    email: 'dispatcher@bescom.gov.in',
    password: 'LUMEN@2026',
    user: {
      id: 'ADM-BLR-02',
      email: 'dispatcher@bescom.gov.in',
      name: 'A. Nandini',
      role: 'Subdivision Operations Officer',
      division: 'Bengaluru East & South',
    },
  },
];

export async function loginAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ ok: true; user: AdminUser } | { ok: false; error: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = (await res.json()) as { user: AdminUser; token: string };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.user));
      return { ok: true, user: data.user };
    }
    if (res.status === 401) {
      return { ok: false, error: 'Invalid credentials' };
    }
  } catch {
    // Fallback for purely static Nginx/Apache hosting
  }

  const matched = DEMO_OPERATORS.find(
    (op) => op.email === email && op.password === password
  );
  if (!matched) {
    return { ok: false, error: 'Invalid credentials' };
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(matched.user));
  return { ok: true, user: matched.user };
}

export function getSavedAdminSession(): AdminUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Ignore when static
  }
}

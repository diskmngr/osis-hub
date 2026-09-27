import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";

const TOKEN_KEY = "osis_admin_token";

export function readAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeAdminToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors (private mode)
  }
}

/**
 * Session state for the single fixed-credential admin account.
 * The token lives in localStorage; the server validates it on every request.
 */
export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => readAdminToken());
  const valid = useQuery(api.adminAuth.check, { token: token ?? undefined });
  const loginMutation = useMutation(api.adminAuth.login);
  const logoutMutation = useMutation(api.adminAuth.logout);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const result = await loginMutation({ username, password });
      setToken(result.token);
      writeAdminToken(result.token);
      return result.token;
    },
    [loginMutation],
  );

  const signOut = useCallback(async () => {
    if (token) {
      try {
        await logoutMutation({ token });
      } catch {
        // session may already be gone
      }
    }
    setToken(null);
    writeAdminToken(null);
  }, [logoutMutation, token]);

  // Only "loading" while we have a token that hasn't been confirmed yet.
  const isLoading = !!token && valid === undefined;
  const isAuthenticated = !!token && valid === true;

  return { token, isLoading, isAuthenticated, signIn, signOut };
}

"use client";

import { useCallback, useState } from "react";

import { type AuthMode, checkIdentifier, login, normalizePhone, register } from "@/lib/auth-api";

export type AuthStep = "identifier" | "password";

export interface AuthFlowState {
  mode: AuthMode;
  step: AuthStep;
  identifier: string;
  userExists: boolean | null;
  password: string;
  loading: boolean;
  error: string | null;
}

const initialState: AuthFlowState = {
  mode: "phone",
  step: "identifier",
  identifier: "",
  userExists: null,
  password: "",
  loading: false,
  error: null,
};

export function useAuthFlow() {
  const [state, setState] = useState<AuthFlowState>(initialState);

  const setMode = useCallback((mode: AuthMode) => {
    setState((s) => ({
      ...initialState,
      mode,
      identifier: s.identifier,
    }));
  }, []);

  const setIdentifier = useCallback((value: string) => {
    setState((s) => ({ ...s, identifier: value, error: null }));
  }, []);

  const setPassword = useCallback((value: string) => {
    setState((s) => ({ ...s, password: value, error: null }));
  }, []);

  const checkUser = useCallback(async () => {
    const { mode, identifier } = state;
    const trimmed = identifier.trim();
    if (!trimmed) {
      setState((s) => ({ ...s, error: mode === "email" ? "Enter your email." : "Enter your phone number." }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const payload = mode === "email" ? { email: trimmed } : { phone: normalizePhone(trimmed) };
      const res = await checkIdentifier(payload);
      setState((s) => ({
        ...s,
        loading: false,
        userExists: res.exists,
        step: "password",
        identifier: mode === "phone" ? (payload.phone ?? trimmed) : trimmed,
        error: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong.",
      }));
    }
  }, [state.mode, state.identifier]);

  const submitPassword = useCallback(
    async (onSuccess: (tokens: { access_token: string; refresh_token?: string }) => void) => {
      const { mode, identifier, password, userExists } = state;
      const trimmedId = identifier.trim();
      const payload =
        mode === "email"
          ? { email: trimmedId, password }
          : { phone: trimmedId.startsWith("+") ? trimmedId : normalizePhone(trimmedId), password };

      if (!password || password.length < 8) {
        setState((s) => ({ ...s, error: "Password must be at least 8 characters." }));
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const tokens = userExists ? await login(payload) : await register(payload);
        setState((s) => ({ ...s, loading: false, error: null }));
        onSuccess(tokens);
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : userExists ? "Login failed." : "Registration failed.",
        }));
      }
    },
    [state],
  );

  const back = useCallback(() => {
    setState((s) => ({
      ...s,
      step: "identifier",
      userExists: null,
      password: "",
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    setMode,
    setIdentifier,
    setPassword,
    checkUser,
    submitPassword,
    back,
    reset,
  };
}

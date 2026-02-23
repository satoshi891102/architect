"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit?: (data: { email: string; password: string; name?: string }) => void;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password, ...(mode === "signup" ? { name } : {}) });
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-sm)",
    color: "#f1f2f4",
    backgroundColor: "#141414",
    border: "1px solid #2e3040",
    borderRadius: "var(--radius-lg)",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#0a0a0a" }}>
      <div
        className="w-full max-w-sm"
        style={{
          backgroundColor: "#141414",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-lg)",
          padding: "40px 32px",
        }}
      >
        <div className="mb-8 text-center">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              color: "#f1f2f4",
              marginBottom: "8px",
            }}
          >
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "#6b6f76" }}>
            {mode === "login" ? "Sign in to continue" : "Get started for free"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, color: "#f1f2f4" }}>
                Full name
              </label>
              <input style={inputStyle} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, color: "#f1f2f4" }}>
              Email
            </label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, color: "#f1f2f4" }}>
                Password
              </label>
              {mode === "login" && (
                <Link href="/forgot-password" style={{ fontSize: "var(--text-xs)", color: "#5E6AD2" }}>
                  Forgot password?
                </Link>
              )}
            </div>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button
            type="submit"
            className="mt-2 w-full font-medium text-white"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              backgroundColor: "#5E6AD2",
              borderRadius: "var(--radius-lg)",
              padding: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center" style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "#6b6f76" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link href={mode === "login" ? "/signup" : "/login"} style={{ color: "#5E6AD2", fontWeight: 500 }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// UM-US-01: Create a User (ADMIN). The backend is authoritative for who may do this (403 for a
// non-ADMIN); this page only reports the outcome. See specs/002-user-management/plan.md.

type FieldName = "full_name" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_NAMES: FieldName[] = ["full_name", "email", "password"];

const inputClass =
  "rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/[.145] dark:bg-white/5 dark:text-zinc-50";
const errorClass = "text-sm font-medium text-red-600 dark:text-red-400";

export default function CreateUserPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("pfm_access_token")) {
      router.replace("/login");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");
    setAccessDenied(false);
    setSuccess("");

    const missing: FieldErrors = {};
    if (!fullName.trim()) missing.full_name = "Full name is required";
    if (!email.trim()) missing.email = "Email is required";
    if (!password) missing.password = "Password is required";
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      return;
    }

    setLoading(true);
    try {
      const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const response = await fetch(`${apiOrigin}/api/v1/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("pfm_access_token") ?? ""}`,
        },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });

      if (response.status === 201) {
        setSuccess("User account created");
        setFullName("");
        setEmail("");
        setPassword("");
        return;
      }
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (response.status === 403) {
        setAccessDenied(true);
        return;
      }

      const body: Record<string, unknown> = await response.json().catch(() => ({}));
      if (response.status === 400) {
        const errors: FieldErrors = {};
        for (const name of FIELD_NAMES) {
          const messages = body[name];
          if (Array.isArray(messages) && typeof messages[0] === "string") errors[name] = messages[0];
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          return;
        }
      }
      if (response.status === 409 && typeof body.detail === "string") {
        setFormError(body.detail);
        return;
      }
      setFormError("Something went wrong. Please try again.");
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">Create a User</h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Create an account for a family member. They can log in with this email and initial password.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-full-name" className="text-sm font-medium text-black dark:text-zinc-50">
              Full name
            </label>
            <input
              id="user-full-name"
              name="full_name"
              type="text"
              autoComplete="off"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.full_name && (
              <p id="user-full-name-error" className={errorClass}>
                {fieldErrors.full_name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="user-email" className="text-sm font-medium text-black dark:text-zinc-50">
              Email
            </label>
            <input
              id="user-email"
              name="email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.email && (
              <p id="user-email-error" className={errorClass}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="user-password" className="text-sm font-medium text-black dark:text-zinc-50">
              Initial password
            </label>
            <input
              id="user-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {fieldErrors.password && (
              <p id="user-password-error" className={errorClass}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {formError && (
            <p id="message-error" className={errorClass}>
              {formError}
            </p>
          )}
          {accessDenied && (
            <p id="message-access-denied" className={errorClass}>
              You do not have permission to create User accounts.
            </p>
          )}
          {success && (
            <p id="message-success" className="text-sm font-medium text-green-700 dark:text-green-400">
              {success}
            </p>
          )}

          <button
            id="btn-submit-user"
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </main>
    </div>
  );
}

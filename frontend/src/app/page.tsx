"use client";

import { useEffect, useState } from "react";

type HealthStatus = "loading" | "ok" | "error";

export default function Home() {
  const [status, setStatus] = useState<HealthStatus>("loading");
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    fetch(`${apiUrl}/health/`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStatus("ok");
        setDetail(data.status ?? "OK");
      })
      .catch((err) => {
        setStatus("error");
        setDetail(err instanceof Error ? err.message : "Unknown error");
      });
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          PFM Demo
        </h1>

        <div className="flex items-center gap-3 rounded-full border border-black/[.08] px-6 py-3 dark:border-white/[.145]">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status === "ok"
                ? "bg-green-500"
                : status === "error"
                ? "bg-red-500"
                : "bg-yellow-400 animate-pulse"
            }`}
          />
          <span className="text-base font-medium text-black dark:text-zinc-50">
            {status === "loading" && "Checking backend..."}
            {status === "ok" && `Backend status: ${detail}`}
            {status === "error" && `Backend unreachable: ${detail}`}
          </span>
        </div>
      </main>
    </div>
  );
}

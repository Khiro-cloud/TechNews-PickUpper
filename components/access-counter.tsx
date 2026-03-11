"use client";

import { useEffect, useState } from "react";

type AccessCounterPayload = {
  total: number;
};

export function AccessCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const visitKey = `access-counter:${window.location.pathname}:${performance.timeOrigin}`;

    const loadCounter = async (method: "GET" | "POST") => {
      try {
        const response = await fetch("/api/access-counter", {
          method,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to ${method === "POST" ? "update" : "read"} counter.`);
        }

        const payload = (await response.json()) as AccessCounterPayload;

        if (!cancelled) {
          setTotal(payload.total);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (sessionStorage.getItem(visitKey) === "counted") {
      void loadCounter("GET");
    } else {
      sessionStorage.setItem(visitKey, "counted");
      void loadCounter("POST");
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-3 self-start rounded-full border border-[#d9c2a1] bg-[#fff7ec]/95 px-3 py-2 text-right shadow-[0_10px_28px_rgba(106,63,26,0.12)] backdrop-blur">
      <img alt="" aria-hidden="true" className="h-8 w-6 shrink-0 object-contain" src="/carrot.png" />

      <div>
        <p className="text-[9px] uppercase tracking-[0.28em] text-[#8e6a43]">Visits</p>
        <p className="mt-0.5 text-sm font-semibold leading-none text-[#47311a] tabular-nums">
          {total === null ? "--" : total.toLocaleString("ja-JP")}
        </p>
      </div>
    </div>
  );
}

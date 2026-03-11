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
      <span aria-hidden="true" className="relative block h-8 w-6 shrink-0">
        <span className="absolute left-1.5 top-0.5 h-3 w-1.5 -rotate-[28deg] rounded-full bg-[#5f9d52]" />
        <span className="absolute left-2.5 top-0 h-3.5 w-1.5 rotate-[8deg] rounded-full bg-[#82bb65]" />
        <span className="absolute left-3.5 top-0.5 h-3 w-1.5 rotate-[28deg] rounded-full bg-[#6baa57]" />
        <span className="absolute left-1.5 top-2.5 h-5 w-3.5 rotate-[16deg] rounded-[45%_45%_60%_60%] bg-[linear-gradient(180deg,#ffb454_0%,#ff8f2e_58%,#e56f1e_100%)] shadow-[inset_-1px_-2px_0_rgba(130,61,12,0.18)]" />
        <span className="absolute left-3 top-4.5 h-1.5 w-[1px] rotate-[16deg] bg-[#ffd7a7]/80" />
      </span>

      <div>
        <p className="text-[9px] uppercase tracking-[0.28em] text-[#8e6a43]">Visits</p>
        <p className="mt-0.5 text-sm font-semibold leading-none text-[#47311a] tabular-nums">
          {total === null ? "--" : total.toLocaleString("ja-JP")}
        </p>
      </div>
    </div>
  );
}

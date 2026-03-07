"use client";

import { useEffect, useState } from "react";
import { loadSelectedArticleIds } from "@/lib/mail/selection";

export function useSelection() {
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setSelectedArticleIds(loadSelectedArticleIds());
    };

    sync();
    window.addEventListener("selection:changed", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("selection:changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return selectedArticleIds;
}

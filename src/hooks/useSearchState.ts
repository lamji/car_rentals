"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { CarType, SearchState } from "@/lib/types";

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  if (!value) params.delete(key);
  else params.set(key, value);
}

export function useSearchState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const state: SearchState = useMemo(
    () => ({
      location: searchParams.get("location") ?? "",
      startDate: searchParams.get("start") ?? "",
      endDate: searchParams.get("end") ?? "",
      carType: (searchParams.get("type") as CarType | null) ?? undefined,
    }),
    [searchParams]
  );

  const setState = useCallback(
    (next: Partial<SearchState>, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      const merged: SearchState = {
        ...state,
        ...next,
      };

      setOrDelete(params, "location", merged.location || undefined);
      setOrDelete(params, "start", merged.startDate || undefined);
      setOrDelete(params, "end", merged.endDate || undefined);
      setOrDelete(params, "type", merged.carType);

      const href = `${pathname}?${params.toString()}`;
      if (options?.replace) router.replace(href);
      else router.push(href);
    },
    [pathname, router, searchParams, state]
  );

  return {
    state,
    setState,
  };
}

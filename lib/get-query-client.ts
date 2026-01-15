import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a NEW QueryClient instance.
 * - Server: one per request
 * - Client: one per browser session
 */
export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

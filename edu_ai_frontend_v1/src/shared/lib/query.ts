export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 0,
      refetchOnWindowFocus: false
    }
  }
};

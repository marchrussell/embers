import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const useStorageListing = (bucket: string, enabled = true) => {
  return useQuery({
    queryKey: ["storage-listing", bucket],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(undefined, { sortBy: { column: "name", order: "asc" } });
      if (error) {
        console.error(`[useStorageListing] Failed to list "${bucket}":`, error);
        return [];
      }
      return (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const useStorageListing = (bucket: string) => {
  return useQuery({
    queryKey: ["storage-listing", bucket],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(bucket).list("", {
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;
      return (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
    staleTime: 5 * 60 * 1000,
  });
};

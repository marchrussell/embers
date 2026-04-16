import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UseFavouritesReturn {
  favouriteIds: string[];
  isFavourite: (sessionId: string) => boolean;
  toggleFavourite: (sessionId: string) => void;
  removeFavourite: (sessionId: string) => void;
  loading: boolean;
}

export function useFavourites(): UseFavouritesReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["favourites", user?.id];

  const { data: favouriteIds = [], isLoading: loading } = useQuery<string[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_favourites")
        .select("session_id")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data?.map((f) => f.session_id) || [];
    },
    enabled: !!user?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const isFav = queryClient.getQueryData<string[]>(queryKey)?.includes(sessionId);
      if (isFav) {
        const { error } = await supabase
          .from("user_favourites")
          .delete()
          .eq("user_id", user!.id)
          .eq("session_id", sessionId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_favourites")
          .insert({ user_id: user!.id, session_id: sessionId });
        if (error) throw error;
      }
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<string[]>(queryKey);
      const isFav = prev?.includes(sessionId);
      queryClient.setQueryData<string[]>(queryKey, (old = []) =>
        isFav ? old.filter((id) => id !== sessionId) : [...old, sessionId]
      );
      return { prev, wasAdded: !isFav };
    },
    onError: (_err, _sessionId, context) => {
      queryClient.setQueryData(queryKey, context?.prev);
      toast.error("Failed to update favourites");
    },
    onSuccess: (_data, _sessionId, context) => {
      toast.success(context?.wasAdded ? "Added to favourites" : "Removed from favourites");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("user_favourites")
        .delete()
        .eq("user_id", user!.id)
        .eq("session_id", sessionId);
      if (error) throw error;
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<string[]>(queryKey);
      queryClient.setQueryData<string[]>(queryKey, (old = []) =>
        old.filter((id) => id !== sessionId)
      );
      return { prev };
    },
    onError: (_err, _sessionId, context) => {
      queryClient.setQueryData(queryKey, context?.prev);
      toast.error("Failed to remove from favourites");
    },
    onSuccess: () => {
      toast.success("Removed from favourites");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const isFavourite = useCallback(
    (sessionId: string) => favouriteIds.includes(sessionId),
    [favouriteIds]
  );

  const toggleFavourite = useCallback(
    (sessionId: string) => {
      if (!user?.id) {
        toast.error("Please sign in to save favourites");
        return;
      }
      toggleMutation.mutate(sessionId);
    },
    [user?.id, toggleMutation]
  );

  const removeFavourite = useCallback(
    (sessionId: string) => {
      if (!user?.id) {
        toast.error("Please sign in to manage favourites");
        return;
      }
      removeMutation.mutate(sessionId);
    },
    [user?.id, removeMutation]
  );

  return {
    favouriteIds,
    isFavourite,
    toggleFavourite,
    removeFavourite,
    loading,
  };
}

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UseFavouritesReturn {
  favouriteIds: string[];
  isFavourite: (sessionId: string) => boolean;
  toggleFavourite: (sessionId: string) => Promise<void>;
  removeFavourite: (sessionId: string) => Promise<void>;
  loading: boolean;
}

export function useFavourites(): UseFavouritesReturn {
  const { user } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favourites on mount and when user changes
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user?.id) {
        setFavouriteIds([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_favourites')
          .select('session_id')
          .eq('user_id', user.id);

        if (error) throw error;
        setFavouriteIds(data?.map(f => f.session_id) || []);
      } catch (error) {
        console.error('Error fetching favourites:', error);
        setFavouriteIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [user?.id]);

  const isFavourite = useCallback(
    (sessionId: string) => favouriteIds.includes(sessionId),
    [favouriteIds]
  );

  const toggleFavourite = useCallback(
    async (sessionId: string) => {
      if (!user?.id) {
        toast.error("Please sign in to save favourites");
        return;
      }

      const isCurrentlyFavourited = favouriteIds.includes(sessionId);

      if (isCurrentlyFavourited) {
        const { error } = await supabase
          .from('user_favourites')
          .delete()
          .eq('user_id', user.id)
          .eq('session_id', sessionId);

        if (error) {
          toast.error("Failed to remove from favourites");
          return;
        }

        setFavouriteIds(prev => prev.filter(id => id !== sessionId));
        toast.success("Removed from favourites");
      } else {
        const { error } = await supabase
          .from('user_favourites')
          .insert({ user_id: user.id, session_id: sessionId });

        if (error) {
          toast.error("Failed to add to favourites");
          return;
        }

        setFavouriteIds(prev => [...prev, sessionId]);
        toast.success("Added to favourites");
      }
    },
    [user?.id, favouriteIds]
  );

  const removeFavourite = useCallback(
    async (sessionId: string) => {
      if (!user?.id) {
        toast.error("Please sign in to manage favourites");
        return;
      }

      const { error } = await supabase
        .from('user_favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) {
        toast.error("Failed to remove from favourites");
        return;
      }

      setFavouriteIds(prev => prev.filter(id => id !== sessionId));
      toast.success("Removed from favourites");
    },
    [user?.id]
  );

  return {
    favouriteIds,
    isFavourite,
    toggleFavourite,
    removeFavourite,
    loading,
  };
}

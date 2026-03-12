import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { FavouriteSession } from "../types";

interface UseFavouriteSessionsParams {
  favouriteIds: string[];
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
}

export const useFavouriteSessions = ({
  favouriteIds,
  hasSubscription,
  isAdmin,
  isTestUser,
}: UseFavouriteSessionsParams): { favouriteSessions: FavouriteSession[] } => {
  const [favouriteSessions, setFavouriteSessions] = useState<FavouriteSession[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFavouriteSessions = async () => {
      if (favouriteIds.length === 0) {
        setFavouriteSessions([]);
        return;
      }

      const { data: sessionsData } = await supabase
        .from('classes')
        .select('*')
        .in('id', favouriteIds)
        .eq('is_published', true)
        .abortSignal(controller.signal);

      if (sessionsData) {
        setFavouriteSessions(sessionsData.map(s => ({
          id: s.id,
          title: s.title,
          duration: s.duration_minutes,
          teacher: s.teacher_name,
          image: s.image_url,
          locked: s.requires_subscription && !hasSubscription && !isAdmin && !isTestUser
        })));
      }
    };

    fetchFavouriteSessions();

    return () => {
      controller.abort();
    };
  }, [favouriteIds, hasSubscription, isAdmin, isTestUser]);

  return { favouriteSessions };
};

import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { FeaturedSession } from "../types";

export const useFeaturedSession = () => {
  const [featuredSession, setFeaturedSession] = useState<FeaturedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFeaturedSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase
          .from('classes')
          .select('*')
          .eq('is_featured', true)
          .eq('is_published', true)
          .abortSignal(controller.signal)
          .maybeSingle();

        if (!controller.signal.aborted && data) {
          setFeaturedSession(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('useFeaturedSession: Error fetching featured session:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeaturedSession();
    return () => controller.abort();
  }, []);

  return { featuredSession, isLoading };
};

import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { QuickResetSession } from "../types";

export const useQuickResets = () => {
  const [quickResets, setQuickResets] = useState<QuickResetSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchQuickResets = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase
          .from("classes")
          .select(
            "id, title, short_description, image_url, teacher_name, duration_minutes, requires_subscription, intensity, technique"
          )
          .eq("is_quick_reset", true)
          .eq("is_published", true)
          .order("order_index")
          .abortSignal(controller.signal);

        if (!controller.signal.aborted && data) {
          setQuickResets(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("useQuickResets: Error fetching quick resets:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchQuickResets();
    return () => controller.abort();
  }, []);

  return { quickResets, isLoading };
};

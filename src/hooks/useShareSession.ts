import { toast } from "sonner";

import { copyLink } from "@/lib/copyLink";

export const useShareSession = () => {
  const handleShare = (sessionId: string | null, isPublished?: boolean) => {
    if (!isPublished) {
      toast.error("This session cannot be shared");
      return;
    }
    copyLink(`${window.location.origin}/online/session/${sessionId}`, "Link copied to clipboard");
  };

  return { handleShare };
};

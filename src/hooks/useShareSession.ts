import { toast } from "sonner";

import { copyLink } from "@/lib/copyLink";

export const useShareSession = (
  sessionId: string | null,
  isPublished: boolean | undefined,
  autoplay = false
) => {
  const handleShare = () => {
    if (!isPublished) {
      toast.error("This session cannot be shared");
      return;
    }
    const url = `${window.location.origin}/shared-session/${sessionId}${autoplay ? "?autoplay=true" : ""}`;
    copyLink(url, "Link copied to clipboard");
  };

  return { handleShare };
};

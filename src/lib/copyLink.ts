import { toast } from "sonner";

export const copyLink = async (
  text: string,
  message = "Link copied to clipboard"
): Promise<void> => {
  await navigator.clipboard.writeText(text);
  toast.success(message);
};

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmText: string;
  setConfirmText: (value: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
  /** Custom list of items that will be deleted */
  deleteItems?: string[];
  /** Dialog title - defaults to "Delete Account" */
  title?: string;
}

const DEFAULT_DELETE_ITEMS = [
  "Your account and profile",
  "All course progress and history",
  "All other personal data",
];

export const DeleteAccountDialog = ({
  open,
  onOpenChange,
  confirmText,
  setConfirmText,
  onDelete,
  isDeleting,
  deleteItems = DEFAULT_DELETE_ITEMS,
  title = "Delete Account",
}: DeleteAccountDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
    setConfirmText("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-xl border border-white/20 bg-black/50 p-0 backdrop-blur-xl">
        <div className="p-10 md:p-12">
          <DialogHeader className="mb-6">
            <DialogTitle className="mb-3 font-editorial text-xl text-white md:text-2xl">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-white/60">
              This will permanently delete:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-6 text-sm font-light text-white/60">
            {deleteItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            <Label htmlFor="delete-confirm" className="text-sm font-light text-white/90">
              Type "DELETE" to confirm:
            </Label>
            <Input
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="h-12 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-red-500/40"
            />
          </div>
          <p className="mt-5 text-sm font-light text-red-400">⚠️ This action cannot be undone.</p>
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-12 flex-1 border-2 border-white/20 bg-transparent font-light text-white hover:border-white/40 hover:bg-white/10"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              className="h-12 flex-1 border-2 border-red-500 bg-red-500/10 font-light text-red-400 hover:bg-red-500/20"
              disabled={isDeleting || confirmText !== "DELETE"}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

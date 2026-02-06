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
      <DialogContent className="backdrop-blur-xl bg-black/50 border border-white/30 p-0 overflow-hidden rounded-xl max-w-md">
        <div className="p-8 md:p-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-white text-xl md:text-2xl font-editorial mb-3">
              {title}
            </DialogTitle>
            <DialogDescription className="text-white/60 font-light text-sm">
              This will permanently delete:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc pl-6 space-y-2 text-white/60 text-sm font-light">
            {deleteItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            <Label htmlFor="delete-confirm" className="text-white/90 text-sm font-light">
              Type "DELETE" to confirm:
            </Label>
            <Input
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-red-500/40 h-12"
            />
          </div>
          <p className="mt-5 text-red-400 text-sm font-light">
            ⚠️ This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 h-12 font-light"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              className="flex-1 border-2 border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20 h-12 font-light"
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

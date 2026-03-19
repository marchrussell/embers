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

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
  newEmail: string;
  setNewEmail: (value: string) => void;
  onSubmit: () => void;
  isUpdating: boolean;
}

export const ChangeEmailDialog = ({
  open,
  onOpenChange,
  currentEmail,
  newEmail,
  setNewEmail,
  onSubmit,
  isUpdating,
}: ChangeEmailDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
    setNewEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-xl border border-white/20 bg-black/50 p-0 backdrop-blur-xl">
        <div className="p-10 md:p-12">
          <DialogHeader className="mb-8">
            <DialogTitle className="mb-3 font-editorial text-xl text-white md:text-2xl">
              Change Email
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-white/60">
              Enter your new email address. You'll need to confirm it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="current-email" className="text-sm font-light text-white/90">
                Current Email
              </Label>
              <Input
                id="current-email"
                type="email"
                value={currentEmail}
                disabled
                className="h-12 border-white/20 bg-white/5 text-white/50"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="new-email" className="text-sm font-light text-white/90">
                New Email
              </Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="h-12 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white/40"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-12 flex-1 border-2 border-white/20 bg-transparent font-light text-white hover:border-white/40 hover:bg-white/10"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                className="h-12 flex-1 border-2 border-white bg-transparent font-light text-white hover:bg-white/10"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Email"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

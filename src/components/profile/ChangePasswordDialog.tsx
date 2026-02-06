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

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  onSubmit: () => void;
  isUpdating: boolean;
}

export const ChangePasswordDialog = ({
  open,
  onOpenChange,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isUpdating,
}: ChangePasswordDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-black/50 border border-white/30 p-0 overflow-hidden rounded-xl max-w-md">
        <div className="p-8 md:p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-white text-xl md:text-2xl font-editorial mb-3">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-white/60 font-light text-sm">
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-white/90 text-sm font-light">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-white/90 text-sm font-light">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 h-12"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 h-12 font-light"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                className="flex-1 border-2 border-white text-white bg-transparent hover:bg-white/10 h-12 font-light"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

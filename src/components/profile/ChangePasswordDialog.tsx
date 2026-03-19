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
      <DialogContent className="max-w-md overflow-hidden rounded-xl border border-white/20 bg-black/50 p-0 backdrop-blur-xl">
        <div className="p-10 md:p-12">
          <DialogHeader className="mb-8">
            <DialogTitle className="mb-3 font-editorial text-xl text-white md:text-2xl">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-white/60">
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-sm font-light text-white/90">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white/40"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-sm font-light text-white/90">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

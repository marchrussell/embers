import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface MarchPrivacyModalProps {
  open: boolean;
  onAccept: () => void;
  onReadFullPolicy: () => void;
}

export const MarchPrivacyModal = ({ open, onAccept, onReadFullPolicy }: MarchPrivacyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="backdrop-blur-xl bg-black/75 border border-white/30 p-0 overflow-hidden rounded-lg max-w-lg max-h-[85vh] overflow-y-auto"
        hideClose
      >
        <div className="p-6 md:p-8">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-[#E6DBC7]" />
            </div>
            <DialogTitle className="text-white text-2xl md:text-3xl font-editorial mb-3 text-center">
              Your Privacy at March Russell
            </DialogTitle>
            <DialogDescription className="text-white/80 font-light text-sm text-center">
              We care deeply about your privacy and the safety of your personal data.
              When you use our app and March Chat AI, we collect only what's needed to personalise your breathwork journey.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-6 text-white/80 font-light text-sm leading-relaxed">
            <div>
              <h3 className="text-[#E6DBC7] font-medium text-base mb-2">What we collect</h3>
              <ul className="space-y-1.5 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>Your chat messages and March Chat's responses (to give you tailored support)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>Activity such as sessions viewed, completed, or favourited</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>Basic account info like your name, email, and app settings</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#E6DBC7] font-medium text-base mb-2">How it's used</h3>
              <ul className="space-y-1.5 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>To guide your breathwork practice and track progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>To improve the app and your March Chat experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>Never for advertising or resale</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#E6DBC7] font-medium text-base mb-2">How it's protected</h3>
              <ul className="space-y-1.5 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>Conversations are stored securely and encrypted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>Only authorised systems can process your data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E6DBC7] mt-1">•</span>
                  <span>
                    <span className="font-medium text-white">You can delete your chat history or account anytime in your Profile</span>
                    {" "}(Profile → Data & Privacy)
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/70 text-xs leading-relaxed">
                Your messages may be processed securely by trusted AI partners through our platform provider, Lovable, to generate helpful responses.
              </p>
            </div>

            <div className="pt-2 space-y-2 text-xs text-white/60">
              <p>
                💬 Questions or requests?{" "}
                <a href="mailto:march@marchrussell.com" className="text-[#E6DBC7] hover:text-[#E6DBC7]/80 underline">
                  march@marchrussell.com
                </a>
              </p>
              <p>
                📄 Full Privacy Policy:{" "}
                <a href="/privacy-policy" target="_blank" className="text-[#E6DBC7] hover:text-[#E6DBC7]/80 underline">
                  www.marchrussell.com/privacy
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-white/10">
            <Button
              onClick={onAccept}
              className="w-full bg-white/10 text-white border-2 border-white hover:bg-white/20 h-11 font-light"
            >
              I Understand / Continue
            </Button>
            <Button
              onClick={onReadFullPolicy}
              variant="outline"
              className="w-full border-2 border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/40 h-11 font-light"
            >
              Read Full Policy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

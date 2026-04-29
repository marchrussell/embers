import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MarchPrivacyModalProps {
  open: boolean;
  onAccept: () => void;
  onReadFullPolicy: () => void;
}

//todo - do we need this?

export const MarchPrivacyModal = ({ open, onAccept, onReadFullPolicy }: MarchPrivacyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-h-[85vh] max-w-lg overflow-hidden overflow-y-auto rounded-lg border border-white/30 bg-black/75 p-0 backdrop-blur-xl"
        hideClose
      >
        <div className="p-6 md:p-8">
          <DialogHeader>
            <div className="mb-4 flex items-center justify-center">
              <Shield className="h-12 w-12 text-[#E6DBC7]" />
            </div>
            <DialogTitle className="mb-3 text-center font-editorial text-2xl text-white md:text-3xl">
              Your Privacy at Embers Studio
            </DialogTitle>
            <DialogDescription className="text-center text-sm font-light text-white/80">
              We care deeply about your privacy and the safety of your personal data. When you use
              our app, we collect only what's needed to personalise your breathwork journey.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-5 text-sm font-light leading-relaxed text-white/80">
            <div>
              <h3 className="mb-2 text-base font-medium text-[#E6DBC7]">What we collect</h3>
              <ul className="space-y-1.5 pl-5">
                <li className="list-disc">
                  Activity such as sessions viewed, completed, or favourited
                </li>
                <li className="list-disc">
                  Basic account info like your name, email, and app settings
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-medium text-[#E6DBC7]">How it's used</h3>
              <ul className="space-y-1.5 pl-5">
                <li className="list-disc">To guide your breathwork practice and track progress</li>
                <li className="list-disc">To improve the app experience</li>
                <li className="list-disc">Never for advertising or resale</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-base font-medium text-[#E6DBC7]">How it's protected</h3>
              <ul className="space-y-1.5 pl-5">
                <li className="list-disc">Conversations are stored securely and encrypted</li>
                <li className="list-disc">Only authorised systems can process your data</li>
                <li className="list-disc">
                  <span className="font-medium text-white">
                    You can delete your chat history or account anytime in your Profile
                  </span>{" "}
                  (Profile → Data & Privacy)
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs leading-relaxed text-white/70">
                Your messages may be processed securely by trusted AI partners through our platform
                provider, Lovable, to generate helpful responses.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-white/60">
              <p>
                💬 Questions or requests?{" "}
                <a
                  href="mailto:support@embersstudio.io"
                  className="text-[#E6DBC7] underline hover:text-[#E6DBC7]/80"
                >
                  support@embersstudio.io
                </a>
              </p>
              <p>
                📄 Full Privacy Policy:{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  className="text-[#E6DBC7] underline hover:text-[#E6DBC7]/80"
                >
                  www.embersstudio.io/privacy
                </a>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6">
            <Button
              onClick={onAccept}
              className="h-11 w-full border-2 border-white bg-white/10 font-light text-white hover:bg-white/20"
            >
              I Understand / Continue
            </Button>
            <Button
              onClick={onReadFullPolicy}
              variant="outline"
              className="h-11 w-full border-2 border-white/20 bg-transparent font-light text-white hover:border-white/40 hover:bg-white/5"
            >
              Read Full Policy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

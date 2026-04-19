import { Dialog, DialogContent } from "@/components/ui/dialog";

interface RecordingModalProps {
  recording: { url: string; title: string } | null;
  onClose: () => void;
}

export const RecordingModal = ({ recording, onClose }: RecordingModalProps) => (
  <Dialog open={!!recording} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="z-[100] w-[96%] max-w-3xl gap-0 overflow-hidden rounded-2xl border border-[#E6DBC7]/20 bg-black/90 p-0 backdrop-blur-xl">
      <div className="px-4 py-3 pr-14 md:px-5 md:py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#D4A574] md:text-xs">
          Session Replay
        </p>
        <h3 className="mt-0.5 font-editorial text-base text-[#E6DBC7] md:text-lg">
          {recording?.title}
        </h3>
      </div>
      <video
        key={recording?.url}
        src={recording?.url}
        controls
        autoPlay
        playsInline
        className="w-full"
        style={{ display: "block" }}
      />
    </DialogContent>
  </Dialog>
);

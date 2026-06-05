import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

interface PolicyModalShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const PolicyModalShell = ({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
}: PolicyModalShellProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      hideClose
      className="max-h-[calc(90dvh-3rem)] w-[92vw] max-w-4xl overflow-y-auto overscroll-contain scroll-smooth rounded-xl md:border md:border-white/30 bg-black/75 p-0 backdrop-blur-xl md:max-h-[90dvh]"
    >
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <ModalCloseButton onClose={() => onOpenChange(false)} size="md" />
      <div className="px-6 pb-10 pt-16 md:px-10 md:pt-20 lg:px-12">
        <h1
          className="my-4 text-center font-editorial tracking-[0.01em] text-[#E6DBC7]"
          style={{ fontSize: "clamp(1.8rem, 2.2vw, 2.4rem)", lineHeight: 1.15, fontWeight: 400 }}
        >
          {title}
        </h1>
        {subtitle && <p className="mb-12 text-center text-sm text-[#E6DBC7]/60">{subtitle}</p>}
        <div
          className="mx-auto max-w-[46rem] space-y-10"
          style={{
            fontSize: "clamp(0.9rem, 1vw, 1rem)",
            lineHeight: 1.7,
            color: "rgba(230, 219, 199, 0.9)",
          }}
        >
          {children}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

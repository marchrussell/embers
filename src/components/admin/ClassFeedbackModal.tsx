import { format } from "date-fns";
import { Loader2, Mail, Star, User as UserIcon } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClassFeedback } from "@/hooks/useClassFeedback";

interface ClassFeedbackModalProps {
  classId: string | null;
  classTitle: string;
  onClose: () => void;
}

export function ClassFeedbackModal({ classId, classTitle, onClose }: ClassFeedbackModalProps) {
  const { data: feedback = [], isLoading } = useClassFeedback(classId);

  const avgRating =
    feedback.length > 0
      ? (
          feedback.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
          feedback.filter((r) => r.rating !== null).length
        ).toFixed(1)
      : null;

  const helpedCount = feedback.filter((r) => r.helped_with_goal === true).length;
  const helpedPct = feedback.length > 0 ? Math.round((helpedCount / feedback.length) * 100) : null;

  return (
    <Dialog open={!!classId} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto border border-white/20 bg-black/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#E6DBC7]">Feedback — {classTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#E6DBC7]/60" />
          </div>
        ) : feedback.length === 0 ? (
          <p className="py-8 text-center text-sm text-foreground/50">
            No feedback yet for this class.
          </p>
        ) : (
          <div className="space-y-6 py-6">
            {/* Summary stats */}
            <div className="flex gap-6 rounded-lg border border-white/10 bg-white/5 p-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-semibold text-[#E6DBC7]">{feedback.length}</p>
                <p className="text-foreground/60">responses</p>
              </div>
              {avgRating && (
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#E6DBC7]">{avgRating} / 5</p>
                  <p className="text-foreground/60">avg rating</p>
                </div>
              )}
              {helpedPct !== null && (
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#E6DBC7]">{helpedPct}%</p>
                  <p className="text-foreground/60">helped with goal</p>
                </div>
              )}
            </div>

            {/* Individual rows */}
            <div className="space-y-3">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      {item.user_name && (
                        <span className="flex items-center gap-1.5 font-medium text-white">
                          <UserIcon className="h-3.5 w-3.5 text-[#E6DBC7]/60" />
                          {item.user_name}
                        </span>
                      )}
                      {item.user_email && (
                        <span className="flex items-center gap-1.5 text-foreground/60">
                          <Mail className="h-3.5 w-3.5" />
                          {item.user_email}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {item.rating !== null && (
                        <span className="flex items-center gap-1 text-[#E6DBC7]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < item.rating! ? "fill-[#E6DBC7]" : "text-white/20"}`}
                            />
                          ))}
                        </span>
                      )}
                      {item.helped_with_goal !== null && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.helped_with_goal
                              ? "bg-green-500/20 text-green-400"
                              : "bg-orange-500/20 text-orange-400"
                          }`}
                        >
                          {item.helped_with_goal ? "Helped" : "Not quite"}
                        </span>
                      )}
                      {item.created_at && (
                        <span className="text-xs text-foreground/40">
                          {format(new Date(item.created_at), "d MMM yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.feedback_text && (
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {item.feedback_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentVerificationSkeletonProps {
  sessionId?: string;
  error?: string;
}

export const PaymentVerificationSkeleton = ({
  sessionId,
  error,
}: PaymentVerificationSkeletonProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Card className="w-full max-w-md border-2 border-white bg-black shadow-[0_0_20px_rgba(255,255,255,0.5)]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          {/* Pulsing circle instead of spinner */}
          <div className="relative mb-6">
            <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-white/10" />
          </div>

          {/* Text skeleton */}
          <Skeleton className="mb-4 h-6 w-48 bg-white/15" />
          <Skeleton className="h-4 w-32 bg-white/10" />

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          {sessionId && (
            <p className="mt-4 text-xs font-light text-white/50">Session: {sessionId.slice(-8)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

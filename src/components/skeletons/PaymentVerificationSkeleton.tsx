import { Card, CardContent } from "@/components/ui/card";

export const PaymentVerificationSkeleton = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1A1A] backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6 h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#E6DBC7]/20" />
            <div className="h-16 w-16 rounded-full border border-[#E6DBC7]/30" />
          </div>
          <p className="text-base font-light text-[#E6DBC7]/70">Verifying payment…</p>
        </CardContent>
      </Card>
    </div>
  );
};

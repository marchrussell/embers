import { memo } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import SplitCard from "@/components/ui/split-card";
import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";

const startHereButterfly = getCloudImageUrl(CLOUD_IMAGES.startHereButterfly);

interface StartHereCardProps {
  locked?: boolean;
  onLockedClick?: () => void;
}

const StartHereCard = memo(({ locked = false, onLockedClick }: StartHereCardProps) => (
  <SplitCard
    as={Link}
    to="/online/start-here"
    onClick={(e: React.MouseEvent) => {
      if (locked) {
        e.preventDefault();
        onLockedClick?.();
      }
    }}
    imageSrc={startHereButterfly}
    imageAlt="Begin gently"
    imageWidth={45}
    breakpoint="md"
    mobileLayout="overlay"
    height="h-[380px] md:h-[400px]"
    className="block border-[#E6DBC7]/15 hover:border-[#E6DBC7]/25"
    contentClassName="border-l border-white/5 px-6 py-6 md:px-10 md:py-8"
  >
    <h3 className="mb-3 font-editorial text-2xl font-light leading-tight tracking-tight text-[#E6DBC7] md:text-3xl lg:text-4xl">
      A Simple Place to Begin
    </h3>
    <p className="mb-4 text-xs font-light uppercase tracking-[0.2em] text-[#D4A574] md:mb-5 md:text-sm">
      Your First Two Weeks
    </p>
    <p className="mb-6 max-w-2xl text-sm font-light leading-relaxed text-[#E6DBC7]/80 md:text-base">
      This space is designed to help you arrive gently and find your footing — without pressure
      or expectation.
    </p>
    <Button className="w-fit rounded-full border border-[#E6DBC7]/60 bg-transparent px-12 py-3 text-sm font-light text-[#E6DBC7] transition-all hover:border-[#E6DBC7] hover:bg-white/5 md:text-base">
      Begin gently
    </Button>
  </SplitCard>
));

StartHereCard.displayName = "StartHereCard";
export default StartHereCard;

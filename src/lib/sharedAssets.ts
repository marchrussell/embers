// Shared asset imports to avoid duplication across pages
import zoeLogo from "@/assets/logos/zoe-logo.png";
import teslaLogo from "@/assets/logos/tesla-logo.png";
import googleLogo from "@/assets/logos/google-logo.png";
import itvLogo from "@/assets/logos/itv-logo.png";
import justeatLogo from "@/assets/logos/justeat-logo.png";
import marchLogo from "@/assets/march-logo.png";
import mLogo from "@/assets/m-logo.png";
import trialProgramImage from "@/assets/trial-program.webp";
import breathingBasicsImage from "@/assets/breathing-basics.jpg";
import findingAlivenessImage from "@/assets/finding-aliveness.jpg";
import marchBioPhoto from "@/assets/march-bio-photo.jpg";
import marchTeacherImage from "@/assets/march-russell-teacher.jpg";

export const companyLogos = {
  zoe: zoeLogo,
  tesla: teslaLogo,
  google: googleLogo,
  itv: itvLogo,
  justeat: justeatLogo,
} as const;

export const brandLogos = {
  march: marchLogo,
  mLogo: mLogo,
} as const;

export const programImages = {
  trial: trialProgramImage,
  breathingBasics: breathingBasicsImage,
  findingAliveness: findingAlivenessImage,
} as const;

export const marchImages = {
  bio: marchBioPhoto,
  teacher: marchTeacherImage,
} as const;

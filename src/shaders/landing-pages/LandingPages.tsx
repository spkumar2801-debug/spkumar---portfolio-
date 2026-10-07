import {
  splitTypographyProps,
  usePageTypography,
  type PageTypographyProps,
} from "./pageTypography";
import { LandingPageFrame, type LandingPageProps } from "./LandingPageFrame";
export { LandingPageFrame, applyBackgroundPresentation } from "./LandingPageFrame";
export type { LandingPageFrameProps, LandingPageProps } from "./LandingPageFrame";
import { KAGE_TYPOGRAPHY } from "./pageRecipes";

/**
 * ThreeUI Kage Landing Page Component
 * Canonical source: /landing-pages/kage.html
 * Revision: SHA-256 c8e06b90397a
 */
export function KageLandingPage(props: LandingPageProps & PageTypographyProps) {
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(KAGE_TYPOGRAPHY, type);
  return (
    <LandingPageFrame
      {...frame}
      customization={customization}
      title="Kage — Where stillness reveals the unseen"
      sourceUrl="/landing-pages/kage.html"
    />
  );
}

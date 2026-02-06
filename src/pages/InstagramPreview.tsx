import { InstagramStoryCard } from "@/components/InstagramStoryCard";
import { InstagramStoryCardWithSession } from "@/components/InstagramStoryCardWithSession";
import { InstagramStoryCardMushroom } from "@/components/InstagramStoryCardMushroom";
import { InstagramStoryCardLiveSession } from "@/components/InstagramStoryCardLiveSession";
import { InstagramStoryCardSelfCompassion } from "@/components/InstagramStoryCardSelfCompassion";
import { InstagramStoryCardInnerChild } from "@/components/InstagramStoryCardInnerChild";
import { InstagramStoryCardAwakening } from "@/components/InstagramStoryCardAwakening";
import { InstagramStoryCardClearAwareness } from "@/components/InstagramStoryCardClearAwareness";
import { InstagramStoryCardComingSoon } from "@/components/InstagramStoryCardComingSoon";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstagramPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-editorial text-foreground">
                Instagram Story Previews
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare all story card variations
              </p>
            </div>
          </div>
        </div>

        {/* Grid of Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 - Original */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Original</h3>
              <p className="text-sm text-muted-foreground">Story background</p>
            </div>
            <InstagramStoryCard />
          </div>

          {/* Card 2 - With Session */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">With Session</h3>
              <p className="text-sm text-muted-foreground">The Landing preview</p>
            </div>
            <InstagramStoryCardWithSession />
          </div>

          {/* Card 3 - Mushroom */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Mushroom</h3>
              <p className="text-sm text-muted-foreground">Nature background</p>
            </div>
            <InstagramStoryCardMushroom />
          </div>

          {/* Card 4 - Live Session */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Live Session</h3>
              <p className="text-sm text-muted-foreground">Breathwork event</p>
            </div>
            <InstagramStoryCardLiveSession />
          </div>

          {/* Card 5 - Self Compassion */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Self Compassion</h3>
              <p className="text-sm text-muted-foreground">Calm session</p>
            </div>
            <InstagramStoryCardSelfCompassion />
          </div>

          {/* Card 6 - Inner Child */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Inner Child</h3>
              <p className="text-sm text-muted-foreground">Transform session</p>
            </div>
            <InstagramStoryCardInnerChild />
          </div>

          {/* Card 7 - Morning Awakening */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Morning Awakening</h3>
              <p className="text-sm text-muted-foreground">Energy session</p>
            </div>
            <InstagramStoryCardAwakening />
          </div>

          {/* Card 8 - Clear Awareness */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Clear Awareness</h3>
              <p className="text-sm text-muted-foreground">Energy session</p>
            </div>
            <InstagramStoryCardClearAwareness />
          </div>

          {/* Card 9 - Coming Soon */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">App launch teaser</p>
            </div>
            <InstagramStoryCardComingSoon />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-accent/50 rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3">Tips for Instagram</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Optimal size: 1080 x 1920 pixels (9:16 aspect ratio)</li>
            <li>• Use screenshot tools to capture these cards at the right resolution</li>
            <li>• Test text visibility on different devices before posting</li>
            <li>• Consider adding interactive elements like polls or questions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstagramPreview;

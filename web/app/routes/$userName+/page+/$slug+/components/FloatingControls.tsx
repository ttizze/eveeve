import { useEffect, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/utils/cn";
import { LikeButton } from "~/routes/resources+/like-button";
import { ShareDialog } from "./ShareDialog";
import { Languages, FileText } from "lucide-react";

interface FloatingControlsProps {
  showOriginal: boolean;
  showTranslation: boolean;
  onToggleOriginal: () => void;
  onToggleTranslation: () => void;
  liked: boolean;
  likeCount: number;
  slug: string;
  shareUrl: string;
  shareTitle: string;
}

export function FloatingControls({
  showOriginal,
  showTranslation,
  onToggleOriginal,
  onToggleTranslation,
  liked,
  likeCount,
  slug,
  shareUrl,
  shareTitle,
}: FloatingControlsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    
    // 100px以上の下スクロールの時だけ非表示に
    if (scrollDelta > 100) {
      setIsVisible(false);
    } else if (scrollDelta < 0 || currentScrollY < 100) {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 flex gap-2 transition-all duration-300 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      )}
    >
      <div className="bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOriginal}
          title={showOriginal ? "Hide original text" : "Show original text"}
        >
          <FileText className={cn("h-4 w-4", !showOriginal && "opacity-50")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTranslation}
          title={showTranslation ? "Hide translation" : "Show translation"}
        >
          <Languages className={cn("h-4 w-4", !showTranslation && "opacity-50")} />
        </Button>
        <div className="w-px bg-border" />
        <LikeButton liked={liked} likeCount={likeCount} slug={slug} />
        <ShareDialog url={shareUrl} title={shareTitle} />
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Blend,
  ArrowRight,
  ZoomIn,
  RotateCcw,
  Sparkles,
  ChevronsRight,
  Zap,
  ArrowDownUp,
  SplitSquareHorizontal,
  Wand2,
} from "lucide-react";

export type AnimationType =
  | "fade"
  | "slide"
  | "zoom"
  | "flip"
  | "dissolve"
  | "wipe"
  | "glitch"
  | "bounce"
  | "split"
  | "morph";

interface AnimationOption {
  id: AnimationType;
  name: string;
  icon: React.ElementType;
  description: string;
  popular?: boolean;
}

const animations: AnimationOption[] = [
  { id: "fade", name: "Fade", icon: Blend, description: "Smooth crossfade" },
  { id: "slide", name: "Slide", icon: ArrowRight, description: "Directional slide", popular: true },
  { id: "zoom", name: "Zoom", icon: ZoomIn, description: "Zoom in/out" },
  { id: "flip", name: "Flip", icon: RotateCcw, description: "3D rotation" },
  { id: "dissolve", name: "Dissolve", icon: Sparkles, description: "Pixel blend" },
  { id: "wipe", name: "Wipe", icon: ChevronsRight, description: "Reveal wipe", popular: true },
  { id: "glitch", name: "Glitch", icon: Zap, description: "Glitchy effect" },
  { id: "bounce", name: "Bounce", icon: ArrowDownUp, description: "Playful bounce" },
  { id: "split", name: "Split", icon: SplitSquareHorizontal, description: "Split reveal" },
  { id: "morph", name: "Morph", icon: Wand2, description: "Smooth morph", popular: true },
];

interface AnimationGridProps {
  selected: AnimationType;
  onSelect: (animation: AnimationType) => void;
}

export const AnimationGrid = ({ selected, onSelect }: AnimationGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      {animations.map((animation, index) => {
        const Icon = animation.icon;
        const isSelected = selected === animation.id;

        return (
          <motion.button
            key={animation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(animation.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            {animation.popular && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold gradient-bg text-primary-foreground">
                Popular
              </span>
            )}
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isSelected ? "gradient-bg" : "bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}
              />
            </div>
            <span className="text-xs font-medium">{animation.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

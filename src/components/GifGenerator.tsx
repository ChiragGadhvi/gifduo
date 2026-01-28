import { useState, useCallback } from "react";
import gifshot from "gifshot";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GifSettings } from "./SettingsPanel";
import { AnimationType } from "./AnimationGrid";
import { useToast } from "@/hooks/use-toast";

interface GifGeneratorProps {
  images: string[];
  settings: GifSettings;
  animation: AnimationType;
}

export const GifGenerator = ({ images, settings }: GifGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const generateGif = useCallback(async () => {
    if (images.length < 2) {
      toast({
        title: "Not enough images",
        description: "Please upload 2 images to create a GIF",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setSuccess(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    const [width, height] = settings.outputSize.split("x").map(Number);

    // Build image sequence based on reverse mode
    let imageSequence = [...images];
    if (settings.reverseMode) {
      imageSequence = [...images, ...images.slice().reverse().slice(1)];
    }

    try {
      gifshot.createGIF(
        {
          images: imageSequence,
          gifWidth: width,
          gifHeight: height,
          interval: settings.pauseDuration,
          frameDuration: Math.round(10 / settings.frameRate),
          numWorkers: 2,
          quality: settings.quality === "high" ? 1 : settings.quality === "medium" ? 5 : 10,
          sampleInterval: settings.quality === "high" ? 1 : settings.quality === "medium" ? 10 : 20,
        },
        (result: { error: boolean; errorCode?: string; errorMsg?: string; image?: string }) => {
          clearInterval(progressInterval);

          if (!result.error && result.image) {
            setProgress(100);
            setSuccess(true);

            // Download the GIF
            const link = document.createElement("a");
            link.href = result.image;
            link.download = `gifduo-${Date.now()}.gif`;
            link.click();

            // Save to history
            const history = JSON.parse(localStorage.getItem("gifduo-history") || "[]");
            history.unshift({ image: result.image, date: new Date().toISOString() });
            localStorage.setItem("gifduo-history", JSON.stringify(history.slice(0, 5)));

            toast({
              title: "GIF Created! 🎉",
              description: "Your animated GIF has been downloaded",
            });

            setTimeout(() => {
              setSuccess(false);
              setProgress(0);
            }, 2000);
          } else {
            toast({
              title: "Generation failed",
              description: result.errorMsg || "Something went wrong",
              variant: "destructive",
            });
          }
          setIsGenerating(false);
        }
      );
    } catch {
      clearInterval(progressInterval);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate GIF",
        variant: "destructive",
      });
    }
  }, [images, settings, toast]);

  const estimatedSize = Math.round(
    (images.length *
      parseInt(settings.outputSize) *
      parseInt(settings.outputSize) *
      (settings.quality === "high" ? 3 : settings.quality === "medium" ? 2 : 1)) /
      10000
  );

  return (
    <div className="space-y-4">
      <Button
        variant="hero"
        size="xl"
        className="w-full"
        onClick={generateGif}
        disabled={isGenerating || images.length < 2}
      >
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </motion.span>
          ) : success ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Downloaded!
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download GIF
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground mt-2">
            {progress}% complete
          </p>
        </motion.div>
      )}

      {images.length >= 2 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {estimatedSize > 2000 ? (
            <>
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span>Estimated size: ~{(estimatedSize / 1000).toFixed(1)}MB (large file)</span>
            </>
          ) : (
            <span>Estimated size: ~{estimatedSize}KB</span>
          )}
        </div>
      )}
    </div>
  );
};

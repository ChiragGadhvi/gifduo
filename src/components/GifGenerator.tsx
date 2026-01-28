import { useState, useCallback, useRef } from "react";
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

// Helper to load an image and return it
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Create an animated GIF using canvas frame capture
const createAnimatedGif = async (
  images: string[],
  settings: GifSettings,
  onProgress: (p: number) => void
): Promise<string> => {
  const GIF = (await import("gif.js")).default;
  
  const [width, height] = settings.outputSize.split("x").map(Number);
  
  const gif = new GIF({
    workers: 2,
    quality: settings.quality === "high" ? 1 : settings.quality === "medium" ? 5 : 10,
    width,
    height,
    workerScript: "/gif.worker.js",
  });

  // Load all images
  const loadedImages = await Promise.all(images.map(loadImage));
  onProgress(20);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Apply filter to context
  const getFilterValue = (filter: string) => {
    switch (filter) {
      case "grayscale": return "grayscale(100%)";
      case "sepia": return "sepia(100%)";
      case "vintage": return "sepia(40%) contrast(110%) saturate(80%)";
      case "vibrant": return "saturate(150%) contrast(110%)";
      default: return "none";
    }
  };

  const filterValue = getFilterValue(settings.filter);
  
  // Calculate frames based on settings
  const fps = settings.frameRate;
  const transitionDuration = settings.duration; // seconds
  const pauseDuration = settings.pauseDuration; // seconds
  const transitionFrames = Math.round(fps * transitionDuration);
  const pauseFrames = Math.round(fps * pauseDuration);
  const frameDelay = Math.round(1000 / fps);

  // Build image sequence (with reverse if needed)
  let imageSequence = [...loadedImages];
  if (settings.reverseMode && loadedImages.length === 2) {
    imageSequence = [...loadedImages, ...loadedImages.slice().reverse().slice(1)];
  }

  let totalFrames = 0;
  const framesPerImage = pauseFrames + transitionFrames;
  totalFrames = imageSequence.length * framesPerImage;

  let currentFrame = 0;

  // Generate frames for each image transition
  for (let imgIdx = 0; imgIdx < imageSequence.length; imgIdx++) {
    const currentImg = imageSequence[imgIdx];
    const nextImg = imageSequence[(imgIdx + 1) % imageSequence.length];

    // Pause frames - show current image static
    for (let f = 0; f < pauseFrames; f++) {
      ctx.filter = filterValue;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(currentImg, 0, 0, width, height);
      gif.addFrame(ctx, { copy: true, delay: frameDelay });
      currentFrame++;
      onProgress(20 + (currentFrame / totalFrames) * 60);
    }

    // Transition frames - fade from current to next
    for (let f = 0; f < transitionFrames; f++) {
      const progress = f / transitionFrames;
      ctx.filter = filterValue;
      ctx.clearRect(0, 0, width, height);
      
      // Draw current image with decreasing opacity
      ctx.globalAlpha = 1 - progress;
      ctx.drawImage(currentImg, 0, 0, width, height);
      
      // Draw next image with increasing opacity
      ctx.globalAlpha = progress;
      ctx.drawImage(nextImg, 0, 0, width, height);
      
      ctx.globalAlpha = 1;
      gif.addFrame(ctx, { copy: true, delay: frameDelay });
      currentFrame++;
      onProgress(20 + (currentFrame / totalFrames) * 60);
    }
  }

  onProgress(85);

  return new Promise((resolve, reject) => {
    gif.on("finished", (blob: Blob) => {
      onProgress(100);
      resolve(URL.createObjectURL(blob));
    });
    gif.on("error", reject);
    gif.render();
  });
};

export const GifGenerator = ({ images, settings }: GifGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const abortRef = useRef(false);

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
    abortRef.current = false;

    try {
      const gifUrl = await createAnimatedGif(images, settings, (p) => {
        if (!abortRef.current) setProgress(p);
      });

      if (abortRef.current) return;

      setSuccess(true);

      // Download the GIF
      const link = document.createElement("a");
      link.href = gifUrl;
      link.download = `gifduo-${Date.now()}.gif`;
      link.click();

      // Convert blob URL to data URL for storage
      const response = await fetch(gifUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Save to history
        const history = JSON.parse(localStorage.getItem("gifduo-history") || "[]");
        history.unshift({ image: dataUrl, date: new Date().toISOString() });
        localStorage.setItem("gifduo-history", JSON.stringify(history.slice(0, 5)));
      };
      reader.readAsDataURL(blob);

      // Cleanup
      URL.revokeObjectURL(gifUrl);

      toast({
        title: "GIF Created! 🎉",
        description: "Your animated GIF has been downloaded",
      });

      setTimeout(() => {
        setSuccess(false);
        setProgress(0);
      }, 2000);
    } catch (error) {
      console.error("GIF generation error:", error);
      toast({
        title: "Generation failed",
        description: "Something went wrong while creating your GIF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
          <Progress value={progress} className="h-1 bg-secondary" />
          <p className="text-sm text-center text-muted-foreground mt-2">
            {Math.round(progress)}% complete
          </p>
        </motion.div>
      )}

      {images.length >= 2 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {estimatedSize > 2000 ? (
            <>
              <AlertCircle className="w-4 h-4" />
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

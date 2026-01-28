import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Check, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GifSettings } from "./SettingsPanel";
import { AnimationType } from "./AnimationGrid";
import { useToast } from "@/hooks/use-toast";

// @ts-ignore
import GIF from "gif.js/dist/gif.js";

interface GifGeneratorProps {
  images: string[];
  settings: GifSettings;
  animation: AnimationType;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load: " + src));
    img.src = src;
  });
};

const createAnimatedGif = async (
  images: string[],
  settings: GifSettings,
  onProgress: (p: number) => void
): Promise<string> => {
  const [width, height] = settings.outputSize.split("x").map(Number);
  
  const gif = new GIF({
    workers: 4,
    quality: settings.quality === "high" ? 2 : settings.quality === "medium" ? 10 : 20,
    width,
    height,
    workerScript: "/gif.worker.js",
  });

  const loadedImages = await Promise.all(images.map(loadImage));
  onProgress(5);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  const fps = settings.frameRate;
  const frameDelay = Math.round(1000 / fps);
  const tFrames = Math.max(1, Math.round(fps * settings.duration));
  const pFrames = Math.max(1, Math.round(fps * settings.pauseDuration));

  let sequence = [...loadedImages];
  if (settings.reverseMode && loadedImages.length === 2) {
    sequence = [loadedImages[0], loadedImages[1], loadedImages[0]];
  }

  const totalFrames = sequence.length * (pFrames + tFrames);
  let currentFrame = 0;

  for (let i = 0; i < sequence.length; i++) {
    const img = sequence[i];
    const nextImg = sequence[(i + 1) % sequence.length];

    // Static phase
    for (let f = 0; f < pFrames; f++) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      gif.addFrame(ctx, { copy: true, delay: frameDelay });
      currentFrame++;
      onProgress(5 + (currentFrame / totalFrames) * 75);
    }

    // Transition phase
    if (sequence.length > 1) {
      for (let f = 0; f < tFrames; f++) {
        const progress = f / tFrames;
        ctx.clearRect(0, 0, width, height);
        
        ctx.globalAlpha = 1 - progress;
        ctx.drawImage(img, 0, 0, width, height);
        
        ctx.globalAlpha = progress;
        ctx.drawImage(nextImg, 0, 0, width, height);
        
        ctx.globalAlpha = 1;
        gif.addFrame(ctx, { copy: true, delay: frameDelay });
        currentFrame++;
        onProgress(5 + (currentFrame / totalFrames) * 75);
      }
    }
  }

  return new Promise((resolve, reject) => {
    gif.on("finished", (blob: Blob) => {
      onProgress(100);
      resolve(URL.createObjectURL(blob));
    });
    gif.on("progress", (p: number) => onProgress(80 + p * 20));
    gif.on("error", (e: any) => reject(e));
    gif.render();
  });
};

export const GifGenerator = ({ images, settings }: GifGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = useCallback((url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `gifduo-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }, []);

  const generate = async () => {
    if (images.length < 2) return;
    setIsGenerating(true);
    setProgress(0);
    setSuccess(false);

    try {
      const url = await createAnimatedGif(images, settings, setProgress);
      setGifUrl(url);
      setSuccess(true);
      handleDownload(url);
      toast({ title: "Success! 🎉", description: "GIF generated and downloading." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to generate GIF.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              size="lg"
              className="w-full h-12 rounded-xl font-bold shadow-lg"
              onClick={generate}
              disabled={isGenerating || images.length < 2}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating... {Math.round(progress)}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Generate GIF
                </span>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12 rounded-xl font-bold border-primary/20 text-primary"
                onClick={() => handleDownload(gifUrl!)}
              >
                <Check className="w-5 h-5 mr-2" />
                Download Ready
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-xl"
                onClick={() => {
                  setSuccess(false);
                  setProgress(0);
                  setGifUrl(null);
                }}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
            {gifUrl && (
              <a 
                href={gifUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-center text-muted-foreground hover:underline flex items-center justify-center gap-1 mt-1"
              >
                Open in new tab <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="h-1" />
          <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
            Processing Frames
          </p>
        </div>
      )}
    </div>
  );
};

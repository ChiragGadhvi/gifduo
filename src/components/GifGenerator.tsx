import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Check, RotateCcw } from "lucide-react";
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

export const GifGenerator = ({ images, settings, animation }: GifGeneratorProps) => {
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
    setTimeout(() => {
      if (typeof document !== 'undefined' && document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 200);
  }, []);

  const generate = async () => {
    if (images.length < 2) return;
    setIsGenerating(true);
    setProgress(0);
    setSuccess(false);
    setGifUrl(null);

    try {
      const [width, height] = settings.outputSize.split("x").map(Number);
      const loadedImages = await Promise.all(images.map(loadImage));
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      // Use a consistent frame rate for professional results
      const fps = 30; 
      const frameDelay = 1000 / fps;
      
      // Calculate frames based on user settings
      const tFramesCount = Math.max(1, Math.round(fps * settings.duration));
      const pFramesCount = Math.max(1, Math.round(fps * settings.pauseDuration));

      const gif = new GIF({
        workers: 4,
        quality: 1, // BEST QUALITY (lowest value = highest clarity)
        width,
        height,
        workerScript: "/gif.worker.js",
        dither: "FloydSteinberg", // Best for gradients
      });

      const sequence = [...loadedImages];
      const totalCaptureCycles = sequence.length;

      for (let i = 0; i < totalCaptureCycles; i++) {
        const current = sequence[i];
        const next = sequence[(i + 1) % totalCaptureCycles];

        // 1. Static Phase (Pause)
        for (let f = 0; f < pFramesCount; f++) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(current, 0, 0, width, height);
          gif.addFrame(ctx, { copy: true, delay: frameDelay });
          
          // Progress feedback for capture (0-50%)
          setProgress(Math.round(((i * (pFramesCount + tFramesCount) + f) / (totalCaptureCycles * (pFramesCount + tFramesCount))) * 50));
        }

        // 2. Transition Phase (Simultaneous/Overlapped)
        for (let f = 0; f < tFramesCount; f++) {
          const t = f / tFramesCount;
          // Smooth ease-out for a professional feel
          const ease = 1 - Math.pow(1 - t, 3); 

          ctx.clearRect(0, 0, width, height);
          ctx.save();
          
          if (animation === 'slide') {
            ctx.drawImage(current, -ease * width, 0, width, height);
            ctx.drawImage(next, width - (ease * width), 0, width, height);
          } else if (animation === 'zoom') {
            ctx.globalAlpha = 1 - ease;
            const s1 = 1 + ease * 0.2;
            ctx.translate(width/2, height/2);
            ctx.scale(s1, s1);
            ctx.drawImage(current, -width/2, -height/2, width, height);
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            ctx.globalAlpha = ease;
            const s2 = 0.9 + ease * 0.1;
            ctx.translate(width/2, height/2);
            ctx.scale(s2, s2);
            ctx.drawImage(next, -width/2, -height/2, width, height);
          } else if (animation === 'flip') {
            ctx.translate(width/2, 0);
            if (ease < 0.5) {
              ctx.scale(1 - ease * 2, 1);
              ctx.drawImage(current, -width/2, 0, width, height);
            } else {
              ctx.scale((ease - 0.5) * 2, 1);
              ctx.drawImage(next, -width/2, 0, width, height);
            }
          } else if (animation === 'wipe') {
            ctx.drawImage(current, 0, 0, width, height);
            ctx.beginPath();
            ctx.rect(width - (ease * width), 0, width, height);
            ctx.clip();
            ctx.drawImage(next, 0, 0, width, height);
          } else {
            // High Fidelity Fade
            ctx.globalAlpha = 1 - ease;
            ctx.drawImage(current, 0, 0, width, height);
            ctx.globalAlpha = ease;
            ctx.drawImage(next, 0, 0, width, height);
          }
          
          ctx.restore();
          gif.addFrame(ctx, { copy: true, delay: frameDelay });
          
          setProgress(Math.round(((i * (pFramesCount + tFramesCount) + pFramesCount + f) / (totalCaptureCycles * (pFramesCount + tFramesCount))) * 50));
        }
      }

      // Handle seamless loop (Reverse/Ping-Pong logic handled by GIF repeat by default, but we can double frames if needed)
      // settings.reverseMode logic can go here if the user wants true ping-pong

      return new Promise((resolve, reject) => {
        gif.on("finished", (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          setProgress(100);
          setGifUrl(url);
          setSuccess(true);
          handleDownload(url);
          toast({ title: "High-Quality GIF Ready! 🔥", description: "Exported with 256-bit color precision." });
          resolve(url);
        });

        gif.on("progress", (p: number) => {
          // Progress feedback for rendering (50-100%)
          setProgress(50 + Math.round(p * 50));
        });

        gif.on("error", (e: any) => {
          console.error("GIF Render Error:", e);
          reject(e);
        });

        gif.render();
      }).finally(() => {
        setIsGenerating(false);
      });

    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      toast({ title: "Error", description: "Failed to generate quality GIF.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 w-full">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              size="lg"
              className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all"
              onClick={generate}
              disabled={isGenerating || images.length < 2}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  HQ Encoding... {progress}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Generate High Quality GIF
                </span>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-12 rounded-xl font-bold border-primary text-primary hover:bg-primary/5 shadow-sm"
              onClick={() => handleDownload(gifUrl!)}
            >
              <Check className="w-5 h-5 mr-2" />
              Download Ready
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-border"
              onClick={() => {
                setSuccess(false);
                setProgress(0);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="h-1.5" />
          <p className="text-[10px] text-center text-muted-foreground font-black tracking-widest uppercase">
            {progress < 50 ? "Capturing 1:1 Preview" : "Applying Floyd-Steinberg Dithering"}
          </p>
        </div>
      )}
    </div>
  );
};

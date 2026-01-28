import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GifSettings } from "./SettingsPanel";
import { AnimationType } from "./AnimationGrid";
import { useToast } from "@/hooks/use-toast";

// @ts-ignore
import gifshot from "gifshot";

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
      
      // ENSURE HIGHEST QUALITY RENDERING
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const fps = 24; // Standard cinematic FPS for GIFs
      const tFramesCount = Math.max(1, Math.round(fps * settings.duration));
      const pFramesCount = Math.max(1, Math.round(fps * settings.pauseDuration));

      const frames: string[] = [];
      const sequence = [...loadedImages];

      const totalCaptureFrames = sequence.length * (pFramesCount + tFramesCount);

      for (let i = 0; i < sequence.length; i++) {
        const current = sequence[i];
        const next = sequence[(i + 1) % sequence.length];

        // Pause Phase
        for (let f = 0; f < pFramesCount; f++) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(current, 0, 0, width, height);
          // USE UNCOMPRESSED PNG FOR INTERMEDIATE FRAMES TO AVOID BLUR/ARTIFACTS
          frames.push(canvas.toDataURL("image/png")); 
          setProgress(Math.round((frames.length / totalCaptureFrames) * 40));
        }

        // Transition Phase
        for (let f = 0; f < tFramesCount; f++) {
          const t = f / tFramesCount;
          // Smooth Step Easing
          const ease = t * t * (3 - 2 * t);

          ctx.clearRect(0, 0, width, height);
          ctx.save();
          
          if (animation === 'slide') {
            ctx.drawImage(current, -ease * width, 0, width, height);
            ctx.drawImage(next, width - (ease * width), 0, width, height);
          } else if (animation === 'zoom') {
            ctx.globalAlpha = 1 - ease;
            const s1 = 1 + ease * 0.15;
            ctx.translate(width/2, height/2);
            ctx.scale(s1, s1);
            ctx.drawImage(current, -width/2, -height/2, width, height);
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            ctx.globalAlpha = ease;
            const s2 = 0.85 + ease * 0.15;
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
          } else {
            ctx.globalAlpha = 1 - ease;
            ctx.drawImage(current, 0, 0, width, height);
            ctx.globalAlpha = ease;
            ctx.drawImage(next, 0, 0, width, height);
          }
          
          ctx.restore();
          frames.push(canvas.toDataURL("image/png"));
          setProgress(Math.round((frames.length / totalCaptureFrames) * 40));
        }
      }

      // Final Assembly with MAX QUALITY
      gifshot.createGIF(
        {
          images: frames,
          gifWidth: width,
          gifHeight: height,
          interval: 1 / fps,
          numFrames: frames.length,
          sampleInterval: 1, // BEST COLOR QUALITY (1 = pixel perfect sampling)
          numWorkers: 2,
          fontWeight: 'normal',
          filter: '',
        },
        (obj: any) => {
          if (!obj.error) {
            const url = obj.image;
            setProgress(100);
            setGifUrl(url);
            setSuccess(true);
            handleDownload(url);
            toast({ title: "Crystal Clear!", description: "GIF generated with high fidelity." });
          } else {
            console.error(obj.errorMsg);
            toast({ title: "Error", description: "Fidelity loss during export.", variant: "destructive" });
          }
          setIsGenerating(false);
        }
      );

    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      toast({ title: "Error", description: "Generation failed.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 w-full">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              size="lg"
              className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all"
              onClick={generate}
              disabled={isGenerating || images.length < 2}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Building HQ... {progress}%
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
              className="flex-1 h-12 rounded-xl font-bold border-primary text-primary hover:bg-primary/5 shadow-premium"
              onClick={() => handleDownload(gifUrl!)}
            >
              <Check className="w-5 h-5 mr-2" />
              Download Ready!
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
          <Progress value={progress} className="h-1.5 bg-muted" />
          <p className="text-[9px] text-center text-muted-foreground font-black tracking-[0.2em] uppercase">
            {progress < 40 ? "Retaining Original Clarity" : "Finalizing Fidelity"}
          </p>
        </div>
      )}
    </div>
  );
};

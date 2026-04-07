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

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load: " + src));
    img.src = src;
  });
};

// Matches the easeInOut curve Framer Motion uses in the preview
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// Replicates CSS object-cover: center-crops the image to fill (dw × dh)
// Works correctly even when ctx has an active transform (translate/scale).
const drawCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number
) => {
  const imgAR = img.naturalWidth / img.naturalHeight;
  const dstAR = dw / dh;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (imgAR > dstAR) {
    // Image is wider → crop sides equally
    sw = sh * dstAR;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    // Image is taller → crop top/bottom equally
    sh = sw / dstAR;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
};

// Draw a rounded-rectangle clip path (used for morph animation)
const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) => {
  const cr = Math.min(r, Math.abs(w / 2), Math.abs(h / 2));
  ctx.beginPath();
  ctx.moveTo(x + cr, y);
  ctx.lineTo(x + w - cr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
  ctx.lineTo(x + w, y + h - cr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
  ctx.lineTo(x + cr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
  ctx.lineTo(x, y + cr);
  ctx.quadraticCurveTo(x, y, x + cr, y);
  ctx.closePath();
};

const CSS_FILTERS: Record<string, string> = {
  grayscale: "grayscale(100%)",
  sepia: "sepia(100%)",
  vintage: "sepia(40%) contrast(110%) saturate(80%)",
  vibrant: "saturate(150%) contrast(110%)",
};

// Lower = better colour fidelity but slower GIF encoding
const QUALITY_TO_SAMPLE: Record<string, number> = { low: 20, medium: 10, high: 3 };

interface GifGeneratorProps {
  images: string[];
  settings: GifSettings;
  animation: AnimationType;
}

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
      if (document.body.contains(link)) document.body.removeChild(link);
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
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const fps = Math.max(10, Math.min(30, settings.frameRate));
      const tFrames = Math.max(4, Math.round(fps * settings.duration));
      const pFrames = Math.max(1, Math.round(fps * settings.pauseDuration));

      const sequence = settings.reverseMode
        ? [...loadedImages].reverse()
        : [...loadedImages];

      const baseFilter = CSS_FILTERS[settings.filter] ?? "";

      // Fill black background — matches the preview's bg-black container
      const fillBg = () => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
      };

      // Draw an image with object-cover cropping, optional alpha, optional CSS filter.
      // Caller may set up transforms before calling; source crop is always from the
      // image's natural size so it works correctly inside any ctx transform.
      const drawImg = (
        img: HTMLImageElement,
        x: number, y: number, w: number, h: number,
        alpha = 1,
        extraFilter = ""
      ) => {
        const combined = [extraFilter, baseFilter].filter(Boolean).join(" ") || "none";
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.filter = combined;
        drawCover(ctx, img, x, y, w, h);
        ctx.restore();
      };

      const totalFrames = sequence.length * (pFrames + tFrames);
      const frames: string[] = [];

      const addFrame = async (frameIdx: number) => {
        // JPEG is ~10× smaller than PNG → dramatically faster gifshot encoding
        frames.push(canvas.toDataURL("image/jpeg", 0.85));
        setProgress(Math.round((frames.length / totalFrames) * 70));
        // Yield every 8 frames so the progress bar visibly updates
        if (frameIdx % 8 === 0) {
          await new Promise<void>((r) => setTimeout(r, 0));
        }
      };

      // The preview uses y:100 (px) for bounce travel at ~350px display size → ~28%
      const bounceOffset = height * 0.28;

      let frameIdx = 0;

      for (let i = 0; i < sequence.length; i++) {
        const current = sequence[i];
        const next = sequence[(i + 1) % sequence.length];

        // ── Pause frames (static) ─────────────────────────────────────────────
        for (let f = 0; f < pFrames; f++) {
          fillBg();
          drawImg(current, 0, 0, width, height);
          await addFrame(frameIdx++);
        }

        // ── Transition frames ─────────────────────────────────────────────────
        for (let f = 0; f < tFrames; f++) {
          const t = smoothstep(f / tFrames);
          fillBg();

          switch (animation) {
            // ── Fade ─────────────────────────────────────────────────────────
            // Preview: opacity 1→0 / 0→1
            case "fade": {
              drawImg(current, 0, 0, width, height, 1 - t);
              drawImg(next,    0, 0, width, height, t);
              break;
            }

            // ── Slide ─────────────────────────────────────────────────────────
            // Preview: x "-100%" exit / "100%" initial → horizontal push
            case "slide": {
              drawImg(current, -t * width,        0, width, height);
              drawImg(next,    (1 - t) * width,   0, width, height);
              break;
            }

            // ── Zoom ─────────────────────────────────────────────────────────
            // Preview: exit scale 1→2 + fade out / enter scale 0→1 + fade in
            case "zoom": {
              // current exits: grows to 2×, fades out
              ctx.save();
              ctx.globalAlpha = 1 - t;
              ctx.translate(width / 2, height / 2);
              ctx.scale(1 + t, 1 + t);
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, current, -width / 2, -height / 2, width, height);
              ctx.restore();
              // next enters: grows from 0, fades in
              ctx.save();
              ctx.globalAlpha = t;
              ctx.translate(width / 2, height / 2);
              ctx.scale(Math.max(0.01, t), Math.max(0.01, t));
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, next, -width / 2, -height / 2, width, height);
              ctx.restore();
              break;
            }

            // ── Flip ─────────────────────────────────────────────────────────
            // Preview: rotateY 90→0 / 0→-90 (faked with scaleX)
            case "flip": {
              ctx.save();
              ctx.translate(width / 2, height / 2);
              if (t < 0.5) {
                ctx.scale(1 - t * 2, 1);
                if (baseFilter) ctx.filter = baseFilter;
                drawCover(ctx, current, -width / 2, -height / 2, width, height);
              } else {
                ctx.scale((t - 0.5) * 2, 1);
                if (baseFilter) ctx.filter = baseFilter;
                drawCover(ctx, next, -width / 2, -height / 2, width, height);
              }
              ctx.restore();
              break;
            }

            // ── Dissolve ──────────────────────────────────────────────────────
            // Preview: opacity + blur(10px) ↔ 0
            case "dissolve": {
              drawImg(current, 0, 0, width, height, 1 - t, `blur(${t * 8}px)`);
              drawImg(next,    0, 0, width, height, t,     `blur(${(1 - t) * 8}px)`);
              break;
            }

            // ── Wipe ──────────────────────────────────────────────────────────
            // Preview: clipPath inset(0 100%→0% 0 0) — reveals left-to-right
            case "wipe": {
              const reveal = t * width;
              // current stays on right side (left edge clips away)
              ctx.save();
              ctx.beginPath();
              ctx.rect(reveal, 0, width - reveal, height);
              ctx.clip();
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, current, 0, 0, width, height);
              ctx.restore();
              // next reveals on left side
              ctx.save();
              ctx.beginPath();
              ctx.rect(0, 0, reveal, height);
              ctx.clip();
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, next, 0, 0, width, height);
              ctx.restore();
              break;
            }

            // ── Glitch ────────────────────────────────────────────────────────
            // Preview: x ±20px + hue-rotate(±90deg) + opacity
            case "glitch": {
              drawImg(current,  t * 20,        0, width, height, 1 - t, `hue-rotate(${-t * 90}deg)`);
              drawImg(next,    (t - 1) * 20,   0, width, height, t,     `hue-rotate(${(1 - t) * 90}deg)`);
              break;
            }

            // ── Bounce ────────────────────────────────────────────────────────
            // Preview: y -100px→0 enter / 0→100px exit + opacity (100px ≈ 28% at 350px)
            case "bounce": {
              drawImg(current, 0,  t * bounceOffset,        width, height, 1 - t);
              drawImg(next,    0, -(1 - t) * bounceOffset,  width, height, t);
              break;
            }

            // ── Split ─────────────────────────────────────────────────────────
            // Preview: scaleX 0→1 enter / 1→0 exit (from centre) + opacity
            case "split": {
              // current: scaleX 1→0, fades out
              ctx.save();
              ctx.globalAlpha = 1 - t;
              ctx.translate(width / 2, height / 2);
              ctx.scale(Math.max(0.001, 1 - t), 1);
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, current, -width / 2, -height / 2, width, height);
              ctx.restore();
              // next: scaleX 0→1, fades in
              ctx.save();
              ctx.globalAlpha = t;
              ctx.translate(width / 2, height / 2);
              ctx.scale(Math.max(0.001, t), 1);
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, next, -width / 2, -height / 2, width, height);
              ctx.restore();
              break;
            }

            // ── Morph ─────────────────────────────────────────────────────────
            // Preview: borderRadius 50%→0 + scale 0.5→1 + opacity enter / reverse exit
            case "morph": {
              const maxR = Math.min(width, height) / 2;
              // current: grows circular (r 0→50%), shrinks (scale 1→0.5), fades out
              ctx.save();
              ctx.globalAlpha = 1 - t;
              ctx.translate(width / 2, height / 2);
              ctx.scale(1 - t * 0.5, 1 - t * 0.5);
              roundedRectPath(ctx, -width / 2, -height / 2, width, height, t * maxR);
              ctx.clip();
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, current, -width / 2, -height / 2, width, height);
              ctx.restore();
              // next: shrinks circular (r 50%→0), grows (scale 0.5→1), fades in
              ctx.save();
              ctx.globalAlpha = t;
              ctx.translate(width / 2, height / 2);
              ctx.scale(0.5 + t * 0.5, 0.5 + t * 0.5);
              roundedRectPath(ctx, -width / 2, -height / 2, width, height, (1 - t) * maxR);
              ctx.clip();
              if (baseFilter) ctx.filter = baseFilter;
              drawCover(ctx, next, -width / 2, -height / 2, width, height);
              ctx.restore();
              break;
            }
          }

          await addFrame(frameIdx++);
        }
      }

      setProgress(72);

      const sampleInterval = QUALITY_TO_SAMPLE[settings.quality] ?? 10;

      gifshot.createGIF(
        {
          images: frames,
          gifWidth: width,
          gifHeight: height,
          interval: 1 / fps,
          numFrames: frames.length,
          sampleInterval,
          numWorkers: 4,
        },
        (obj: any) => {
          if (!obj.error) {
            const url = obj.image;
            setProgress(100);
            setGifUrl(url);
            setSuccess(true);
            handleDownload(url);
            toast({ title: "GIF ready!", description: "Your animation has been downloaded." });
          } else {
            console.error(obj.errorMsg);
            toast({ title: "Error", description: "GIF generation failed.", variant: "destructive" });
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

  const phaseLabel =
    progress < 70 ? "Rendering frames…" :
    progress < 95 ? "Encoding GIF…" :
    "Done!";

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
                  {phaseLabel} {progress}%
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Generate &amp; Download GIF
                </span>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-12 rounded-xl font-bold border-primary text-primary hover:bg-primary/5"
              onClick={() => handleDownload(gifUrl!)}
            >
              <Check className="w-5 h-5 mr-2" />
              Download Again
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-border"
              onClick={() => { setSuccess(false); setProgress(0); }}
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
            {phaseLabel}
          </p>
        </div>
      )}
    </div>
  );
};

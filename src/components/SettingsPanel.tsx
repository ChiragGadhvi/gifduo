import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Gauge,
  Repeat,
  Timer,
  Square,
  Palette,
  Frame,
  Settings2,
} from "lucide-react";

export interface GifSettings {
  duration: number;
  loopCount: string;
  pauseDuration: number;
  outputSize: string;
  frameRate: number;
  quality: string;
  cropShape: string;
  filter: string;
  borderWidth: number;
  backgroundColor: string;
  reverseMode: boolean;
}

interface SettingsPanelProps {
  settings: GifSettings;
  onSettingsChange: (settings: GifSettings) => void;
}

const sizeOptions = [
  { value: "500x500", label: "Profile (500×500)" },
  { value: "200x200", label: "Email Sig (200×200)" },
  { value: "150x150", label: "Small (150×150)" },
  { value: "256x256", label: "Icon (256×256)" },
];

const filterOptions = [
  { value: "none", label: "None" },
  { value: "grayscale", label: "Grayscale" },
  { value: "sepia", label: "Sepia" },
  { value: "vintage", label: "Vintage" },
  { value: "vibrant", label: "Vibrant" },
];

const qualityOptions = [
  { value: "low", label: "Low (Fast)" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High (Slow)" },
];

const loopOptions = [
  { value: "infinite", label: "Infinite" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
  { value: "5", label: "5×" },
];

export const SettingsPanel = ({
  settings,
  onSettingsChange,
}: SettingsPanelProps) => {
  const update = <K extends keyof GifSettings>(
    key: K,
    value: GifSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-3 p-4 bg-background rounded-2xl border border-border shadow-sm overflow-y-auto max-h-[80vh]"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-6 h-6 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
          <Settings2 className="w-3 h-3 text-primary" />
        </div>
        <h3 className="font-display font-bold text-[11px] uppercase tracking-wider">Settings</h3>
      </div>

      {/* Speed/Duration */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Gauge className="w-3 h-3" />
            Speed
          </Label>
          <span className="text-[10px] text-muted-foreground font-bold">{settings.duration}s</span>
        </div>
        <Slider
          value={[settings.duration]}
          onValueChange={([v]) => update("duration", v)}
          min={0.1}
          max={2}
          step={0.1}
          className="py-1"
        />
      </div>

      {/* Pause Duration */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Timer className="w-3 h-3" />
            Pause
          </Label>
          <span className="text-[10px] text-muted-foreground font-bold">{settings.pauseDuration}s</span>
        </div>
        <Slider
          value={[settings.pauseDuration]}
          onValueChange={([v]) => update("pauseDuration", v)}
          min={0}
          max={3}
          step={0.1}
          className="py-1"
        />
      </div>

      {/* Loop Count */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Repeat className="w-3 h-3" />
          Loop
        </Label>
        <Select
          value={settings.loopCount}
          onValueChange={(v) => update("loopCount", v)}
        >
          <SelectTrigger className="h-8 text-[10px] bg-muted/30 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {loopOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reverse Mode */}
      <div className="flex items-center justify-between py-0.5">
        <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Repeat className="w-3 h-3" />
          Reverse
        </Label>
        <Switch
          className="scale-75"
          checked={settings.reverseMode}
          onCheckedChange={(v) => update("reverseMode", v)}
        />
      </div>

      {/* Output Size */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Square className="w-3 h-3" />
          Size
        </Label>
        <Select
          value={settings.outputSize}
          onValueChange={(v) => update("outputSize", v)}
        >
          <SelectTrigger className="h-8 text-[10px] bg-muted/30 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {sizeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frame Rate */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Frame className="w-3 h-3" />
            FPS
          </Label>
          <span className="text-[10px] text-muted-foreground font-bold">{settings.frameRate}</span>
        </div>
        <Slider
          value={[settings.frameRate]}
          onValueChange={([v]) => update("frameRate", v)}
          min={10}
          max={30}
          step={1}
          className="py-1"
        />
      </div>

      {/* Quality */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Settings2 className="w-3 h-3" />
          Quality
        </Label>
        <Select
          value={settings.quality}
          onValueChange={(v) => update("quality", v)}
        >
          <SelectTrigger className="h-8 text-[10px] bg-muted/30 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {qualityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <Palette className="w-3 h-3" />
          Filter
        </Label>
        <Select
          value={settings.filter}
          onValueChange={(v) => update("filter", v)}
        >
          <SelectTrigger className="h-8 text-[10px] bg-muted/30 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

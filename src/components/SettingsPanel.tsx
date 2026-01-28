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
  Sparkles,
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 p-6 bg-card rounded-2xl border shadow-card"
    >
      <div className="flex items-center gap-2 pb-2 border-b">
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="font-semibold">Customize</h3>
      </div>

      {/* Speed/Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            Animation Speed
          </Label>
          <span className="text-sm text-muted-foreground">{settings.duration}s</span>
        </div>
        <Slider
          value={[settings.duration]}
          onValueChange={([v]) => update("duration", v)}
          min={0.5}
          max={5}
          step={0.1}
        />
      </div>

      {/* Pause Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            Pause Duration
          </Label>
          <span className="text-sm text-muted-foreground">{settings.pauseDuration}s</span>
        </div>
        <Slider
          value={[settings.pauseDuration]}
          onValueChange={([v]) => update("pauseDuration", v)}
          min={0.5}
          max={5}
          step={0.1}
        />
      </div>

      {/* Loop Count */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-primary" />
          Loop Count
        </Label>
        <Select
          value={settings.loopCount}
          onValueChange={(v) => update("loopCount", v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            {loopOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reverse Mode */}
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-primary" />
          Reverse Mode
        </Label>
        <Switch
          checked={settings.reverseMode}
          onCheckedChange={(v) => update("reverseMode", v)}
        />
      </div>

      {/* Output Size */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Square className="w-4 h-4 text-primary" />
          Output Size
        </Label>
        <Select
          value={settings.outputSize}
          onValueChange={(v) => update("outputSize", v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            {sizeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frame Rate */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Frame className="w-4 h-4 text-primary" />
            Frame Rate
          </Label>
          <span className="text-sm text-muted-foreground">{settings.frameRate} fps</span>
        </div>
        <Slider
          value={[settings.frameRate]}
          onValueChange={([v]) => update("frameRate", v)}
          min={10}
          max={30}
          step={1}
        />
      </div>

      {/* Quality */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Quality
        </Label>
        <Select
          value={settings.quality}
          onValueChange={(v) => update("quality", v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            {qualityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          Filter
        </Label>
        <Select
          value={settings.filter}
          onValueChange={(v) => update("filter", v)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border">
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

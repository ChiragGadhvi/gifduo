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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5 p-5 bg-card rounded-xl border border-border"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center">
          <Settings2 className="w-4 h-4 text-foreground" />
        </div>
        <h3 className="font-display font-semibold text-sm">Settings</h3>
      </div>

      {/* Speed/Duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-xs">
            <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
            Animation Speed
          </Label>
          <span className="text-xs text-muted-foreground font-medium">{settings.duration}s</span>
        </div>
        <Slider
          value={[settings.duration]}
          onValueChange={([v]) => update("duration", v)}
          min={0.5}
          max={5}
          step={0.1}
          className="py-1"
        />
      </div>

      {/* Pause Duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-xs">
            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            Pause Duration
          </Label>
          <span className="text-xs text-muted-foreground font-medium">{settings.pauseDuration}s</span>
        </div>
        <Slider
          value={[settings.pauseDuration]}
          onValueChange={([v]) => update("pauseDuration", v)}
          min={0.5}
          max={5}
          step={0.1}
          className="py-1"
        />
      </div>

      {/* Loop Count */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
          Loop Count
        </Label>
        <Select
          value={settings.loopCount}
          onValueChange={(v) => update("loopCount", v)}
        >
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {loopOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reverse Mode */}
      <div className="flex items-center justify-between py-1">
        <Label className="flex items-center gap-2 text-xs">
          <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
          Reverse Mode
        </Label>
        <Switch
          checked={settings.reverseMode}
          onCheckedChange={(v) => update("reverseMode", v)}
        />
      </div>

      {/* Output Size */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <Square className="w-3.5 h-3.5 text-muted-foreground" />
          Output Size
        </Label>
        <Select
          value={settings.outputSize}
          onValueChange={(v) => update("outputSize", v)}
        >
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {sizeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Frame Rate */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-xs">
            <Frame className="w-3.5 h-3.5 text-muted-foreground" />
            Frame Rate
          </Label>
          <span className="text-xs text-muted-foreground font-medium">{settings.frameRate} fps</span>
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
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
          Quality
        </Label>
        <Select
          value={settings.quality}
          onValueChange={(v) => update("quality", v)}
        >
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {qualityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs">
          <Palette className="w-3.5 h-3.5 text-muted-foreground" />
          Filter
        </Label>
        <Select
          value={settings.filter}
          onValueChange={(v) => update("filter", v)}
        >
          <SelectTrigger className="h-9 text-xs bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

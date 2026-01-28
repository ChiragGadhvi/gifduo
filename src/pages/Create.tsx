import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import { AnimationGrid, AnimationType } from "@/components/AnimationGrid";
import { SettingsPanel, GifSettings } from "@/components/SettingsPanel";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { GifGenerator } from "@/components/GifGenerator";
import { Footer } from "@/components/Footer";

const defaultSettings: GifSettings = {
  duration: 0.5,
  loopCount: "infinite",
  pauseDuration: 1,
  outputSize: "500x500",
  frameRate: 20,
  quality: "medium",
  cropShape: "square",
  filter: "none",
  borderWidth: 0,
  backgroundColor: "#ffffff",
  reverseMode: false,
};

const Create = () => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>("fade");
  const [settings, setSettings] = useState<GifSettings>(defaultSettings);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2 tracking-tight">Create Your GIF</h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Upload two photos and customize your animation settings to create a professional GIF.
            </p>
          </motion.div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { num: 1, label: "Upload", active: true },
              { num: 2, label: "Animate", active: images.length >= 2 },
              { num: 3, label: "Download", active: images.length >= 2 },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2">
                <motion.div
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: idx * 0.1 }}
                   className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-bold border transition-all duration-300 ${
                    step.active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border"
                  }`}
                >
                  {step.num}
                </motion.div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    step.active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {step.num < 3 && (
                  <div className="w-8 h-px bg-border ml-2" />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_360px_300px] gap-4 md:gap-8">
            {/* Left - Workspace */}
            <div className="space-y-4 md:space-y-6">
              <div className="p-5 md:p-8 bg-card rounded-2xl md:rounded-3xl border border-border shadow-sm">
                <h2 className="text-base md:text-lg font-display font-bold mb-4 md:mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-full bg-primary/5 text-primary text-[10px] md:text-xs flex items-center justify-center font-bold border border-primary/10">
                    1
                  </div>
                   Upload Photos
                </h2>
                <ImageUploader
                  images={images}
                  onImagesChange={setImages}
                  maxImages={2}
                />
              </div>

              {images.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 md:p-8 bg-card rounded-2xl md:rounded-3xl border border-border shadow-sm"
                >
                  <h2 className="text-base md:text-lg font-display font-bold mb-4 md:mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-full bg-primary/5 text-primary text-[10px] md:text-xs flex items-center justify-center font-bold border border-primary/10">
                      2
                    </div>
                    Choose Animation
                  </h2>
                  <AnimationGrid
                    selected={selectedAnimation}
                    onSelect={setSelectedAnimation}
                  />
                </motion.div>
              )}
            </div>

            {/* Center - Preview */}
            <div className="space-y-4 md:space-y-6">
              <div className="p-5 md:p-8 bg-card rounded-2xl md:rounded-3xl border border-border shadow-sm h-full flex flex-col items-center">
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 md:mb-8">Live Preview</h2>
                <div className="flex-1 flex items-center justify-center mb-6 md:mb-8 w-full">
                  <PreviewCanvas
                    images={images}
                    animation={selectedAnimation}
                    settings={settings}
                  />
                </div>

                {images.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full pt-4 md:pt-6 border-t border-border"
                  >
                    <GifGenerator
                      images={images}
                      settings={settings}
                      animation={selectedAnimation}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right - Settings */}
            {images.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:sticky lg:top-24"
              >
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={setSettings}
                />
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Create;

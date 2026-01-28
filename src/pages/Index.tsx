import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ImageUploader } from "@/components/ImageUploader";
import { AnimationGrid, AnimationType } from "@/components/AnimationGrid";
import { SettingsPanel, GifSettings } from "@/components/SettingsPanel";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { GifGenerator } from "@/components/GifGenerator";
import { Footer } from "@/components/Footer";

const defaultSettings: GifSettings = {
  duration: 1,
  loopCount: "infinite",
  pauseDuration: 1,
  outputSize: "500x500",
  frameRate: 15,
  quality: "medium",
  cropShape: "square",
  filter: "none",
  borderWidth: 0,
  backgroundColor: "#ffffff",
  reverseMode: false,
};

const Index = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>("fade");
  const [settings, setSettings] = useState<GifSettings>(defaultSettings);
  const creatorRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setShowCreator(true);
  };

  useEffect(() => {
    if (showCreator && creatorRef.current) {
      creatorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showCreator]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <HeroSection onStart={handleStart} />

      <AnimatePresence>
        {showCreator && (
          <motion.section
            ref={creatorRef}
            id="create"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
            className="py-16 px-4"
          >
            <div className="max-w-7xl mx-auto">
              {/* Step indicators */}
              <div className="flex items-center justify-center gap-4 mb-12">
                {[
                  { num: 1, label: "Upload", active: true },
                  { num: 2, label: "Animate", active: images.length >= 2 },
                  { num: 3, label: "Download", active: images.length >= 2 },
                ].map((step) => (
                  <div key={step.num} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        step.active
                          ? "gradient-bg text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.num}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        step.active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.num < 3 && (
                      <div className="w-12 h-0.5 bg-border mx-2" />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1fr_400px_320px] gap-8">
                {/* Left - Upload */}
                <div className="space-y-8">
                  <div className="p-6 bg-card rounded-2xl border shadow-card">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full gradient-bg text-primary-foreground text-xs flex items-center justify-center font-bold">
                        1
                      </span>
                      Upload Images
                    </h2>
                    <ImageUploader
                      images={images}
                      onImagesChange={setImages}
                      maxImages={2}
                    />
                  </div>

                  {images.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-card rounded-2xl border shadow-card"
                    >
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full gradient-bg text-primary-foreground text-xs flex items-center justify-center font-bold">
                          2
                        </span>
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
                <div className="space-y-6">
                  <div className="p-6 bg-card rounded-2xl border shadow-card h-full flex flex-col">
                    <h2 className="text-xl font-semibold mb-6 text-center">Preview</h2>
                    <div className="flex-1 flex items-center justify-center">
                      <PreviewCanvas
                        images={images}
                        animation={selectedAnimation}
                        settings={settings}
                      />
                    </div>
                  </div>

                  {images.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <GifGenerator
                        images={images}
                        settings={settings}
                        animation={selectedAnimation}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Right - Settings */}
                {images.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <SettingsPanel
                      settings={settings}
                      onSettingsChange={setSettings}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Index;

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader = ({
  images,
  onImagesChange,
  maxImages = 2,
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    (files: FileList) => {
      const validFiles = Array.from(files)
        .filter((file) => {
          const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
            file.type
          );
          const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
          return isValidType && isValidSize;
        })
        .slice(0, maxImages - images.length);

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onImagesChange([...images, result].slice(0, maxImages));
        };
        reader.readAsDataURL(file);
      });
    },
    [images, maxImages, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const swapImages = useCallback(() => {
    if (images.length === 2) {
      onImagesChange([images[1], images[0]]);
    }
  }, [images, onImagesChange]);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {images.length < maxImages && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer",
              isDragging
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {images.length === 0
                    ? "Drop your images here"
                    : `Add ${maxImages - images.length} more image${maxImages - images.length > 1 ? "s" : ""}`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG, WEBP • Max 10MB each
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <div className="flex items-center gap-4 justify-center">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={image.slice(0, 50) + index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="relative group"
              >
                <div className="w-32 h-32 rounded-xl overflow-hidden shadow-card border-2 border-border">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {images.length === 2 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={swapImages}
              className="w-10 h-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
              title="Swap images"
            >
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </motion.button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center justify-center gap-6 py-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center"
            >
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

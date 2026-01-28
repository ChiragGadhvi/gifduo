import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Image as ImageIcon, Zap, Sparkles } from "lucide-react";
import ghostIcon from "@/assets/ghost.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-12 md:py-20 px-6 overflow-hidden relative">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="max-w-4xl w-full text-center relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm mb-2">
              <img src={ghostIcon} alt="GifDuo" className="w-8 h-8 md:w-10 md:h-10 opacity-80 dark:invert" />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.05] text-balance">
              Animate your <br className="hidden md:block" />
              <span className="text-muted-foreground/30 italic">Profile Picture</span>
            </h1>

            <p className="text-sm md:text-lg text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed px-4 text-balance">
              Effortlessly transform photos into high-quality animated GIFs.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto px-6 sm:px-0"
            >
              <Button 
                onClick={() => navigate("/create")}
                className="group px-8 py-3 h-12 text-sm sm:text-base rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 bg-primary text-primary-foreground font-bold"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-3 h-12 text-sm sm:text-base rounded-xl border-border bg-background hover:bg-muted transition-all font-bold"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

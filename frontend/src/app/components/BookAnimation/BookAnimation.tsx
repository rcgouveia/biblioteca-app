import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookAnimationProps {
  onAnimationComplete?: () => void;
}

// --- CONSTANTES ---
const NUM_PAGES = 5;
const PAGE_ROTATION_BASE = -155;
const PAGE_ROTATION_STEP = 1;
const PAGE_DELAY_BASE = 0;
const PAGE_DELAY_STEP = 0.08;
const PAGE_TRANSITION_DURATION = 0.1;

// --- VARIANTS DE ANIMAÇÃO (Estrutura Limpa) ---
const coverVariants = {
  closed: {
    rotateY: 0,
    // Sombra forte quando fechado
    boxShadow: "0 25px 50px -12px rgba(30, 20, 15, 0.5), inset 0 0 30px rgba(0,0,0,0.2)",
    transition: { duration: PAGE_TRANSITION_DURATION, ease: [0.4, 0, 0.2, 1] },
  },
  open: {
    rotateY: -160,
    // Sombra removida (ou muito subtil) quando aberto
    boxShadow: "0 0 0 rgba(0,0,0,0)", 
    transition: { duration: PAGE_TRANSITION_DURATION, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function BookAnimation({ onAnimationComplete }: BookAnimationProps) { // ALTERADO: Renomeado de App para BookAnimation
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Lógica de temporização
  useEffect(() => {
    const timerOpen = setTimeout(() => {
      setIsOpen(true);
    }, 800);
    return () => clearTimeout(timerOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timerContent = setTimeout(() => {
        setShowContent(true);
        onAnimationComplete?.();
      }, PAGE_TRANSITION_DURATION * 1000 + 100);
      return () => clearTimeout(timerContent);
    }
  }, [isOpen, onAnimationComplete]);

  // Estilos centralizados
  const styles = useMemo(() => ({
    goldColor: "hsl(var(--gold))",
    gold70: "hsl(var(--gold) / 0.70)",
    gold40: "hsl(var(--gold) / 0.40)",
    gold30: "hsl(var(--gold) / 0.30)",
    bookCoverGradient: "linear-gradient(to bottom right, hsl(var(--book-cover)), hsl(var(--book-cover-dark)))",
    spineShadow: "inset -2px 0 8px rgba(0,0,0,0.3)",
    pagesShadow: "2px 0 4px rgba(0,0,0,0.1)",
  }), []);

  return (
    <div className="relative perspective-2000 flex items-center justify-center">
      {/* 1. Glow effect */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl"
        style={{ background: "hsl(var(--gold) / 0.20)" }}
        animate={{
          scale: isOpen ? [1, 1.2, 1] : 1,
          opacity: isOpen ? [0.3, 0.6, 0.4] : 0.2,
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 2. Book container */}
      <div className="relative preserve-3d w-72 h-96 md:w-80 md:h-[420px]">
        
        {/* 3. Book spine */}
        <div
          className="absolute left-0 w-8 h-full bg-book-spine rounded-l-md"
          style={{
            transform: "translateX(-4px) rotateY(-90deg)",
            transformOrigin: "right center",
            boxShadow: styles.spineShadow,
          }}
        >
          <div className="absolute inset-x-2 top-8 bottom-8 border-y border-gold/40" />
          <div className="absolute inset-x-2 top-1/3 bottom-1/3 border-y border-gold/30" />
        </div>

        {/* 4. Back cover */}
        <div
          className="absolute inset-0 rounded-r-md rounded-l-sm book-shadow"
          style={{
            background: styles.bookCoverGradient,
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.2)",
          }}
        >
          <div className="absolute inset-4 border border-gold/20 rounded-sm" />
        </div>

        {/* 5. Pages stack */}
        <div
          className="absolute right-0 top-2 bottom-2 w-2 bg-linear-to-r from-book-page-edge to-book-pages rounded-r-sm"
          style={{ transform: "translateX(2px)" }}
        />
        

        {/* 6. Inner pages */}
        {[...Array(NUM_PAGES)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 bg-book-pages rounded-r-md origin-left page-shadow"
            initial={{ rotateY: 0 }}
            animate={{
              rotateY: isOpen ? (PAGE_ROTATION_BASE - i * PAGE_ROTATION_STEP) : 0,
            }}
            transition={{
              duration: 1.2,
              delay: PAGE_DELAY_BASE + i * PAGE_DELAY_STEP,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              transformStyle: "preserve-3d",
              boxShadow: styles.pagesShadow,
            }}
          >
            <div className="absolute inset-8 flex flex-col gap-3 opacity-20">
              {[...Array(12)].map((_, j) => (
                <div key={j} className="h-1 bg-foreground/30 rounded" style={{}} />
              ))}
            </div>
          </motion.div>
        ))}

        {/* 7. Front cover (FINAL: Variants + Correção Visual) */}
        <motion.div
          className="absolute inset-0 rounded-r-md rounded-l-sm origin-left preserve-3d"
          
          // Usa variants para animação e sombra (Código Limpo)
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          
          // IMPORTANTE: Removemos o background daqui para corrigir a transparência ao abrir
        >
          {/* Front cover face (A face visível da frente) */}
          <div 
            className="absolute inset-0 backface-hidden rounded-r-md rounded-l-sm overflow-hidden"
            // O fundo fica APENAS aqui
            style={{ background: styles.bookCoverGradient }}
          >
            {/* Ornamentos da capa */}
            <div className="absolute inset-3 border-2 border-gold/40 rounded-sm" />
            <div className="absolute inset-5 border border-gold/20 rounded-sm" />

            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: styles.gold40 }} />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: styles.gold40 }} />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: styles.gold40 }} />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: styles.gold40 }} />

            {/* Título */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="w-16 h-0.5 mb-4" style={{ background:`linear-gradient(to right, transparent, ${styles.goldColor}, transparent)` }} />
              <h2 className="font-display text-3xl text-center tracking-wide" style={{ color: styles.goldColor }}>
                Biblioteca
              </h2>
              <p className="font-display text-sm mt-2 italic tracking-widest" style={{ color: styles.gold70 }}>
                Digital
              </p>
              <div className="w-24 h-0.5 mt-4" style={{ background:`linear-gradient(to right, transparent, ${styles.goldColor}, transparent)` }} />
              <div className="mt-8 w-12 h-12 rotate-45 flex items-center justify-center border" style={{ borderColor: styles.gold40 }}>
                <div className="w-6 h-6 -rotate-45 border" style={{ borderColor: styles.gold30 }} />
              </div>
            </div>
          </div>

          {/* Inner cover (A face visível quando aberto) */}
          <div
            className="absolute inset-0 rounded-r-md"
            style={{
              background: "linear-gradient(to bottom right, hsl(var(--parchment)), hsl(var(--secondary)))",
              transform: "rotateY(180deg)",
              // Esconde esta face quando o livro está fechado (evita flickering)
              backfaceVisibility: "hidden",
            }}
          />
        </motion.div>

        {/* 8. Main content page */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="absolute inset-0 rounded-r-md flex items-center justify-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ background:"hsl(var(--book-pages))" }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="font-display text-xl italic" style={{ color:"hsl(var(--primary))" }}>
                    "Um livro é um sonho
                  </p>
                  <p className="font-display text-xl italic" style={{ color:"hsl(var(--primary))" }}>
                    que você segura
                  </p>
                  <p className="font-display text-xl italic" style={{ color:"hsl(var(--primary))" }}>
                    nas mãos."
                  </p>
                  <p className="text-sm mt-4" style={{ color:"hsl(var(--muted-foreground))" }}>
                    — Neil Gaiman
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 9. Abrindo... Text */}
      {!isOpen && (
        <motion.p
          className="absolute -bottom-12 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ color:"hsl(var(--muted-foreground))" }}
        >
          Abrindo...
        </motion.p>
      )}
    </div>
  );
};
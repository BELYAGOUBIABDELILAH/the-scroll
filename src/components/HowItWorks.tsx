import { motion } from "framer-motion";
import { PenLine, ListChecks, BarChart3, ChevronRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const steps = [
  {
    icon: PenLine,
    step: "01",
    title: "Forge Your Scroll",
    description: "Create your publication in seconds. No setup fees, no gatekeepers — just your voice and a blank page.",
  },
  {
    icon: ListChecks,
    step: "02",
    title: "Rally Your Bannermen",
    description: "Build a loyal readership. Gate premium content, forge alliances, and grow through word-of-mouth.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Track Your Reign",
    description: "Monitor views, subscribers, and engagement in real-time. Know exactly how your realm expands.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-14"
      >
        <h2 className="mb-2 font-serif text-3xl font-bold text-foreground">How It Works</h2>
        <p className="text-sm text-muted-foreground">Three steps to sovereign publishing.</p>
      </motion.div>

      <div className="relative grid gap-6 md:grid-cols-3">
        {/* Connecting line (desktop) */}
        <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-border md:block" />

        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative flex flex-col items-start"
          >
            {/* Step number + icon */}
            <div className="relative z-10 mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="hidden h-4 w-4 text-muted-foreground/30 md:absolute md:-right-5 md:top-4 md:block" />
              )}
            </div>

            <span className="mb-2 font-mono text-xs font-semibold tracking-widest text-primary/60">
              STEP {step.step}
            </span>
            <h3 className="mb-2 font-serif text-xl font-bold text-foreground">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

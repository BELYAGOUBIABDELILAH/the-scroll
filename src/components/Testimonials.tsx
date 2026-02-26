import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const testimonials = [
  {
    quote: "I left Substack for The Scroll and never looked back. The alliance system alone tripled my reach in two months.",
    name: "Elara Voss",
    role: "Independent Essayist",
    initials: "EV",
  },
  {
    quote: "Finally a platform that treats writers like sovereigns, not content generators. The sealed-scroll model lets me actually earn from my craft.",
    name: "Marcus Chen",
    role: "Tech & Culture Writer",
    initials: "MC",
  },
  {
    quote: "The council feature changed everything. My readers don't just consume — they participate. It's the closest thing to a literary salon I've found online.",
    name: "Amara Osei",
    role: "Political Commentator",
    initials: "AO",
  },
];

export const Testimonials = () => {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h2 className="mb-2 font-serif text-3xl font-bold text-foreground">Voices from the Realm</h2>
        <p className="text-sm text-muted-foreground">What our scribes are saying.</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col justify-between rounded-lg border border-border bg-card p-6"
          >
            <div>
              <Quote className="mb-4 h-5 w-5 text-primary/40" />
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground italic">
                "{t.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 border-t border-border pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

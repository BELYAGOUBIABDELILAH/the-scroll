import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { PenLine, Users, Lock, BarChart3, Feather, BookOpen } from "lucide-react";

const guideSteps = [
  {
    icon: Feather,
    title: "1. Create Your Account",
    description:
      "Sign up as a Scribe to unlock the full publishing toolkit. Choose your display name, upload an avatar, and write a bio that tells readers who you are.",
  },
  {
    icon: PenLine,
    title: "2. Write Your First Scroll",
    description:
      "Open the editor from your Dashboard. Use Markdown for rich formatting — headings, bold, links, images, and code blocks are all supported out of the box.",
  },
  {
    icon: Lock,
    title: "3. Gate Premium Content",
    description:
      "Toggle the Seal on any scroll to make it subscriber-only. Free scrolls grow your audience; sealed scrolls reward your most loyal bannermen.",
  },
  {
    icon: Users,
    title: "4. Forge Alliances",
    description:
      "Endorse fellow scribes you respect. Alliances cross-pollinate audiences and build a decentralized network of trusted voices across the realm.",
  },
  {
    icon: BarChart3,
    title: "5. Track Your Growth",
    description:
      "Monitor page views, subscriber counts, and engagement from your Dashboard analytics. Know exactly how your realm expands over time.",
  },
  {
    icon: BookOpen,
    title: "6. Engage Your Council",
    description:
      "Every published scroll has a Council section. Respond to reader comments, spark debates, and build a community around your ideas.",
  },
];

const WriterGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-widest text-primary/60 uppercase">
            Writer Guide
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            From Blank Page to Published Scroll
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Everything you need to know to start publishing, grow your audience, and build a sustainable writing practice on The Scroll.
          </p>
        </motion.div>

        <div className="space-y-8">
          {guideSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-6 rounded-xl border border-border bg-card p-8"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 rounded-xl border border-primary/20 bg-primary/5 p-8"
        >
          <h3 className="font-serif text-xl font-bold text-foreground mb-4">Pro Tips</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Consistency beats virality — publish on a regular schedule your readers can rely on.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Use excerpts wisely — a compelling excerpt is the difference between a click and a scroll-past.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Respond to every Council comment in your first month. Early engagement compounds.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">•</span>
              Tag your scrolls accurately — it helps readers discover your work through topic filters.
            </li>
          </ul>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default WriterGuide;

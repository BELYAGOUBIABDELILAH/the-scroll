import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Feather, BookOpen, Shield, Scroll } from "lucide-react";
import { Link } from "react-router-dom";

const MOCK_SCROLLS = [
  { id: 1, title: "The Weight of the Iron Crown", author: "Vaelys Blackthorn", excerpt: "Power is not given. It is forged in fire, tempered with blood, and worn until it breaks you…", sealed: false, date: "3 days ago" },
  { id: 2, title: "On the Nature of Dragons", author: "Serenei of Lys", excerpt: "They do not serve. They do not obey. They simply are — and the world bends around them.", sealed: true, date: "1 week ago" },
  { id: 3, title: "Letters from the Wall", author: "Maegor the Chronicler", excerpt: "The cold teaches patience. When the wind cuts to bone, you learn what truly matters…", sealed: false, date: "2 weeks ago" },
  { id: 4, title: "A Treatise on Loyalty", author: "Vaelys Blackthorn", excerpt: "Bannermen do not choose their lords lightly. The pledge, once spoken, is written in blood.", sealed: true, date: "3 weeks ago" },
  { id: 5, title: "The Art of the Small Council", author: "Serenei of Lys", excerpt: "Every whisper in the throne room has a price. The wise learn to listen before they speak.", sealed: false, date: "1 month ago" },
  { id: 6, title: "Fire Cannot Kill a Dragon", author: "Maegor the Chronicler", excerpt: "They said the last dragon died in a cage. They were wrong — it merely waited.", sealed: false, date: "1 month ago" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Scroll className="h-5 w-5 text-primary" />
            <span className="font-serif text-xl font-bold tracking-wide text-foreground">The Scroll</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/auth">Read the Scrolls</Link>
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/80" asChild>
              <Link to="/auth">Enter the Keep</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-16">
        {/* Background ember effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px] animate-ember-glow" />
        </div>

        <motion.div
          className="relative z-10 max-w-3xl text-center"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary"
          >
            A Micro-Publishing Platform
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-6 font-serif text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
          >
            Seal your words.{" "}
            <span className="text-gradient-fire italic">Send your ravens.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            An exclusive publishing chamber for writers who craft words worth sealing.
            Publish scrolls to your bannermen in a cinematic, distraction-free sanctuary.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-primary px-8 text-primary-foreground hover:bg-primary/80" asChild>
              <Link to="/auth">
                <Shield className="mr-2 h-4 w-4" />
                Enter the Keep
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border px-8 text-foreground hover:bg-secondary" asChild>
              <Link to="/auth">
                <BookOpen className="mr-2 h-4 w-4" />
                Read the Scrolls
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-3 font-serif text-3xl font-bold text-foreground">How The Scroll Works</h2>
          <p className="text-muted-foreground">Three steps from quill to raven.</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Feather, title: "Write Your Scroll", desc: "A distraction-free markdown editor. No clutter — just your words and the blank page." },
            { icon: Shield, title: "Seal or Unseal", desc: "Choose who reads your work. Unsealed scrolls are public; sealed ones require an account." },
            { icon: BookOpen, title: "Send the Raven", desc: "Publish instantly. Your bannermen receive your words in their personal feed." },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group rounded-lg border border-border bg-card p-8 transition-colors hover:border-primary/30"
            >
              <step.icon className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Scrolls — Bento Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 font-serif text-3xl font-bold text-foreground">Recent Scrolls</h2>
          <p className="text-muted-foreground">From the quills of our scribes.</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SCROLLS.map((scroll, i) => (
            <motion.article
              key={scroll.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`group cursor-pointer rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-card/80 ${
                i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:p-10" : ""
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                {scroll.sealed && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Sealed
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{scroll.date}</span>
              </div>
              <h3 className={`mb-2 font-serif font-bold text-foreground ${i === 0 ? "text-2xl lg:text-3xl" : "text-lg"}`}>
                {scroll.title}
              </h3>
              <p className={`mb-4 leading-relaxed text-muted-foreground ${i === 0 ? "text-base" : "text-sm"}`}>
                {scroll.excerpt}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                by <span className="text-foreground">{scroll.author}</span>
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Scroll className="h-4 w-4 text-primary" />
            <span className="font-serif text-sm font-semibold text-foreground">The Scroll</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Seal your words. Send your ravens. © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

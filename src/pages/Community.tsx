import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Award, ArrowRight } from "lucide-react";

const communityFeatures = [
  {
    icon: Users,
    title: "Writer Alliances",
    description:
      "Forge alliances with fellow scribes. Endorse each other, grow together, and build a decentralized network of trusted voices across the realm.",
    cta: "Explore Alliances",
    href: "/#council",
  },
  {
    icon: MessageSquare,
    title: "The Council",
    description:
      "Every scroll opens a council chamber. Readers deliberate, debate, and shape discourse. Your audience isn't passive — they're engaged participants.",
    cta: "Read Scrolls",
    href: "/#chronicles",
  },
  {
    icon: Award,
    title: "Bannerman Pledges",
    description:
      "Subscribers aren't just numbers — they're bannermen who pledge loyalty to your voice. Build a community of readers who truly care about your words.",
    cta: "Start Writing",
    href: "/auth",
  },
];

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Join the Realm
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            The Scroll isn't just a platform — it's a community of independent writers and dedicated readers building something different.
          </p>
        </motion.div>

        <div className="space-y-6">
          {communityFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 sm:flex-row sm:items-center"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
              <Link
                to={feature.href}
                className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                {feature.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-8"
        >
          {[
            { value: "500+", label: "Active Writers" },
            { value: "50K+", label: "Readers" },
            { value: "10K+", label: "Posts Published" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-3xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;

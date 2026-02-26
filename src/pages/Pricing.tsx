import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Check, Scroll } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to start publishing.",
    features: [
      "Unlimited posts",
      "Custom publication page",
      "Email newsletter",
      "Reader comments (The Council)",
      "Basic analytics",
      "Writer alliances",
    ],
    cta: "Get Started",
    href: "/auth",
    highlighted: false,
  },
  {
    name: "Scribe Pro",
    price: "$9",
    period: "/month",
    description: "For serious writers building a loyal audience.",
    features: [
      "Everything in Free",
      "Sealed (subscriber-only) scrolls",
      "Advanced analytics dashboard",
      "Priority support",
      "Custom domain",
      "No branding on publication",
      "Email automation",
      "API access",
    ],
    cta: "Upgrade to Pro",
    href: "/auth",
    highlighted: true,
  },
  {
    name: "Guild",
    price: "$29",
    period: "/month",
    description: "For teams and publications with multiple writers.",
    features: [
      "Everything in Pro",
      "Up to 10 writers",
      "Team collaboration tools",
      "Revenue sharing",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Us",
    href: "#",
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start for free. Upgrade when you're ready to unlock more powerful tools.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl border p-8 transition-all ${
                plan.highlighted
                  ? "border-primary bg-card shadow-xl shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <h3 className="font-serif text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <div className="mb-2">
                <span className="font-serif text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;

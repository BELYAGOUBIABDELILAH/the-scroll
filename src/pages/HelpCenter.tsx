import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, BookOpen, PenLine, Shield, Users, Settings, Mail } from "lucide-react";
import { useState } from "react";

const categories = [
  {
    icon: PenLine,
    title: "Getting Started",
    articles: [
      "How to create your first scroll",
      "Setting up your publication profile",
      "Choosing your writer name",
      "Understanding the Scribe vs Bannerman roles",
    ],
  },
  {
    icon: BookOpen,
    title: "Writing & Publishing",
    articles: [
      "Using the scroll editor",
      "Adding tags to your scrolls",
      "Sealing scrolls for subscribers only",
      "Publishing best practices",
    ],
  },
  {
    icon: Users,
    title: "Growing Your Audience",
    articles: [
      "How the alliances system works",
      "Getting discovered on the feed",
      "Email subscriber management",
      "Sharing your profile",
    ],
  },
  {
    icon: Shield,
    title: "Account & Security",
    articles: [
      "Updating your password",
      "Managing your profile settings",
      "Two-factor authentication",
      "Deleting your account",
    ],
  },
  {
    icon: Settings,
    title: "Dashboard & Analytics",
    articles: [
      "Understanding your analytics",
      "Subscriber growth metrics",
      "Open rate tracking",
      "Exporting your data",
    ],
  },
  {
    icon: Mail,
    title: "Newsletter & Email",
    articles: [
      "How email notifications work",
      "Managing email subscribers",
      "Email delivery troubleshooting",
      "Unsubscribe management",
    ],
  },
];

const HelpCenter = () => {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? categories
        .map((c) => ({
          ...c,
          articles: c.articles.filter((a) => a.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter((c) => c.articles.length > 0)
    : categories;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Find answers to common questions about The Scroll.
          </p>

          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help..."
              className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <cat.icon className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-serif text-lg font-bold text-foreground mb-3">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.articles.map((a) => (
                  <li key={a}>
                    <button className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {a}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No articles found for "{search}".</p>
          </div>
        )}

        <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="font-serif text-xl font-bold text-foreground mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? Reach out to our support team.
          </p>
          <a
            href="mailto:support@thescroll.com"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;

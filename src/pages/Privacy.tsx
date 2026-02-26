import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

          <div className="prose-custom space-y-8">
            <Section title="1. Information We Collect">
              <p>We collect information you provide directly when you create an account, publish content, or communicate with us. This includes your email address, display name, profile information, and the content of your scrolls.</p>
              <p>We automatically collect certain technical information when you use The Scroll, including your IP address, browser type, device information, and usage patterns through our analytics system.</p>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to provide, maintain, and improve The Scroll platform. This includes operating your publication, delivering email notifications to your subscribers, and providing analytics about your content's reach.</p>
              <p>We do not sell your personal information to third parties. We do not use your data for targeted advertising.</p>
            </Section>

            <Section title="3. Content Ownership">
              <p>You retain full ownership of all content you publish on The Scroll. We do not claim any intellectual property rights over your scrolls, comments, or other user-generated content. You grant us a limited license to display and distribute your content as part of the platform's operation.</p>
            </Section>

            <Section title="4. Data Storage & Security">
              <p>Your data is stored securely using industry-standard encryption and security practices. We use row-level security policies to ensure that your private content (drafts, subscriber lists) is only accessible to you.</p>
            </Section>

            <Section title="5. Email & Notifications">
              <p>When readers subscribe to your publication via email, their email addresses are stored in our system. As a scribe, you can view your subscriber list. We do not share subscriber email addresses with any third party.</p>
            </Section>

            <Section title="6. Cookies & Analytics">
              <p>We use anonymous visitor IDs to track page views and content engagement. We do not use third-party tracking cookies or advertising pixels. Our analytics are privacy-focused and designed to give writers useful insights without compromising reader privacy.</p>
            </Section>

            <Section title="7. Your Rights">
              <p>You may request deletion of your account and all associated data at any time by contacting support. You can update your profile information and manage your content through the dashboard. Subscribers can unsubscribe from any publication at any time.</p>
            </Section>

            <Section title="8. Contact">
              <p>For questions about this privacy policy or your data, contact us at <a href="mailto:privacy@thescroll.com" className="text-primary hover:underline">privacy@thescroll.com</a>.</p>
            </Section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="font-serif text-xl font-bold text-foreground mb-3">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </div>
);

export default Privacy;

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

          <div className="space-y-8">
            <Section title="1. Acceptance of Terms">
              <p>By accessing or using The Scroll, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform.</p>
            </Section>

            <Section title="2. Account Registration">
              <p>To access certain features, you must create an account. You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration and keep it up to date.</p>
              <p>You may register as either a Scribe (writer) or a Bannerman (reader). Each role has different permissions and capabilities within the platform.</p>
            </Section>

            <Section title="3. Content Guidelines">
              <p>You are solely responsible for the content you publish on The Scroll. Content must not violate any applicable laws, infringe on intellectual property rights, or contain harmful, harassing, or misleading material.</p>
              <p>We reserve the right to remove content that violates these guidelines and to suspend or terminate accounts of repeat offenders.</p>
            </Section>

            <Section title="4. Intellectual Property">
              <p>You retain full ownership of your content. By publishing on The Scroll, you grant us a non-exclusive, worldwide license to display, distribute, and promote your content within the platform. You can revoke this license at any time by deleting your content or account.</p>
            </Section>

            <Section title="5. Subscriptions & Payments">
              <p>Free accounts have access to core publishing features. Premium features may require a paid subscription. Subscription fees are non-refundable except as required by law. We may modify pricing with 30 days' notice.</p>
            </Section>

            <Section title="6. Alliances & Endorsements">
              <p>The alliance system allows writers to endorse one another. These endorsements are personal recommendations and do not imply any partnership, affiliation, or liability between allied writers or with The Scroll.</p>
            </Section>

            <Section title="7. Termination">
              <p>You may delete your account at any time. We may suspend or terminate your account if you violate these terms. Upon termination, your published content will be removed from the platform, but cached copies may persist temporarily.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>The Scroll is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to loss of content, data breaches beyond our reasonable control, or service interruptions.</p>
            </Section>

            <Section title="9. Changes to Terms">
              <p>We may update these terms from time to time. We will notify users of significant changes via email or platform notification. Continued use of The Scroll after changes constitutes acceptance of the updated terms.</p>
            </Section>

            <Section title="10. Contact">
              <p>For questions about these terms, contact us at <a href="mailto:legal@thescroll.com" className="text-primary hover:underline">legal@thescroll.com</a>.</p>
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

export default Terms;

<p align="center">
  <img src="public/favicon.svg" alt="The Scroll Logo" width="80" />
</p>

<h1 align="center">The Scroll</h1>

<p align="center">
  <strong>Fire & Blood — A sovereign publishing platform for writers who refuse to kneel.</strong>
</p>

<p align="center">
  <a href="https://the-scroll.lovable.app">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a>
</p>

---

## 📜 About

**The Scroll** is a modern, long-form publishing platform inspired by the world of *House of the Dragon*. It empowers writers — or *Scribes* — to publish essays, stories, and chronicles without algorithms, gatekeepers, or engagement bait.

No clout. No dopamine loops. Just fire and ink.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Scroll Editor** | Rich markdown editor for long-form content with live preview |
| **Alliance System** | Readers can pledge allegiance to their favorite Scribes |
| **Council Comments** | Thoughtful discourse under every published scroll |
| **Writer Profiles** | Personalized profiles with avatars, bios, and published works |
| **Topic Filtering** | Browse scrolls by tag, popularity, or recency |
| **Analytics Dashboard** | Track views, subscribers, and engagement metrics |
| **Community Board** | Testimonials and community-driven content |
| **Authentication** | Secure email-based signup and login |
| **Responsive Design** | Fully optimized for desktop, tablet, and mobile |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animation** | Framer Motion |
| **Routing** | React Router v6 |
| **State & Data** | TanStack React Query |
| **Backend** | Lovable Cloud (PostgreSQL, Auth, Storage, Edge Functions) |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd the-scroll

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🏗 Architecture

```
src/
├── components/          # Reusable UI components
│   └── ui/              # shadcn/ui primitives
├── contexts/            # React context providers (Auth)
├── hooks/               # Custom hooks
├── integrations/        # Backend client & types
├── lib/                 # Utilities & analytics
├── pages/               # Route-level page components
└── main.tsx             # Application entry point
```

---

## 🎨 Design System

The Scroll uses a custom **House of the Dragon**-inspired design system:

- **Typography**: Cinzel (headings) + Cormorant Garamond (body) + Inter (UI)
- **Palette**: Deep obsidian blacks, Targaryen crimson, aged bronze, and ember gold
- **Effects**: Dragon fire gradients, ember glow animations, Valyrian steel shimmers

All colors are defined as semantic HSL tokens in `src/index.css` and consumed via Tailwind utilities.

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  <sub>Built with 🔥 on <a href="https://lovable.dev">Lovable</a></sub>
</p>

<div align="center">

<img src="public/favicon.svg" alt="The Scroll" width="72" />

<h1>The Scroll</h1>

<p><em>A sovereign publishing platform for writers who refuse to kneel.</em></p>

[![Live](https://img.shields.io/badge/Live%20App-the--scroll.lovable.app-black?style=flat-square)](https://the-scroll.lovable.app)
[![React](https://img.shields.io/badge/React%2018-TypeScript-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](#license)

[Live Demo](https://the-scroll.lovable.app) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture)

</div>

---

## Overview

**The Scroll** is a modern long-form publishing platform for writers who value depth over virality. It gives *Scribes* — the writers on the platform — a clean, distraction-free space to publish essays, stories, and chronicles without algorithms, engagement bait, or gatekeepers.

> No clout. No dopamine loops. Just writing that matters.

---

## Features

| | Feature | Description |
|:---:|---|---|
| 📝 | **Scroll Editor** | Rich markdown editor with live preview, built for long-form writing |
| 🤝 | **Alliance System** | Readers pledge allegiance to Scribes — a meaningful alternative to follows |
| 💬 | **Council Comments** | Structured, thoughtful discussion under every published scroll |
| 👤 | **Writer Profiles** | Personalized profiles with avatar, bio, and full publication history |
| 🏷️ | **Topic Filtering** | Discover scrolls by tag, popularity, or recency |
| 📊 | **Analytics Dashboard** | Writers track views, subscribers, and engagement over time |
| 🏛️ | **Community Board** | Testimonials and community-driven content |
| 🔐 | **Authentication** | Secure email-based signup and login |
| 📱 | **Responsive Design** | Fully optimized across desktop, tablet, and mobile |

---

## Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React%2018-20232a?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white)

**Data & Forms**

![TanStack Query](https://img.shields.io/badge/TanStack%20Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square)

**Backend**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![Edge Functions](https://img.shields.io/badge/Edge%20Functions-000000?style=flat-square)
![Storage](https://img.shields.io/badge/Object%20Storage-4A90D9?style=flat-square)

---

## Getting Started

**Prerequisites:** Node.js v18+ with npm or bun.

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd the-scroll

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your backend credentials in .env

# 4. Start the development server
npm run dev
```

App runs at **http://localhost:5173**

---

## Architecture

```
src/
├── components/         # Shared UI components
│   └── ui/             # Base design system primitives (shadcn/ui)
├── contexts/           # Global state — Auth context
├── hooks/              # Custom React hooks
├── integrations/       # Backend client configuration & types
├── lib/                # Utilities, helpers, analytics
├── pages/              # Route-level page components
└── main.tsx            # App entry point
```

---

## Design System

The Scroll uses a custom dark visual identity built around the theme of ancient power and written legacy:

- **Typography** — `Cinzel` for headings · `Cormorant Garamond` for body text · `Inter` for UI
- **Palette** — Obsidian black · Targaryen crimson · Aged bronze · Ember gold
- **Motion** — Fire gradient transitions · Ember glow animations · Steel shimmer effects

Tokens are defined as semantic HSL variables in `src/index.css` and consumed via Tailwind utilities throughout the app.

---

## License

This project is proprietary. All rights reserved. Unauthorized use, copying, or distribution is not permitted.

---

<div align="center">
  <sub>© 2025 The Scroll — Built with 🔥</sub>
</div>

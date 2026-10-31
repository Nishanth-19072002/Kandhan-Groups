# 🏗️ Kandhan Groups — Landing Page & Digital Platform

A futuristic, high-performance landing page for **Kandhan Groups**, an end-to-end civil construction, industrial infrastructure, and Project Management Consultancy (PMC) firm.

Built with **Next.js 15 (App Router)**, **Tailwind CSS v4**, **Framer Motion**, **React Three Fiber (Three.js)**, and **Lenis** smooth scrolling.

---

## ✨ Key Features

1. **"The Blueprint Comes Alive" Intro Loader**:
   - Animated SVG blueprint lines draw out the Kandhan Groups building and logo mark, transitioning into the full experience.
2. **Interactive Site Engineer Guide Character**:
   - Custom vector SVG character with full skeletal/limb animation states (`walk`, `wave`, `pull`, `point`, `thumbs-up`).
   - Welcomes visitors, guides them through services, and hoists down the services site board with a rope-pull animation.
3. **Hero with 3D Holographic Wireframe Tower**:
   - Interactive 3D wireframe building built with React Three Fiber, mouse parallax, and scanning plane.
4. **Complete Services & Detailed Expertise**:
   - Industrial & Factory Civil Works, Residential Construction, Commercial Buildings, Painting & Finishing, Plumbing, Electrical, Renovation, Waterproofing, Interior Works.
   - Interactive domain tabs with custom AI-generated architectural and industrial concept visuals.
5. **PMC Model Visualization**:
   - Shows how Kandhan Groups manages specialist contractors with single-point contact and single consolidated billing.
6. **"Who Built This Website?" — Tech & Architecture Showcase**:
   - Dedicated showcase highlighting that Kandhan Groups also offers architectural design and custom software/website development solutions.
7. **Always-Accessible Floating Enquiry Widget**:
   - Persistent bottom-right floating avatar with periodic friendly speech nudges.
   - Opens a quick enquiry dialog capturing Name, Type of Work, Phone, Email, and Project Details.
8. **Instant WhatsApp + Email Enquiry Delivery (100% Free)**:
   - Serverless route (`/api/enquiry`) with rate limiting and honeypot spam protection.
   - Dispatches formatted emails via Gmail SMTP and instant WhatsApp messages via CallMeBot.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the site.

---

## ⚙️ Configuration & Customization

### 1. Company Information & Branding
All company details, phone numbers, email addresses, and services are centralized in a single file:
👉 [`lib/siteConfig.ts`](file:///c:/Users/user/Desktop/petty%20user%20mannual/personal/KandhanGroups/lib/siteConfig.ts)

- **Logo**: To add your official logo later, drop your image (e.g., `logo.png` or `logo.svg`) into `public/` and update `logo: "/logo.png"` in `lib/siteConfig.ts`. If `null`, an SVG monogram logo is rendered automatically.
- **Phone, Email, Service Area**: Update the `contact` object in `lib/siteConfig.ts`.

---

## 📬 Free WhatsApp & Email Notifications Setup

Create a `.env.local` file (and add these to your Vercel Project Settings > Environment Variables):

### A. Gmail Notifications (Free)
1. Go to your [Google Account](https://myaccount.google.com/) and enable **2-Step Verification**.
2. Go to **Security** → **App passwords** (or search "App passwords").
3. Create a new App Password named `KandhanGroups`. Copy the 16-character password generated.
4. Add to your `.env.local`:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ENQUIRY_TO_EMAIL=your_email@gmail.com
   ```

### B. WhatsApp Notifications via CallMeBot (Free)
1. Add the CallMeBot phone number to your phone contacts: `+34 644 44 20 84` (or check [callmebot.com](https://www.callmebot.com/blog/free-api-whatsapp-messages/)).
2. Send this exact message from your WhatsApp to that number:
   `I allow callmebot to send me messages`
3. You will receive an instant reply containing your personal API key (e.g. `123456`).
4. Add to your `.env.local`:
   ```env
   WHATSAPP_PHONE=919876543210 # Your WhatsApp number with country code, NO '+' or spaces
   CALLMEBOT_APIKEY=123456     # The API key received
   ```

---

## 🌐 Deploy to Vercel for Free

1. Push this repository to GitHub or GitLab:
   ```bash
   git add .
   git commit -m "feat: Kandhan Groups landing page"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New" → "Project"**.
3. Import your repository. Vercel automatically detects Next.js.
4. Expand **Environment Variables** and enter the 4 variables from `.env.local`:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `ENQUIRY_TO_EMAIL`
   - `WHATSAPP_PHONE`
   - `CALLMEBOT_APIKEY`
5. Click **Deploy**. Your website will be live worldwide in seconds on a free `*.vercel.app` domain with free SSL!


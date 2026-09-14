# 🏏 BidChat

BidChat is a full-stack real-time web application where Live IPL Mega Bidding meets Social Banter. Run highly realistic mock cricket auctions with your friends, manage franchise purses in real time, strategize in encrypted dugouts, and chat simultaneously—all in a beautiful, responsive interface.

## 🌟 Key Features

### 🔨 Live Auction Arena
* **Real-time Bidding:** Instant WebSocket-based bidding with zero latency.
* **Smart Bid Mechanics:** Automatic IPL-style paddle increments (e.g., +₹25L, +₹50L, +₹1Cr) and wallet validation.
* **Auctioneer Console (Admin):** Dedicated cockpit to call players, swing the hammer ("Sold!"), mark players unsold, and manage accelerated rounds with a single click.
* **Desktop Split-View:** On desktop, the live auction stage is elegantly pinned to the left column (with a live podium stream), leaving the right column for uninterrupted chat.
* **Accelerated Rounds:** Easily pull unsold players back into the pool at discounted base prices for the rapid-fire final rounds.

### 💬 Social & Chat
* **Group & Direct Messaging:** Real-time general chat rooms and 1:1 DMs.
* **Encrypted Franchise Dugouts:** Whisper secretly to your team owners without the rest of the lobby seeing your strategy.
* **Universal Profiles:** Click any user to view their stats, favorite franchise, bio, and auction history.
* **Rich Sharing:** Share custom tournament presets or player rosters directly in chat for one-click importing.

### 📊 Analytics & Roster Studio
* **Post-Auction Dashboard:** Track macro spending, remaining purses, and squad limits across all 10 franchises.
* **MVP Leaderboards:** 3-way Point System (Official ESPN MVP algorithm, Custom Match Impact Points, or Pure Financial Auction).
* **Roster Studio:** Create, modify, and manage custom lists of players, base prices, and tournament rules (e.g., max squad size, overseas limits, RTM rules).

## 🛠 Tech Stack

* **Frontend:** Next.js 15 (React 19), Tailwind CSS v4, Framer Motion, Lucide Icons, Radix UI.
* **Backend:** Custom Node.js server seamlessly wrapping Next.js to provide persistent WebSocket support.
* **Real-Time:** Socket.io & Socket.io-client.
* **Database & ORM:** PostgreSQL + Prisma ORM.
* **Authentication:** NextAuth.js (with bcrypt for credential hashing).
* **Styling:** Material Design 3 inspired UI, strict zero-gradient policy for clean, modern solid colors. Dark/Light mode support.

## 🚀 Getting Started

### Prerequisites
* Node.js (v20+ recommended)
* PostgreSQL database

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siddhant1607/bidchat.git
   cd bidchat-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/bidchat"
   NEXTAUTH_SECRET="your-secure-random-32-character-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the Database:**
   Push the Prisma schema to your database and generate the client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   > **Note:** We use `node server.js` to run the custom Next.js server with attached Socket.io. The app will be available at `http://localhost:3000`.

## 🚢 Deployment (Free Tier / $0 Budget)

Since BidChat relies on continuous WebSocket connections, it requires a persistent server environment (standard serverless Vercel will drop socket connections). 

**Recommended Free Stack:**
1. **Database:** [Neon.tech](https://neon.tech/) (Free PostgreSQL that does not expire).
2. **Hosting:** [Render.com](https://render.com/) (Free Web Service).
3. **Anti-Sleep:** [UptimeRobot](https://uptimerobot.com/) (Ping your Render URL every 10 mins to prevent cold starts).

**Deployment Steps:**
1. Get a Postgres URL from Neon.tech and add it to your Render environment variables as `DATABASE_URL`.
2. Connect your GitHub repository to a new Render Web Service.
3. Set the build command: `npm install && npx prisma generate && npx prisma db push && npm run build`
4. Set the start command: `node server.js`
5. Add `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `NODE_ENV=production` to your environment variables.
6. Deploy!

## 📜 License
Private / Proprietary.

---
*Built for the ultimate IPL Mock Auction experience.* 🏏

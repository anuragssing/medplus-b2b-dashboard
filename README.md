# bd-dashboard

## Requirements

- **Node.js 16 or later** (16, 18, or 20 LTS). The project is configured to run on Node 16 for broad compatibility. See **[NODE16.md](./NODE16.md)** for why the stack was changed and the trade-offs.

## How to open the app

1. **Start the dev server:**
   ```bash
   npm install
   npm run dev
   ```

2. **Open in your browser:**
   - **URL:** http://localhost:5173/

3. **First time:** You’ll see the **login** page. Sign in as **BD Admin** or **HR** to reach the dashboard.

## Scripts

- `npm run dev` – start dev server (app at http://localhost:5173/)
- `npm run build` – production build
- `npm run lint` – run ESLint
- `npm run preview` – preview production build

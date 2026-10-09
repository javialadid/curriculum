# Resume Portfolio with AI Chatbot

A modern, responsive resume/portfolio website built with Next.js, featuring an AI-powered chatbot that answers questions about your professional background. The main idea of the chatbot is to make the resume interactive, and allowing more in depth details for a user to explore, instead of cluttering the user interface with details.

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account
- A [Groq](https://groq.com) API key (for chatbot functionality)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required: Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Chatbot Configuration
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_GROQ_MODELNAME=openai/gpt-oss-20b
# Fallback suggestion for heavier workloads: openai/gpt-oss-120b
GROQ_REASONING_EFFORT=medium
NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES=15
CHATBOT_MAX_MESSAGE_LENGTH=400
CHATBOT_MAX_CONVERSATION_LENGTH=10000
CHATBOT_MAX_HISTORY_MESSAGES=6
CHATBOT_MAX_OUTPUT_TOKENS=1500
CHATBOT_RATE_LIMIT_PER_MINUTE=5
CHATBOT_RATE_LIMIT_PER_DAY=30
# Optional UI mirror of message length (defaults to 400)
# NEXT_PUBLIC_CHATBOT_MAX_MESSAGE_LENGTH=400

# Optional: durable rate limits via Upstash Redis REST (free tier)
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=

# Optional: Supabase Caching
SUPABASE_CACHE_DURATION_SECONDS=30

# Optional: Google Analytics 4
NEXT_PUBLIC_GA_ID=your_ga_measurement_id
```

### Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be fully initialized

2. **Database Setup**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Run the following SQL to create the required tables:

```sql
-- Create chatbot table for AI configuration
CREATE TABLE chatbot (
  id SERIAL PRIMARY KEY,
  bio TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resumes table for portfolio data
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  side_projects JSONB,
  photo TEXT,
  tag_line TEXT,
  current_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE chatbot ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous read access (for public portfolio)
CREATE POLICY "Allow anonymous read access on chatbot" ON chatbot FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access on resumes" ON resumes FOR SELECT USING (true);
```

3. **Insert Sample Data**
   - Add your chatbot configuration to the `chatbot` table
   - Add your resume data to the `resumes` table
   - To enable content versioning, apply `supabase/migrations/20261009000000_cv_versioning.sql` (adds a `version` column to both tables; see [CV content versions](#cv-content-versions))

4. **Prevent Supabase from Pausing (Free Tier)**
   - Supabase free tier databases pause after 7 days of inactivity
   - To prevent this, set up a cron job that pings your database daily
   - **For Vercel deployments**: Create a `vercel.json` file in your project root with:

     ```json
     {
       "crons": [
         {
           "path": "/api/health",
           "schedule": "0 12 * * *"
         }
       ]
     }
     ```

   - **For other deployment platforms**, create a similar cron job:
     - **Railway**: Use their cron job feature to call your `/api/health` endpoint daily
     - **Netlify**: Use a third-party cron service like cron-job.org to ping your health endpoint
     - **Other platforms**: Set up a scheduled task to call `https://yourdomain.com/api/health` daily

## Chatbot Configuration

### Enabling the Chatbot

The chatbot is automatically enabled when you provide a `GROQ_API_KEY` in your environment variables. Without this key, the chatbot button won't appear.

### Chatbot Settings

- **`GROQ_API_KEY`**: Your Groq API key for AI chat functionality
- **`NEXT_PUBLIC_GROQ_MODELNAME`**: AI model to use (default: `openai/gpt-oss-20b`; fallback suggestion: `openai/gpt-oss-120b`). Resolved server-side; client-supplied model values are ignored.
- **`GROQ_REASONING_EFFORT`**: Reasoning effort for `openai/gpt-oss*` models (default: `medium`; options: `low`, `medium`, `high`, `none`). Set to `none` or leave empty to omit the parameter. Ignored for non-gpt-oss models.
- **`NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES`**: Maximum messages per session, enforced server-side (default: 15)
- **`CHATBOT_MAX_MESSAGE_LENGTH`**: Maximum characters per user message (default: 400)
- **`CHATBOT_MAX_CONVERSATION_LENGTH`**: Maximum total characters for the prompt+history before truncation (default: 10000)
- **`CHATBOT_MAX_HISTORY_MESSAGES`**: Max prior user/assistant messages sent to the model (default: 6)
- **`CHATBOT_MAX_OUTPUT_TOKENS`**: Cap on model completion tokens (default: 1500). On gpt-oss models, reasoning tokens count toward this budget.
- **`CHATBOT_RATE_LIMIT_PER_MINUTE`**: Per-IP requests per minute (default: 5)
- **`CHATBOT_RATE_LIMIT_PER_DAY`**: Per-IP requests per day (default: 30)
- **`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`**: Optional. When both are set, rate limits use Upstash Redis REST (durable across serverless instances). Otherwise an in-memory limiter is used (best-effort per instance).

### Chatbot Data Setup

The chatbot uses data from two sources, loaded **only on the server**:

1. **Bio & Prompt** (from `chatbot` table):
   - `bio`: General information about yourself
   - `prompt`: Custom instructions for the AI assistant
   - Never sent to the browser

2. **Resume Context** (from `resumes` table):
   - Professional experience, education, skills, and projects
   - Optional logistics fields (`open_to_remote`, `open_to_relocation`, `availability`, `languages`) — leave empty until filled in
   - Sensitive identifiers are excluded from the model context

### Security Features

- **Server-side system prompt**: Bio, custom prompt, and resume context are assembled on the server. The client sends only the new message and a short user/assistant history.
- **Rate limiting**: Per-IP minute/day limits and per-session message caps (in-memory by default; optional Upstash Redis)
- **Message / output caps**: Configurable max message length, history window, and `max_tokens`
- **Input sanitization**: HTML/script tags are removed
- **AI disclosure**: The UI labels the bot as an AI assistant; the prompt requires truthful answers if asked
- **Origin check**: Explicit Origin/Host match in addition to Next.js server-action CSRF protection

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [slug]/            # Dynamic resume pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chatbot/          # Chatbot components
│   ├── resume/           # Resume display components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── chatbot-actions.ts # Server actions for chatbot
│   └── supabase.ts       # Supabase client configuration
└── types/                # TypeScript type definitions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Features

- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatic theme switching
- **AI Chatbot**: Powered by Groq's fast inference API with configurable message limits and automatic conversation management
- **SEO Optimized**: Server-side rendering with Next.js
- **Type Safe**: Full TypeScript implementation
- **Modern UI**: Built with Tailwind CSS
- **Analytics Integration**: Optional Google Analytics 4 for tracking user interactions like theme toggles and chatbot usage

## CV content versions

Resume and chatbot content is versioned in the database. Each row in `resumes` and `chatbot` has a `version` value (`v1`, `v2`, ...); `resumes` is unique on `(slug, version)` and `chatbot` on `version`. Older versions are never modified, so switching versions loses no data.

- **`CV_VERSION`** (server-only, optional): the content version to serve, matching `v<1-3 digits>` (case-insensitive). Unset or invalid values use the code default, **`v2`**. Do not use a `NEXT_PUBLIC_` prefix.
- If no row exists for the selected version, the site and chatbot fall back to `v1`, so a missing version never breaks the page.
- Cache entries are per version, so versions never serve each other's cached data.

**Preview a version without touching production:** in Vercel → Project → Settings → Environment Variables, set `CV_VERSION` (e.g. `v1` or `v3`) for the **Preview** environment only (optionally scoped to one branch) and redeploy that preview. Production keeps its own value.

**Roll back:**
- Fastest: use Vercel **Instant Rollback** to the previous production deployment.
- Or set `CV_VERSION=v1` for **Production** and redeploy (environment variable changes only apply to new deployments).

**Add a new version:** copy the current rows with a new `version` (e.g. `insert into resumes (...) select ... , 'v3' from resumes where version = 'v2'`), edit the copy, preview it with a Preview-only `CV_VERSION`, then switch Production.

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard

2. **Environment Variables**
   - Set all required environment variables in Vercel's project settings
   - The chatbot will only work if `GROQ_API_KEY` is provided
   - Set `NEXT_PUBLIC_GA_ID` for optional analytics tracking

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Your resume will be live at `your-project.vercel.app`

### Other Platforms

This is a standard Next.js application that can be deployed to any platform supporting Node.js:

- **Netlify**: Use `npm run build` and deploy the `.next` folder
- **Railway**: Connect your GitHub repo and set environment variables
- **DigitalOcean App Platform**: Use the Node.js buildpack

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add your feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

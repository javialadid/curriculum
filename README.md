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
NEXT_PUBLIC_GROQ_MODELNAME=llama-3.3-70b-versatile
NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES=20

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

## Chatbot Configuration

### Enabling the Chatbot

The chatbot is automatically enabled when you provide a `GROQ_API_KEY` in your environment variables. Without this key, the chatbot button won't appear.

### Chatbot Settings

- **`GROQ_API_KEY`**: Your Groq API key for AI chat functionality
- **`NEXT_PUBLIC_GROQ_MODELNAME`**: AI model to use (default: `llama-3.3-70b-versatile`)
- **`NEXT_PUBLIC_CHATBOT_MAX_EXCHANGES`**: Maximum number of AI responses per conversation (default: 20)

### Chatbot Data Setup

The chatbot uses data from two sources:

1. **Bio & Prompt** (from `chatbot` table):
   - `bio`: General information about yourself
   - `prompt`: Custom instructions for the AI assistant

2. **Resume Context** (from `resumes` table):
   - Automatically includes your professional experience, education, skills, and projects
   - Sensitive data (name, photo URL) is excluded for privacy

### Security Features

The chatbot includes several security measures:

- **Rate Limiting**: 1-second delay between messages
- **Message Length Limits**: 1000 characters maximum per message
- **Input Sanitization**: HTML/script tags are automatically removed
- **Conversation Limits**: Maximum 20 exchanges per conversation (configurable)
- **Privacy Protection**: Personal identifiers excluded from AI context

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
- **AI Chatbot**: Powered by Groq's fast inference API
- **SEO Optimized**: Server-side rendering with Next.js
- **Type Safe**: Full TypeScript implementation
- **Modern UI**: Built with Tailwind CSS
- **Analytics Integration**: Optional Google Analytics 4 for tracking user interactions like theme toggles and chatbot usage

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

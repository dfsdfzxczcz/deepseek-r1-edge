# EdgeOne Pages AI: Utilize DeepSeek R1 for free at the edge.

Utilize DeepSeek R1 in edge functions with integrated web search capabilities.

The search functionality utilizes [searxng](https://github.com/searxng/searxng) and is encapsulated via [EdgeOne Pages functions](https://edgeone.ai/document/162227908259442688).

After deployment, the interface ensures a consistent experience with OpenAI and seamlessly integrates with other third-party tools.

## Deploy

[![Deploy with EdgeOne Pages](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?from=github&template=deepseek-r1-edge)

Live Example: [https://deepseek-r1-edge.edgeone.app](https://deepseek-r1-edge.edgeone.app)

More Templates: [EdgeOne Pages](https://edgeone.ai/pages/templates)

## Getting Started

First, run the development server:

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Medical Research Literature Aggregator

This project now includes a comprehensive medical literature aggregator that automatically fetches and filters high-impact research papers from PubMed and other databases.

### Features

- **12 Research Categories**: GBD, NSQIP, Trauma, Transplant, Neuroimaging, Single-cell, Microbiome, Pathogen Genomics, Joint Replacement, Rare Diseases, Medical Imaging, GWAS
- **Multi-database Integration**: PubMed, OpenAlex (impact factors)
- **Smart Filtering**: Automatic filtering by impact factor (IF ≥ 10)
- **Daily Automation**: Scheduled cron jobs for daily updates
- **Email Notifications**: Daily digest of new high-impact papers
- **Bilingual Support**: Chinese and English search queries

### Quick Start

1. **Access the Literature Aggregator**:
   - Navigate to `/literature` on your deployed app
   - Or locally: http://localhost:3000/literature

2. **Configure Environment** (optional):
   ```bash
   cp .env.example .env.local
   ```

   Add your settings:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   CRON_SECRET=your-secret-token
   RESEND_API_KEY=re_xxxxxxxxxxxxx  # For email notifications
   NOTIFICATION_EMAIL=your-email@example.com
   ```

3. **Test the API**:
   ```bash
   # Fetch articles from all categories (last 24 hours)
   curl "http://localhost:3000/api/literature/fetch?days=1&minIF=10"

   # Fetch specific category
   curl "http://localhost:3000/api/literature/fetch?category=gbd&days=7"
   ```

4. **Set up Daily Automation**:
   - The cron job is configured in `vercel.json` to run daily at 9 AM UTC
   - Deploys automatically with Vercel
   - For other platforms, see [documentation](docs/LITERATURE_AGGREGATOR.md)

### Documentation

For detailed setup, configuration, and usage instructions, see:
- **[Literature Aggregator Documentation](docs/LITERATURE_AGGREGATOR.md)**

### API Endpoints

- `GET /api/literature/fetch` - Fetch and filter articles
- `GET /api/literature/pubmed` - PubMed search integration
- `GET /api/literature/impact-factor` - Impact factor lookup
- `GET /api/cron/daily-fetch` - Daily scheduled task

### Research Categories

1. Global Burden of Disease (GBD/GHE/GHDx)
2. Surgical Quality Improvement (ACS-NSQIP)
3. Trauma Database (NTDB/TQIP)
4. Transplant Registry (OPTN/SRTR)
5. Neuroimaging (ADNI/OpenNeuro)
6. Single-cell & Spatial Transcriptome Atlas
7. Microbiome (HMP)
8. Pathogen Genome Surveillance (GISAID)
9. Joint Replacement Registry (AJRR/NJR)
10. Rare Disease (Orphanet)
11. Medical Imaging Archive (TCIA)
12. GWAS/PheWAS Portal

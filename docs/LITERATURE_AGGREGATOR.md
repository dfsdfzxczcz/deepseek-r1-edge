# Medical Research Literature Aggregator

## Overview

An automated system for aggregating high-impact medical research literature from multiple databases including PubMed, Web of Science, and Google Scholar. The system filters articles by impact factor (default: IF ≥ 10) and sends daily email notifications.

## Features

### 12 Research Categories

1. **Global Burden of Disease (GBD)** - DALY/YLL/YLD trends, risk attribution
2. **Surgical Quality Improvement (NSQIP)** - Perioperative outcomes
3. **Trauma Database (NTDB/TQIP)** - Trauma outcomes and benchmarks
4. **Transplant Registry (SRTR/OPTN)** - Organ transplant outcomes
5. **Neuroimaging (ADNI/OpenNeuro)** - Brain imaging biomarkers
6. **Single-cell Atlas** - Cell transcriptomics and spatial genomics
7. **Microbiome (HMP)** - Gut/skin/oral microbiome studies
8. **Pathogen Genomics (GISAID)** - Viral variants and surveillance
9. **Joint Replacement (AJRR/NJR)** - Orthopedic registry outcomes
10. **Rare Diseases (Orphanet)** - Rare disease research
11. **Medical Imaging (TCIA)** - Radiomics and imaging datasets
12. **GWAS/PheWAS** - Genetic association studies

### Core Capabilities

- **Multi-database Integration**: PubMed (via E-utilities API), OpenAlex (for impact factors)
- **Smart Filtering**: Automatic filtering by impact factor threshold
- **Daily Automation**: Scheduled cron jobs for daily literature updates
- **Email Notifications**: Digest emails of new high-impact papers
- **Web Interface**: Browse, search, and filter articles by category
- **Bilingual Support**: Chinese and English search queries

## Architecture

```
Medical Literature Aggregator
│
├── Frontend (/app/literature/page.tsx)
│   └── React UI for browsing articles
│
├── API Routes
│   ├── /api/literature/pubmed - PubMed search integration
│   ├── /api/literature/impact-factor - OpenAlex impact factor lookup
│   ├── /api/literature/fetch - Combined search + filtering
│   └── /api/cron/daily-fetch - Daily scheduled task
│
├── Data Layer
│   ├── Research category definitions
│   └── Article storage (configurable: KV/Postgres/MongoDB)
│
└── External Services
    ├── NCBI PubMed E-utilities
    ├── OpenAlex API
    └── Email service (Resend/SMTP)
```

## Setup

### 1. Install Dependencies

The system uses Next.js built-in features and doesn't require additional packages for basic functionality. Optional packages for enhanced features:

```bash
# For XML parsing (recommended for production)
npm install fast-xml-parser

# For email notifications (choose one)
npm install resend  # Recommended
# or
npm install nodemailer

# For database (choose based on your preference)
npm install @vercel/kv  # Vercel KV (Redis)
# or
npm install @vercel/postgres  # Vercel Postgres
# or
npm install mongodb  # MongoDB
# or
npm install @supabase/supabase-js  # Supabase
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```env
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Recommended for production
CRON_SECRET=your-secret-token

# Optional (for email notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxx
NOTIFICATION_EMAIL=your-email@example.com
```

### 3. Deploy Cron Job

The system uses Vercel Cron Jobs (defined in `vercel.json`):

```json
{
  "crons": [{
    "path": "/api/cron/daily-fetch",
    "schedule": "0 9 * * *"
  }]
}
```

This runs daily at 9:00 AM UTC. To change the schedule, modify the cron expression.

**Alternative Cron Setup Options:**

1. **GitHub Actions** (if not using Vercel):

Create `.github/workflows/daily-fetch.yml`:

```yaml
name: Daily Literature Fetch

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger fetch
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/daily-fetch
```

2. **External Cron Service**:
   - Use cron-job.org, EasyCron, or similar
   - Configure to call: `POST https://your-domain.com/api/cron/daily-fetch`
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

### 4. Test the System

#### Manual Search (Web UI)

1. Start development server: `npm run dev`
2. Navigate to: http://localhost:3000/literature
3. Select category and click "Search"

#### Test API Directly

```bash
# Fetch articles from all categories (last 24 hours)
curl "http://localhost:3000/api/literature/fetch?days=1&minIF=10"

# Fetch specific category
curl "http://localhost:3000/api/literature/fetch?category=gbd&days=7"

# Test cron endpoint
curl "http://localhost:3000/api/cron/daily-fetch"
```

## Usage

### Web Interface

1. **Access**: Navigate to `/literature` on your deployed app
2. **Search**: Select category, time range, and minimum IF
3. **View Results**: Browse articles with abstracts, metrics, and links
4. **Export**: Click article links to view on PubMed, DOI, or PMC

### API Endpoints

#### Fetch Articles

```
GET /api/literature/fetch
```

**Query Parameters:**
- `category` (string, optional): Category ID (e.g., "gbd", "nsqip")
- `days` (number, default: 1): Look back period in days
- `minIF` (number, default: 10): Minimum impact factor
- `notify` (boolean, default: false): Send email notification

**Response:**
```json
{
  "success": true,
  "count": 15,
  "totalFetched": 45,
  "minIF": 10,
  "articles": [...]
}
```

#### PubMed Search

```
GET /api/literature/pubmed?category=gbd&days=1
```

Returns raw PubMed results without IF filtering.

#### Impact Factor Lookup

```
GET /api/literature/impact-factor?journal=Nature
POST /api/literature/impact-factor
Body: [{ "journal": "Nature" }, { "journal": "Science" }]
```

## Email Notifications

### Using Resend (Recommended)

1. Sign up at https://resend.com
2. Add API key to `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   NOTIFICATION_EMAIL=your-email@example.com
   ```

3. Implement in `/app/api/literature/fetch/route.ts`:

```typescript
import { Resend } from 'resend';

async function sendEmailNotification(articles: Article[]): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailHtml = `
    <h2>Daily Medical Literature Digest</h2>
    <p>Found ${articles.length} high-impact articles:</p>
    <ul>
      ${articles.map(a => `
        <li>
          <strong>${a.title}</strong><br/>
          ${a.journal} (IF: ${a.impactFactor})<br/>
          <a href="https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/">View on PubMed</a>
        </li>
      `).join('')}
    </ul>
  `;

  await resend.emails.send({
    from: 'Literature <noreply@yourdomain.com>',
    to: process.env.NOTIFICATION_EMAIL!,
    subject: `Daily Literature Digest: ${articles.length} New Articles`,
    html: emailHtml
  });
}
```

### Using SMTP

Configure SMTP settings in `.env.local` and use Nodemailer:

```typescript
import nodemailer from 'nodemailer';

async function sendEmailNotification(articles: Article[]): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    subject: `Daily Literature Digest: ${articles.length} New Articles`,
    html: emailHtml
  });
}
```

## Database Integration

### Option 1: Vercel KV (Redis) - Recommended for Quick Setup

```typescript
import { kv } from '@vercel/kv';

async function storeArticles(articles: Article[]): Promise<void> {
  const key = `articles:${new Date().toISOString().split('T')[0]}`;
  await kv.set(key, articles);
  await kv.expire(key, 60 * 60 * 24 * 30); // 30 days TTL
}

async function getArticles(date?: string): Promise<Article[]> {
  const key = `articles:${date || new Date().toISOString().split('T')[0]}`;
  return (await kv.get(key)) || [];
}
```

### Option 2: Vercel Postgres

Create schema:

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  pmid VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors JSONB,
  journal VARCHAR(255),
  pub_date VARCHAR(50),
  abstract TEXT,
  doi VARCHAR(255),
  pmcid VARCHAR(50),
  category_id VARCHAR(50),
  impact_factor DECIMAL(5,2),
  citation_count INTEGER,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category ON articles(category_id);
CREATE INDEX idx_impact_factor ON articles(impact_factor DESC);
CREATE INDEX idx_fetched_at ON articles(fetched_at DESC);
```

### Option 3: MongoDB

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('literature');
const articlesCollection = db.collection('articles');

async function storeArticles(articles: Article[]): Promise<void> {
  await articlesCollection.insertMany(articles, { ordered: false });
}
```

## Customization

### Adding New Research Categories

Edit `/lib/research-categories.ts`:

```typescript
export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  // ... existing categories
  {
    id: 'your-category-id',
    name: 'Your Category Name',
    nameCN: '中文名称',
    description: 'English description',
    descriptionCN: '中文描述',
    pubmedQuery: '(your[tiab] AND query[tiab])',
    cnkiQuery: '("中文" AND "检索词")',
    databases: ['Database1', 'Database2'],
    keywords: ['keyword1', 'keyword2']
  }
];
```

### Adjusting Impact Factor Threshold

In `/lib/research-categories.ts`:

```typescript
export const MIN_IMPACT_FACTOR = 15.0; // Change from 10 to 15
```

Or dynamically in API calls:

```bash
curl "http://localhost:3000/api/literature/fetch?minIF=15"
```

### Changing Fetch Schedule

Edit `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/daily-fetch",
    "schedule": "0 6,18 * * *"  // Runs at 6 AM and 6 PM
  }]
}
```

Cron expression format: `minute hour day month weekday`

Examples:
- `0 9 * * *` - Daily at 9 AM
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1-5` - Weekdays at 9 AM
- `0 0 * * 0` - Sundays at midnight

## Performance Optimization

### Rate Limiting

APIs have rate limits:
- PubMed: 3 requests/second without API key, 10 req/s with key
- OpenAlex: No strict limit, but be polite (100ms delay recommended)

Current implementation includes automatic rate limiting:

```typescript
// Between PubMed batches: 500ms
await new Promise(resolve => setTimeout(resolve, 500));

// Between OpenAlex requests: 100ms
await new Promise(resolve => setTimeout(resolve, 100));
```

### Caching

Implement caching to reduce API calls:

```typescript
// Cache journal impact factors (they don't change frequently)
const ifCache = new Map<string, number>();

async function getCachedImpactFactor(journal: string): Promise<number | undefined> {
  if (ifCache.has(journal)) {
    return ifCache.get(journal);
  }

  const metrics = await getJournalMetrics(journal);
  if (metrics?.impactFactor) {
    ifCache.set(journal, metrics.impactFactor);
  }

  return metrics?.impactFactor;
}
```

### Parallel Processing

Process categories in parallel for faster results:

```typescript
const results = await Promise.all(
  categoriesToSearch.map(category => searchCategory(category))
);
```

## Troubleshooting

### Common Issues

1. **PubMed API returns no results**
   - Check query syntax in research-categories.ts
   - Verify date range is valid
   - Check PubMed directly: https://pubmed.ncbi.nlm.nih.gov

2. **Impact factors missing**
   - OpenAlex may not have all journals
   - Try alternative: Crossref, Scopus, or manual IF database

3. **Cron job not running**
   - Verify vercel.json is committed
   - Check Vercel dashboard → Cron Jobs
   - Ensure CRON_SECRET is set correctly

4. **Email notifications not sent**
   - Verify API keys in .env.local
   - Check email service logs
   - Test email endpoint manually

### Debug Mode

Enable detailed logging:

```typescript
// In /app/api/literature/fetch/route.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Query:', category.pubmedQuery);
  console.log('Results:', articles.length);
  console.log('IF filtering:', filteredArticles.length);
}
```

## API Rate Limits & Best Practices

### PubMed E-utilities

- **Without API Key**: 3 requests/second
- **With API Key**: 10 requests/second
- **Get API Key**: https://www.ncbi.nlm.nih.gov/account/

Add to `.env.local`:
```env
NCBI_API_KEY=your-api-key
```

### OpenAlex

- No strict rate limit
- Polite pool: Include email in User-Agent
- Recommended: 100ms between requests

## Future Enhancements

Potential improvements:

1. **Additional Databases**
   - Web of Science API integration
   - Google Scholar scraping (with caution)
   - Scopus API
   - Europe PMC

2. **Advanced Filtering**
   - Citation velocity (citations/month)
   - Altmetric scores
   - Author H-index
   - Journal quartile (Q1/Q2/Q3/Q4)

3. **Machine Learning**
   - Relevance scoring
   - Automatic categorization
   - Personalized recommendations

4. **User Features**
   - User accounts and preferences
   - Saved searches
   - Reading lists
   - Collaborative filtering

5. **Analytics**
   - Trending topics
   - Research landscape visualization
   - Citation network analysis

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation:
   - PubMed: https://www.ncbi.nlm.nih.gov/books/NBK25501/
   - OpenAlex: https://docs.openalex.org/
3. Open an issue on GitHub

## License

MIT License - See LICENSE file for details

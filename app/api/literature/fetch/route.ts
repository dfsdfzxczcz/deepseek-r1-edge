/**
 * Main Literature Fetcher API
 * Combines PubMed search with impact factor filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { MIN_IMPACT_FACTOR } from '@/lib/research-categories';

interface Article {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  abstract: string;
  doi?: string;
  pmcid?: string;
  categoryId: string;
  impactFactor?: number;
  citationCount?: number;
  fetchedAt: string;
}

/**
 * Fetch articles from PubMed
 */
async function fetchFromPubMed(category?: string, days: number = 1): Promise<Article[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = new URL('/api/literature/pubmed', baseUrl);

    if (category) {
      url.searchParams.set('category', category);
    }
    url.searchParams.set('days', days.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error('Failed to fetch from PubMed');
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('PubMed fetch error:', error);
    return [];
  }
}

/**
 * Enrich articles with impact factors
 */
async function enrichWithImpactFactors(articles: Article[]): Promise<Article[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = new URL('/api/literature/impact-factor', baseUrl);

    // Prepare batch request
    const journalRequests = articles.map(article => ({
      journal: article.journal,
      doi: article.doi
    }));

    // Remove duplicates by journal name
    const uniqueJournals = Array.from(
      new Map(journalRequests.map(j => [j.journal, j])).values()
    );

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uniqueJournals)
    });

    if (!response.ok) {
      console.warn('Impact factor enrichment failed');
      return articles;
    }

    const { data: impactFactors } = await response.json();

    // Create a map of journal -> impact factor
    const ifMap = new Map(
      impactFactors.map((if: any) => [if.journal, if.impactFactor])
    );

    // Enrich articles
    return articles.map(article => ({
      ...article,
      impactFactor: ifMap.get(article.journal),
      fetchedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Impact factor enrichment error:', error);
    return articles.map(article => ({
      ...article,
      fetchedAt: new Date().toISOString()
    }));
  }
}

/**
 * Filter articles by minimum impact factor
 */
function filterByImpactFactor(articles: Article[], minIF: number = MIN_IMPACT_FACTOR): Article[] {
  return articles.filter(article => {
    // Include if impact factor is above threshold OR if we don't have IF data yet
    return !article.impactFactor || article.impactFactor >= minIF;
  });
}

/**
 * Store articles in database (using JSON file for now)
 */
async function storeArticles(articles: Article[]): Promise<void> {
  try {
    // In production, this would use a real database
    // For now, we'll just log the count
    console.log(`Would store ${articles.length} articles in database`);

    // TODO: Implement actual database storage
    // Options:
    // 1. Vercel KV (Redis)
    // 2. Vercel Postgres
    // 3. MongoDB Atlas
    // 4. Supabase
  } catch (error) {
    console.error('Article storage error:', error);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(articles: Article[]): Promise<void> {
  try {
    // In production, use a service like SendGrid, Resend, or Nodemailer
    console.log(`Would send email notification for ${articles.length} new articles`);

    // TODO: Implement email sending
    // Example with Resend:
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

  } catch (error) {
    console.error('Email notification error:', error);
  }
}

/**
 * GET /api/literature/fetch
 * Query parameters:
 * - category: Category ID (optional)
 * - days: Number of days to look back (default: 1)
 * - minIF: Minimum impact factor (default: 10)
 * - notify: Send email notification (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const days = parseInt(searchParams.get('days') || '1');
    const minIF = parseFloat(searchParams.get('minIF') || MIN_IMPACT_FACTOR.toString());
    const notify = searchParams.get('notify') === 'true';

    console.log('Fetching articles from PubMed...');
    let articles = await fetchFromPubMed(category, days);
    console.log(`Found ${articles.length} articles from PubMed`);

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new articles found',
        count: 0,
        articles: []
      });
    }

    console.log('Enriching with impact factors...');
    articles = await enrichWithImpactFactors(articles);

    console.log('Filtering by impact factor...');
    const filteredArticles = filterByImpactFactor(articles, minIF);
    console.log(`${filteredArticles.length} articles meet IF threshold (>= ${minIF})`);

    // Store articles
    await storeArticles(filteredArticles);

    // Send notification if requested
    if (notify && filteredArticles.length > 0) {
      await sendEmailNotification(filteredArticles);
    }

    return NextResponse.json({
      success: true,
      count: filteredArticles.length,
      totalFetched: articles.length,
      minIF,
      articles: filteredArticles
    });

  } catch (error) {
    console.error('Literature fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch literature' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/literature/fetch
 * Trigger a manual fetch (for testing or manual runs)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * PubMed API Integration
 * Fetches articles from NCBI PubMed using E-utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { RESEARCH_CATEGORIES } from '@/lib/research-categories';

// NCBI E-utilities base URL
const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  abstract: string;
  doi?: string;
  pmcid?: string;
  impactFactor?: number;
  categoryId: string;
}

/**
 * Search PubMed using E-utilities
 */
async function searchPubMed(query: string, days: number = 1, maxResults: number = 100): Promise<string[]> {
  try {
    // Build the date range (last N days)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const dateFilter = `${fromDate.getFullYear()}/${String(fromDate.getMonth() + 1).padStart(2, '0')}/${String(fromDate.getDate()).padStart(2, '0')}:${toDate.getFullYear()}/${String(toDate.getMonth() + 1).padStart(2, '0')}/${String(toDate.getDate()).padStart(2, '0')}[PDAT]`;

    const fullQuery = `${query} AND ${dateFilter}`;

    // ESearch - get PMIDs
    const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(fullQuery)}&retmax=${maxResults}&retmode=json&sort=pub+date`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MedicalResearchAggregator/1.0 (mailto:research@example.com)'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`PubMed search failed: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];

    return pmids;
  } catch (error) {
    console.error('PubMed search error:', error);
    return [];
  }
}

/**
 * Fetch article details using E-utilities
 */
async function fetchArticleDetails(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  try {
    // EFetch - get article details
    const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;

    const fetchResponse = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'MedicalResearchAggregator/1.0 (mailto:research@example.com)'
      }
    });

    if (!fetchResponse.ok) {
      throw new Error(`PubMed fetch failed: ${fetchResponse.statusText}`);
    }

    const xmlData = await fetchResponse.text();

    // Parse XML (basic parsing - in production, use a proper XML parser)
    const articles = parseArticlesFromXML(xmlData);

    return articles;
  } catch (error) {
    console.error('PubMed fetch error:', error);
    return [];
  }
}

/**
 * Parse articles from PubMed XML
 * Note: This is a simplified parser. For production, use a proper XML parsing library like 'fast-xml-parser'
 */
function parseArticlesFromXML(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];

  // Simple regex-based extraction (replace with proper XML parser in production)
  const articleMatches = xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g);

  for (const match of articleMatches) {
    const articleXml = match[1];

    // Extract PMID
    const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    const pmid = pmidMatch ? pmidMatch[1] : '';

    // Extract title
    const titleMatch = articleXml.match(/<ArticleTitle>(.*?)<\/ArticleTitle>/s);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : '';

    // Extract journal
    const journalMatch = articleXml.match(/<Title>(.*?)<\/Title>/);
    const journal = journalMatch ? journalMatch[1] : '';

    // Extract publication date
    const yearMatch = articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
    const monthMatch = articleXml.match(/<PubDate>[\s\S]*?<Month>(\w+)<\/Month>/);
    const pubDate = yearMatch ? `${yearMatch[1]}${monthMatch ? ' ' + monthMatch[1] : ''}` : '';

    // Extract authors
    const authors: string[] = [];
    const authorMatches = articleXml.matchAll(/<Author[^>]*>[\s\S]*?<LastName>(.*?)<\/LastName>[\s\S]*?<ForeName>(.*?)<\/ForeName>/g);
    for (const authorMatch of authorMatches) {
      authors.push(`${authorMatch[2]} ${authorMatch[1]}`);
    }

    // Extract abstract
    const abstractMatch = articleXml.match(/<Abstract>([\s\S]*?)<\/Abstract>/);
    let abstract = '';
    if (abstractMatch) {
      const abstractTextMatches = abstractMatch[1].matchAll(/<AbstractText[^>]*>(.*?)<\/AbstractText>/gs);
      const abstractParts: string[] = [];
      for (const textMatch of abstractTextMatches) {
        abstractParts.push(textMatch[1].replace(/<[^>]+>/g, ''));
      }
      abstract = abstractParts.join(' ');
    }

    // Extract DOI
    const doiMatch = articleXml.match(/<ArticleId IdType="doi">(.*?)<\/ArticleId>/);
    const doi = doiMatch ? doiMatch[1] : undefined;

    // Extract PMCID
    const pmcMatch = articleXml.match(/<ArticleId IdType="pmc">(.*?)<\/ArticleId>/);
    const pmcid = pmcMatch ? pmcMatch[1] : undefined;

    if (pmid && title) {
      articles.push({
        pmid,
        title,
        authors,
        journal,
        pubDate,
        abstract,
        doi,
        pmcid,
        categoryId: ''
      });
    }
  }

  return articles;
}

/**
 * GET /api/literature/pubmed
 * Query parameters:
 * - category: Category ID (optional, searches all if not specified)
 * - days: Number of days to look back (default: 1)
 * - maxResults: Maximum results per category (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category');
    const days = parseInt(searchParams.get('days') || '1');
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    const allArticles: PubMedArticle[] = [];

    // Determine which categories to search
    const categoriesToSearch = categoryId
      ? RESEARCH_CATEGORIES.filter(c => c.id === categoryId)
      : RESEARCH_CATEGORIES;

    // Search each category
    for (const category of categoriesToSearch) {
      console.log(`Searching PubMed for category: ${category.name}`);

      const pmids = await searchPubMed(category.pubmedQuery, days, maxResults);

      if (pmids.length > 0) {
        // Fetch details in batches (PubMed allows up to 200 IDs per request)
        const batchSize = 200;
        for (let i = 0; i < pmids.length; i += batchSize) {
          const batch = pmids.slice(i, i + batchSize);
          const articles = await fetchArticleDetails(batch);

          // Add category ID to each article
          articles.forEach(article => {
            article.categoryId = category.id;
          });

          allArticles.push(...articles);

          // Rate limiting - wait 0.5s between batches
          if (i + batchSize < pmids.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      // Rate limiting between categories
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      count: allArticles.length,
      articles: allArticles
    });

  } catch (error) {
    console.error('PubMed API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch from PubMed' },
      { status: 500 }
    );
  }
}

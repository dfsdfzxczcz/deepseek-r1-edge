/**
 * Impact Factor API Integration
 * Uses OpenAlex to retrieve journal impact factors and citation metrics
 */

import { NextRequest, NextResponse } from 'next/server';

const OPENALEX_API = 'https://api.openalex.org';

interface ImpactFactorData {
  journal: string;
  issn?: string;
  impactFactor?: number;
  citationCount?: number;
  hIndex?: number;
  i10Index?: number;
  source: string;
}

/**
 * Search for journal information on OpenAlex
 */
async function getJournalMetrics(journalName: string, issn?: string): Promise<ImpactFactorData | null> {
  try {
    let searchQuery = '';

    if (issn) {
      // Search by ISSN (more accurate)
      searchQuery = `issn:${issn}`;
    } else {
      // Search by journal name
      searchQuery = `display_name.search:${encodeURIComponent(journalName)}`;
    }

    const url = `${OPENALEX_API}/sources?filter=${searchQuery}&per-page=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MedicalResearchAggregator/1.0 (mailto:research@example.com)'
      }
    });

    if (!response.ok) {
      console.warn(`OpenAlex search failed for ${journalName}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const source = data.results[0];

      // Calculate approximate impact factor from citation metrics
      // OpenAlex doesn't provide IF directly, but we can use 2-year mean citedness as proxy
      const impactFactor = source.summary_stats?.['2yr_mean_citedness'] ||
                          source.cited_by_count / Math.max(source.works_count || 1, 1);

      return {
        journal: source.display_name,
        issn: source.issn?.[0],
        impactFactor: impactFactor ? parseFloat(impactFactor.toFixed(2)) : undefined,
        citationCount: source.cited_by_count,
        hIndex: source.summary_stats?.h_index,
        i10Index: source.summary_stats?.i10_index,
        source: 'OpenAlex'
      };
    }

    return null;
  } catch (error) {
    console.error('OpenAlex API error:', error);
    return null;
  }
}

/**
 * Get article-level metrics using DOI
 */
async function getArticleMetrics(doi: string): Promise<{ citationCount?: number }> {
  try {
    const url = `${OPENALEX_API}/works/doi:${doi}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MedicalResearchAggregator/1.0 (mailto:research@example.com)'
      }
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();

    return {
      citationCount: data.cited_by_count
    };
  } catch (error) {
    console.error('OpenAlex article metrics error:', error);
    return {};
  }
}

/**
 * Batch process journals/articles for impact factors
 */
async function batchGetImpactFactors(
  items: Array<{ journal: string; doi?: string; issn?: string }>
): Promise<ImpactFactorData[]> {
  const results: ImpactFactorData[] = [];

  for (const item of items) {
    const metrics = await getJournalMetrics(item.journal, item.issn);

    if (metrics) {
      // If we have a DOI, also get article-level metrics
      if (item.doi) {
        const articleMetrics = await getArticleMetrics(item.doi);
        if (articleMetrics.citationCount !== undefined) {
          metrics.citationCount = articleMetrics.citationCount;
        }
      }

      results.push(metrics);
    }

    // Rate limiting - OpenAlex allows 10 requests/second for polite pool
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * GET /api/literature/impact-factor
 * Query parameters:
 * - journal: Journal name (required)
 * - issn: Journal ISSN (optional)
 * - doi: Article DOI (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const journal = searchParams.get('journal');
    const issn = searchParams.get('issn') || undefined;
    const doi = searchParams.get('doi') || undefined;

    if (!journal) {
      return NextResponse.json(
        { success: false, error: 'Journal name is required' },
        { status: 400 }
      );
    }

    const metrics = await getJournalMetrics(journal, issn);

    if (!metrics) {
      return NextResponse.json({
        success: false,
        message: 'Journal not found in OpenAlex'
      });
    }

    // Get article-level metrics if DOI provided
    if (doi) {
      const articleMetrics = await getArticleMetrics(doi);
      if (articleMetrics.citationCount !== undefined) {
        metrics.citationCount = articleMetrics.citationCount;
      }
    }

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Impact factor API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve impact factor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/literature/impact-factor
 * Batch process multiple journals/articles
 * Body: Array of { journal: string, issn?: string, doi?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Request body must be an array' },
        { status: 400 }
      );
    }

    const results = await batchGetImpactFactors(body);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Batch impact factor API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve impact factors' },
      { status: 500 }
    );
  }
}

export { getJournalMetrics, getArticleMetrics, batchGetImpactFactors };

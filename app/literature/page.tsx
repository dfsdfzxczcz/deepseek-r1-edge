'use client';

import React, { useState, useEffect } from 'react';
import { RESEARCH_CATEGORIES, MIN_IMPACT_FACTOR } from '@/lib/research-categories';

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
  fetchedAt?: string;
}

export default function LiteraturePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [days, setDays] = useState<number>(1);
  const [minIF, setMinIF] = useState<number>(MIN_IMPACT_FACTOR);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({ count: 0, totalFetched: 0 });

  const fetchArticles = async () => {
    setLoading(true);
    setError('');

    try {
      const url = new URL('/api/literature/fetch', window.location.origin);

      if (selectedCategory !== 'all') {
        url.searchParams.set('category', selectedCategory);
      }
      url.searchParams.set('days', days.toString());
      url.searchParams.set('minIF', minIF.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();

      setArticles(data.articles || []);
      setStats({
        count: data.count || 0,
        totalFetched: data.totalFetched || 0
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = RESEARCH_CATEGORIES.find(c => c.id === categoryId);
    return category ? `${category.name} / ${category.nameCN}` : categoryId;
  };

  const getCategoryBadgeColor = (categoryId: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800',
      'bg-cyan-100 text-cyan-800',
      'bg-lime-100 text-lime-800',
      'bg-fuchsia-100 text-fuchsia-800'
    ];

    const index = RESEARCH_CATEGORIES.findIndex(c => c.id === categoryId);
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Medical Research Literature Aggregator
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Automated aggregation of high-impact medical literature from PubMed, Web of Science, and Google Scholar
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Search Parameters</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {RESEARCH_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Days Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range (days)
              </label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            {/* Min IF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Impact Factor
              </label>
              <input
                type="number"
                value={minIF}
                onChange={(e) => setMinIF(parseFloat(e.target.value))}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fetch Button */}
            <div className="flex items-end">
              <button
                onClick={fetchArticles}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Fetching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats.count > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Found <strong>{stats.count}</strong> articles with IF ≥ {minIF}
                (out of {stats.totalFetched} total articles)
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Fetching articles from PubMed...</p>
            </div>
          )}

          {!loading && articles.length === 0 && stats.count === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click &quot;Search&quot; to fetch the latest high-impact literature
              </p>
            </div>
          )}

          {articles.map((article) => (
            <div key={article.pmid} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              {/* Category Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(article.categoryId)}`}>
                  {getCategoryName(article.categoryId)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  {article.title}
                </a>
              </h3>

              {/* Authors */}
              <p className="text-sm text-gray-600 mb-2">
                {article.authors.slice(0, 5).join(', ')}
                {article.authors.length > 5 && ` et al.`}
              </p>

              {/* Journal and Metrics */}
              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
                <span className="font-medium text-gray-900">{article.journal}</span>
                <span className="text-gray-500">{article.pubDate}</span>
                {article.impactFactor && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                    IF: {article.impactFactor.toFixed(2)}
                  </span>
                )}
                {article.citationCount !== undefined && (
                  <span className="text-gray-600">
                    Citations: {article.citationCount}
                  </span>
                )}
              </div>

              {/* Abstract */}
              {article.abstract && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {article.abstract}
                </p>
              )}

              {/* Links */}
              <div className="flex gap-3 text-sm">
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  PubMed
                </a>
                {article.doi && (
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    DOI
                  </a>
                )}
                {article.pmcid && (
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmcid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Full Text (PMC)
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Info Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Research Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RESEARCH_CATEGORIES.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{category.nameCN}</p>
                <p className="text-xs text-gray-500">{category.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {category.keywords.slice(0, 3).map((keyword) => (
                    <span key={keyword} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

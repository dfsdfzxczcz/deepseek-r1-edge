from flask import Flask, render_template, request
from src.query_builder import build_query, QUERY_TEMPLATES
from src.pubmed_client import search_articles, fetch_summaries
from src.utils import is_high_impact

app = Flask(__name__)

@app.route('/')
def index():
    """
    Renders the main search page.
    """
    # Pass the available article types to the template for the dropdown
    article_types = list(QUERY_TEMPLATES.keys())
    return render_template('index.html', article_types=article_types)

@app.route('/search', methods=['POST'])
def search():
    """
    Handles the search form submission, fetches data from PubMed,
    and displays the results.
    """
    # Get form data
    article_type = request.form.get('article_type')
    disease = request.form.get('disease')
    year = request.form.get('year')

    # Ensure year is an integer
    try:
        year = int(year)
    except (ValueError, TypeError):
        year = 2021 # Default to a safe value

    # 1. Build the query
    query = build_query(article_type, disease, year_min=year)

    # 2. Search for articles
    pmids = search_articles(query)

    # 3. Fetch summaries
    summaries = fetch_summaries(pmids)

    # 4. Filter for high-impact papers
    high_impact_papers = [paper for paper in summaries if is_high_impact(paper)]

    # 5. Render the results page
    return render_template(
        'results.html',
        papers=high_impact_papers,
        count=len(high_impact_papers),
        query=f"{article_type} on '{disease}' since {year}"
    )

if __name__ == '__main__':
    app.run(debug=True, port=5001)
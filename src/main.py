import sys
from datetime import datetime

# Adjust path to allow for relative imports
sys.path.append('.')

from src.query_builder import build_query
from src.pubmed_client import search_articles, fetch_summaries
from src.utils import is_high_impact

def main():
    """
    Main function to run the bioinformatics paper search.
    """
    # --- Search Parameters ---
    # You can easily change these to search for different topics.
    ARTICLE_TYPE = "Prognostic Model"
    DISEASE = "hepatocellular carcinoma"
    MIN_YEAR = 2021

    print("--------------------------------------------------")
    print(f"🔬 Starting search for high-impact papers...")
    print(f"   Type:    {ARTICLE_TYPE}")
    print(f"   Disease: {DISEASE}")
    print(f"   Since:   {MIN_YEAR}")
    print("--------------------------------------------------\n")

    # 1. Build the query
    query = build_query(ARTICLE_TYPE, DISEASE, year_min=MIN_YEAR)
    if not query:
        print("❌ Could not build the query. Exiting.")
        return

    # For transparency, show the user the generated query
    # print(f"Generated PubMed Query:\n{query}\n")

    # 2. Search for articles on PubMed
    pmids = search_articles(query)
    if not pmids:
        print("No articles found for the given query.")
        return

    # 3. Fetch detailed summaries for the found PMIDs
    summaries = fetch_summaries(pmids)
    if not summaries:
        print("Could not fetch summaries for the found PMIDs.")
        return

    # 4. Filter for high-impact journals
    print("\n🔎 Filtering for high-impact journals...")
    high_impact_papers = [
        paper for paper in summaries if is_high_impact(paper)
    ]

    # 5. Print the results
    print(f"\n✅ Found {len(high_impact_papers)} high-impact papers!\n")

    if high_impact_papers:
        print("--- Top Results ---")
        for i, paper in enumerate(high_impact_papers, 1):
            title = paper.get('title', 'No Title')
            journal = paper.get('fulljournalname', 'No Journal')
            pub_date = paper.get('pubdate', 'No Date')
            pmid = paper.get('uid', '')

            print(f"{i}. 📄 {title}")
            print(f"   - 📓 Journal: {journal}")
            print(f"   - 🗓️  Date:    {pub_date}")
            print(f"   - 🔗 Link:    https://pubmed.ncbi.nlm.nih.gov/{pmid}/\n")
    else:
        print("No papers found in the specified high-impact journals for this query.")
        print("Consider broadening your search or updating the journal list in `config.py`.")

if __name__ == "__main__":
    main()
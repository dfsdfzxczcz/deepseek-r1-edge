import requests
import time

BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
API_KEY = None  # It's better to have an API key for higher rate limits

def search_articles(query: str, max_retries: int = 3, delay: int = 1) -> list[str]:
    """
    Searches PubMed for articles matching the query and returns a list of PMIDs.
    """
    search_url = f"{BASE_URL}esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": "1000",  # Get up to 1000 PMIDs
    }
    if API_KEY:
        params["api_key"] = API_KEY

    for attempt in range(max_retries):
        try:
            response = requests.get(search_url, params=params, timeout=15)
            response.raise_for_status()  # Raise an exception for bad status codes
            data = response.json()
            pmids = data.get("esearchresult", {}).get("idlist", [])
            print(f"Found {len(pmids)} articles for query.")
            return pmids
        except requests.exceptions.RequestException as e:
            print(f"Error searching PubMed (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(delay)
            else:
                return []
    return []

def fetch_summaries(pmids: list[str], max_retries: int = 3, delay: int = 1) -> list[dict]:
    """
    Fetches summaries for a list of PMIDs.
    """
    if not pmids:
        return []

    summary_url = f"{BASE_URL}esummary.fcgi"
    # Fetch summaries in batches to avoid overly long URLs
    batch_size = 200
    all_summaries = []

    for i in range(0, len(pmids), batch_size):
        batch_pmids = pmids[i:i+batch_size]
        params = {
            "db": "pubmed",
            "id": ",".join(batch_pmids),
            "retmode": "json",
        }
        if API_KEY:
            params["api_key"] = API_KEY

        for attempt in range(max_retries):
            try:
                response = requests.get(summary_url, params=params, timeout=15)
                response.raise_for_status()
                data = response.json()
                result = data.get("result", {})

                # The structure of the result is a bit tricky, it's a dict of uids
                summaries = [result[uid] for uid in result if uid != "uids"]
                all_summaries.extend(summaries)
                break # Success, break from retry loop
            except requests.exceptions.RequestException as e:
                print(f"Error fetching summaries (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(delay)
                else:
                    # Failed after all retries for this batch
                    break

        # Be nice to the API
        if len(pmids) > batch_size:
            time.sleep(0.5)

    print(f"Successfully fetched {len(all_summaries)} summaries.")
    return all_summaries
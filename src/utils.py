from .config import HIGH_IMPACT_JOURNALS

def is_high_impact(article_summary: dict) -> bool:
    """
    Checks if an article was published in a high-impact journal.

    Args:
        article_summary: A dictionary representing the article's summary from PubMed.

    Returns:
        True if the journal is in the HIGH_IMPACT_JOURNALS set, False otherwise.
    """
    journal_name = article_summary.get("fulljournalname", "").lower()
    if not journal_name:
        return False

    return journal_name in HIGH_IMPACT_JOURNALS
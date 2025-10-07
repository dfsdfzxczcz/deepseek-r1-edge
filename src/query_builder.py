# A mapping from a simplified article type to a detailed PubMed query chunk.
# Based on the user's provided "超详细的检索策略与关键词".
QUERY_TEMPLATES = {
    "Differential Expression": {
        "core": "(differentially expressed genes OR DEGs)",
        "db": "AND (TCGA OR GEO OR ArrayExpress)",
        "expand": "AND (bioinformatic* OR computational) AND (hub genes OR key pathways)"
    },
    "WGCNA": {
        "core": "(WGCNA OR \"weighted gene co-expression\")",
        "expand": "AND (key module OR hub gene OR co-expression network)"
    },
    "ceRNA Network": {
        "core": "(ceRNA OR \"competing endogenous RNA\")",
        "expand": "AND (lncRNA OR circRNA) AND (network OR axis OR sponge)"
    },
    "Prognostic Model": {
        "core": "((prognostic OR predictive) AND (signature OR model))",
        "db": "AND (TCGA OR GEO)",
        "expand": "AND (LASSO OR \"machine learning\") AND (survival OR prognosis) AND (nomogram OR risk score)"
    },
    "Molecular Subtyping": {
        "core": "(\"molecular subtype\" OR classification OR clustering)",
        "db": "AND (TCGA OR ICGC)",
        "expand": "AND (unsupervised OR \"consensus clustering\")"
    },
    "Immune Infiltration": {
        "core": "(\"immune infiltration\" OR \"tumor microenvironment\" OR TME)",
        "expand": "AND (CIBERSORT OR ESTIMATE OR ssGSEA) AND (immunotherapy OR \"checkpoint inhibitor\")"
    },
    "Single-cell": {
        "core": "(\"single-cell\" OR scRNA-seq)",
        "expand": "AND (heterogeneity OR trajectory OR \"cell communication\" OR atlas)"
    },
    "Mendelian Randomization": {
        "core": "(\"Mendelian randomization\" OR MR)",
        "expand": "AND (causal OR causality OR \"instrumental variable\")"
    },
    "GBD Burden & Trends": {
        "core": "(\"burden of disease\" OR incidence OR prevalence OR mortality OR DALYs)",
        "source": "AND (\"Global Burden of Disease Study\" OR GBD)",
        "expand": "AND (trends OR patterns OR epidemiology)"
    },
    "GBD Risk Factors": {
        "core": "(\"risk factors\" OR attributable OR contribution)",
        "source": "AND (GBD)",
    }
}

def build_query(article_type: str, disease: str, year_min: int = 2020) -> str | None:
    """
    Builds a PubMed search query from a template and specific keywords.

    Args:
        article_type: A key from QUERY_TEMPLATES.
        disease: The disease to search for (e.g., "lung cancer").
        year_min: The minimum publication year.

    Returns:
        A formatted PubMed query string, or None if the article type is not found.
    """
    template = QUERY_TEMPLATES.get(article_type)
    if not template:
        print(f"Error: Article type '{article_type}' not found in templates.")
        return None

    # Base of the query is the core concept and the disease
    query = f"({template['core']}) AND (\"{disease}\"[Title/Abstract])"

    # Add other parts of the template if they exist
    if "db" in template:
        query += f" {template['db']}"
    if "source" in template:
        query += f" {template['source']}"
    if "expand" in template:
        query += f" {template['expand']}"

    # Add date range to focus on recent, high-value papers
    query += f" AND (\"{year_min}\"[Date - Publication] : \"3000\"[Date - Publication])"

    return query
# High-Impact Bioinformatics Paper Scraper

This script automates the process of finding recent, high-impact bioinformatics papers from PubMed based on predefined search categories.

## Features

- **Advanced Search**: Uses detailed, structured queries to find papers on specific bioinformatics topics (e.g., Prognostic Models, WGCNA, Immune Infiltration).
- **High-Impact Filtering**: Filters results to include only papers published in a configurable list of top-tier journals.
- **Customizable**: Easy to change the search topic (article type, disease) and the list of high-impact journals.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    It is recommended to use a virtual environment.
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

## How to Run

1.  **Configure your search (Optional):**
    Open `src/main.py` and modify the `ARTICLE_TYPE`, `DISEASE`, and `MIN_YEAR` variables to define your search.

2.  **Run the script:**
    ```bash
    python src/main.py
    ```

The script will print the search progress and a list of the final, filtered high-impact papers to the console.

## Customization

-   **To add new search categories:** Open `src/query_builder.py` and add a new entry to the `QUERY_TEMPLATES` dictionary following the existing format.
-   **To modify the high-impact journal list:** Open `src/config.py` and add or remove journal names from the `HIGH_IMPACT_JOURNALS` set. Make sure to use lowercase for the journal names.
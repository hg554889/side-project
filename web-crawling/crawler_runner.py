from typing import List
from crawlers.base_crawler import logger

def run_crawler_sync(sites: List[str], keywords: List[str]):
    logger.info(f"Crawling sites: {sites} with keywords: {keywords}")
    # This is a placeholder for the actual crawling logic
    # We will implement this later
    return {"status": "crawling started", "sites": sites, "keywords": keywords}

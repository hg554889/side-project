import asyncio
import itertools
from typing import List, Dict, Any

from crawlers.saramin_crawler import SaraminCrawler
from crawlers.comento_crawler import ComentoCrawler
from crawlers.worknet_crawler import WorknetCrawler
from crawlers.securityfarm_crawler import SecurityfarmCrawler
from processors.data_normalizer import DataNormalizer
from database.mongodb_connector import mongodb_connector
from utils.logger import setup_logger

logger = setup_logger("crawler_runner")


async def run_crawlers(sites: List[str], keywords: List[str]) -> List[Dict[str, Any]]:
    """
    Run crawlers for the given sites and keywords in parallel.
    """
    tasks = []
    total_jobs = []

    crawler_map = {
        "saramin": SaraminCrawler,
        "comento": ComentoCrawler,
        "worknet": WorknetCrawler,
        "securityfarm": SecurityfarmCrawler,
    }

    crawlers = {site: crawler_map[site]() for site in sites if site in crawler_map}

    for keyword in keywords:
        for site, crawler in crawlers.items():
            tasks.append(crawler.crawl_with_keyword(keyword))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    for result in results:
        if isinstance(result, list):
            total_jobs.extend(result)
        elif isinstance(result, Exception):
            logger.error(f"Crawler failed with exception: {result}")

    # Close the drivers after all crawling is done
    for crawler in crawlers.values():
        crawler.close_driver()

    logger.info(f"Total {len(total_jobs)} jobs crawled.")
    return total_jobs


async def main():
    """
    Main function to run the crawlers and send data to the server.
    """
    sites_to_crawl = ["saramin", "comento", "worknet", "securityfarm"]
    keywords_to_search = [""]

    logger.info(f"Starting crawl for sites: {sites_to_crawl} and keywords: {keywords_to_search}")

    crawled_jobs = await run_crawlers(sites_to_crawl, keywords_to_search)

    if crawled_jobs:
        logger.info(f"{len(crawled_jobs)}개의 원본 데이터를 정규화합니다...")
        normalizer = DataNormalizer()
        normalized_jobs = [await normalizer.normalize(job) for job in crawled_jobs]
        
        logger.info("Sending normalized jobs to the server...")
        await mongodb_connector.send_jobs_to_server(normalized_jobs)
    else:
        logger.info("No jobs were crawled.")


if __name__ == "__main__":
    asyncio.run(main())
from pydantic import BaseModel
from typing import List

class CrawlRequest(BaseModel):
    sites: List[str]
    keywords: List[str]

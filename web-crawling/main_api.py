from fastapi import FastAPI
from api_models import CrawlRequest
from crawler_runner import run_crawler_sync

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/crawl")
def crawl_sites(request: CrawlRequest):
    results = run_crawler_sync(request.sites, request.keywords)
    return results
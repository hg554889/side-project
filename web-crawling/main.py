import asyncio
import argparse
# from curses import raw
import json
import time
from typing import Dict, List, Any
from crawlers.saramin_crawler import SaraminCrawler
# from crawlers.worknet_crawler import WorknetCrawler
# from crawlers.comento_crawler import ComentoCrawler
# from crawlers.securityfarm_crawler import SecurityfarmCrawler
from processors.data_normalizer import DataNormalizer
from database.mongo_client import mongo_client
from utils.logger import setup_logger

logger = setup_logger()

class CrawlingManager:
    def __init__(self):
        try:
            self.crawlers = {
                'saramin': SaraminCrawler(),
                # 'worknet': WorknetCrawler(),
                # 'comento': ComentoCrawler(),
                # 'securityfarm': SecurityfarmCrawler(),
            }
            self.normalizer = DataNormalizer()
            logger.info("CrawlingManager 초기화 완료")
        except Exception as e:
            logger.error(f"CrawlingManager 초기화 실패: {e}")
            raise
        
    def _init_results(self) -> Dict[str, Any]:
        return {
            'sites': {},
            'total': {
                'crawled': 0,
                'processed': 0,
                'saved': 0,
                'errors': 0
            },
        }
        
    def _update_results(self, results: Dict, site_name: str, site_result: Dict):
        """결과 업데이트"""
        results['sites'][site_name] = site_result
        results['total']['crawled'] += site_result.get('crawled', 0)
        results['total']['processed'] += site_result.get('processed', 0)
        results['total']['saved'] += site_result.get('saved', 0)
    
    async def crawl_all(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """모든 사이트 크롤링"""
        logger.info("통합 크롤링 시작...")
        results = self._init_results()
        
        sites = options.get('sites', ['saramin'])
            
        for site_name in sites:
            if site_name not in self.crawlers:
                logger.warning(f"지원하지 않는 사이트: {site_name}")
                continue
                
            try:
                logger.info(f"{site_name} 크롤링 시작...")
                crawler = self.crawlers[site_name]
                raw_jobs = await crawler.crawl(options)
                
                processed_jobs = []
                for raw_job in raw_jobs:
                    try:
                        normalized_job = await self.normalizer.normalize(raw_job)
                        if normalized_job.get('quality_score', 0) >= 0.1:
                            processed_jobs.append(normalized_job)
                    except Exception as e:
                        logger.warning(f"데이터 처리 실패: {e}")
                        results['total']['errors'] += 1
                saved_count = await self.save_jobs(processed_jobs)
            
                site_result = {
                    'crawled': len(raw_jobs),
                    'processed': len(processed_jobs),
                    'saved': saved_count
                }
                self._update_results(results, site_name, site_result)
                logger.info(f"{site_name}: {saved_count}개 저장 완료")
            
            except Exception as e:
                logger.error(f"통합 크롤링 실패: {e}")
                results['sites'][site_name] = {'error': str(e)}
                results['total']['errors'] += 1
            
        logger.info(f"통합 크롤링 완료! 총 {results['total']['saved']}개 저장됨")
        return results
    
    # #async def _crawl_site(self, site_name: str, options: Dict, results: Dict):
    #     """개별 사이트 크롤링"""
    #     try:
    #         crawler = self.crawlers[site_name]
    #         raw_jobs = await crawler.crawl(options)
            
    #         processed_jobs = []
    #         async for raw_job in asyncio.as_completed([
    #             self.normalizer.normalize(job) for job in raw_jobs
    #         ]):
    #             try:
    #                 if raw_job.get('quality_score', 0) >= 0.5:
    #                     processed_jobs.append(raw_job)
    #             except Exception as e:
    #                 logger.warning(f"데이터 처리 실패: {e}")
    #                 results['total']['errors'] += 1
            
    #         saved_count = await self.save_jobs(processed_jobs)
            
    #         self._update_results(results, site_name, {
    #             'crawled': len(raw_jobs),
    #             'processed': len(processed_jobs),
    #             'saved': saved_count
    #         })
            
    #     except Exception as e:
    #         logger.error(f"{site_name} 크롤링 실패: {e}")
    #         results['total']['errors'] += 1
    
    async def save_jobs(self, jobs: List[Dict[str, Any]]) -> int:
        """채용공고 MongoDB에 저장"""
        if not jobs:
            return 0
        
        try:
            collection = mongo_client.get_collection('job_postings')
            saved_count = 0
            
            # 각 작업을 순차적으로 처리
            for job in jobs:
                try:
                    # id가 없으면 임시로 생성
                    if 'id' not in job:
                        import hashlib
                        job_id = f"{job.get('title', '')}-{job.get('company', '')}"
                        job['id'] = hashlib.md5(job_id.encode()).hexdigest()
                    # Upsert (있으면 업데이트, 없으면 삽입)
                    result = await collection.update_one(
                        {'id': job['id']},  # 중복 확인 키
                        {'$set': job},      # 업데이트할 데이터
                        upsert=True         # 없으면 삽입
                    )
                    
                    # 실제로 저장/업데이트되었는지 확인
                    if result.upserted_id or result.modified_count > 0:
                        saved_count += 1
                        
                except Exception as e:
                    logger.warning(f"개별 채용공고 저장 실패: {e}")
                    continue  # 개별 실패시 다음 작업 계속
            
            logger.info(f"MongoDB 저장 완료: {saved_count}/{len(jobs)}")
            return saved_count
            
        except Exception as e:
            logger.error(f"MongoDB 저장 실패: {e}")
            return 0

    
    # async def _cleanup_crawlers(self):
    #     """크롤러 정리"""
    #     for crawler in self.crawlers.values():
    #         try:
    #             await crawler.close()
    #         except Exception as e:
    #             logger.warning(f"크롤러 정리 실패: {e}")

    async def get_system_health(self) -> Dict[str, Any]:
        """시스템 상태 확인"""
        try:
            collection = mongo_client.get_collection('job_postings')
            
            # 기본 통계
            total_jobs = collection.count_documents({})
            recent_jobs = collection.count_documents({
                'scraped_at': {'$gte': time.time() - 86400}  # 최근 24시간
            })
            
            # 품질 통계
            quality_pipeline = [
                {
                    '$group': {
                        '_id': None,
                        'avg_quality': {'$avg': '$quality_score'},
                        'low_quality_count': {
                            '$sum': {
                                '$cond': [{'$lt': ['$quality_score', 0.5]}, 1, 0]
                            }
                        }
                    }
                }
            ]
            
            quality_stats = list(collection.aggregate(quality_pipeline))
            quality_data = quality_stats[0] if quality_stats else {}
            
            return {
                'database': {
                    'status': 'healthy',
                    'total_jobs': total_jobs,
                    'recent_jobs': recent_jobs
                },
                'data_quality': {
                    'average_score': round(quality_data.get('avg_quality', 0), 3),
                    'low_quality_count': quality_data.get('low_quality_count', 0)
                }
            }
            
        except Exception as e:
            logger.error(f"시스템 상태 확인 실패: {e}")
            return {
                'database': {'status': 'error', 'error': str(e)},
                'data_quality': {'average_score': 0, 'low_quality_count': 0}
            }

async def main():
    """메인 실행 함수"""
    parser = argparse.ArgumentParser(description='SkillMap 크롤링 시스템')
    parser.add_argument('--sites', default='saramin', help='크롤링할 사이트')
    parser.add_argument('--keyword', default='React', help='검색 키워드')
    parser.add_argument('--category', default='IT/개발', help='직군 카테고리')
    parser.add_argument('--experience', default='신입', help='경험 수준')
    parser.add_argument('--max-jobs', type=int, default=50, help='최대 채용공고 수')
    parser.add_argument('--output', help='결과를 JSON 파일로 저장')
    
    args = parser.parse_args()
    
    manager = CrawlingManager()
    
    options = {
        'sites': args.sites.split(','),
        'keyword': args.keyword,
        'category': args.category,
        'experience_level': args.experience,
        'max_jobs': args.max_jobs
    }
    
    try:
        results = await manager.crawl_all(options)
        
        print(f"\n크롤링 결과:")
        print(f"  총 크롤링: {results['total']['crawled']}개")
        print(f"  처리완료: {results['total']['processed']}개")
        print(f"  저장완료: {results['total']['saved']}개")
        print(f"  오류발생: {results['total']['errors']}개")
        
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            print(f"\n결과가 {args.output}에 저장되었습니다.")
        
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단됨")
    except Exception as e:
        logger.error(f"크롤링 실행 실패: {e}")
    finally:
        mongo_client.close()

if __name__ == '__main__':
    asyncio.run(main())
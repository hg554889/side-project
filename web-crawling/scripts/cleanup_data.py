import asyncio
import sys
import os
from tqdm.asyncio import tqdm

# 프로젝트 루트를 경로에 추가하여 다른 폴더의 모듈을 임포트할 수 있도록 함
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.mongo_client import mongo_client
from processors.data_normalizer import DataNormalizer
from utils.logger import setup_logger

logger = setup_logger("data_cleanup")

async def cleanup_existing_data():
    """
    데이터베이스에서 모든 기존 채용 공고를 가져와 정규화하고,
    다시 데이터베이스에 업데이트합니다.
    """
    if mongo_client.db is None:
        logger.error("MongoDB에 연결되어 있지 않습니다.")
        return

    db = mongo_client.db
    collection = db.job_postings
    normalizer = DataNormalizer()

    try:
        total_docs = await collection.count_documents({})
        if total_docs == 0:
            logger.info("정리할 문서가 없습니다.")
            return

        logger.info(f"{total_docs}개의 기존 문서를 정규화합니다. 프로세스를 시작합니다...")

        updated_count = 0
        failed_count = 0

        # tqdm을 사용하여 진행률 표시줄을 추가
        cursor = collection.find({})
        async for doc in tqdm(cursor, total=total_docs, desc="데이터 정제 중"):
            try:
                original_id = doc['_id']
                
                # 정규화 함수는 딕셔너리에 대해 작동합니다.
                normalized_doc = await normalizer.normalize(doc)

                # 원본 _id를 사용하여 문서를 업데이트합니다.
                await collection.replace_one({'_id': original_id}, normalized_doc)
                updated_count += 1
            except Exception as e:
                logger.error(f"문서 처리 실패 {doc.get('_id')}: {e}")
                failed_count += 1
        
        logger.info("--- 데이터 정제 완료 ---")
        logger.info(f"성공적으로 업데이트된 문서: {updated_count}개")
        logger.info(f"업데이트 실패한 문서: {failed_count}개")

    finally:
        mongo_client.close()
        logger.info("MongoDB 연결이 종료되었습니다.")

if __name__ == "__main__":
    logger.info("데이터 정제 스크립트를 시작합니다...")
    if mongo_client.client is not None:
        asyncio.run(cleanup_existing_data())
        logger.info("데이터 정제 스크립트가 종료되었습니다.")
    else:
        logger.error("MongoDB 연결 실패로 스크립트를 실행할 수 없습니다.")

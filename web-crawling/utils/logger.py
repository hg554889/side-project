from loguru import logger
import sys
from pathlib import Path

def setup_logger():
    # 로그 디렉토리 생성
    log_dir = Path(__file__).parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # 기존 핸들러 제거
    logger.remove()
    
    # 콘솔 로그
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    
    # 파일 로그
    logger.add(
        log_dir / "crawler.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
        rotation="10 MB",
        retention="30 days"
    )
    
    return logger
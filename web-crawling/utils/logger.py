from loguru import logger
import sys
from pathlib import Path

def setup_logger(name: str = "crawler"):
    """로거 설정
    
    Args:
        name (str): 로거 이름 (기본값: "crawler")
    
    Returns:
        Logger: 설정된 로거 객체
    """
    # 로그 디렉토리 생성
    log_dir = Path(__file__).parent.parent / 'logs'
    log_dir.mkdir(exist_ok=True)
    
    # 기존 핸들러 제거
    logger.remove()
    
    # 콘솔 출력 포맷 설정
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    
    # 콘솔 핸들러 추가
    logger.add(
        sys.stderr,
        format=log_format,
        level="INFO",
        enqueue=True,
    )
    
    # 파일 핸들러 추가
    logger.add(
        f"logs/{name}.log",
        format=log_format,
        level="DEBUG",
        rotation="500 MB",
        compression="zip",
        enqueue=True,
    )
    
    return logger.bind(name=name)
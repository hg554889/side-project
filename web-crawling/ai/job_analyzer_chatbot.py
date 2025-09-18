import os
import json
import asyncio
from typing import List, Dict
from dotenv import load_dotenv
import google.generativeai as genai
import google.api_core.exceptions
from utils.logger import setup_logger

logger = setup_logger("job_analyzer_chatbot")

load_dotenv()

class JobAnalyzerChatbot:
    def __init__(self):
        self.ai_model = None
        self.setup_gemini()

    def setup_gemini(self):
        """Gemini AI 설정"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            logger.warning("GEMINI_API_KEY가 없습니다. AI 기능이 비활성화됩니다.")
            self.ai_model = None
            return
            
        try:
            genai.configure(api_key=api_key)
            self.ai_model = genai.GenerativeModel('gemini-2.0-flash-exp')
            logger.info("Gemini AI 초기화 완료")
        except Exception as e:
            logger.error(f"Gemini AI 초기화 실패: {e}")
            self.ai_model = None

    async def analyze_job_postings(self, job_postings: List[Dict]) -> str:
        """
        채용 공고 데이터를 분석하여 구조화된 보고서 형태로 반환합니다.
        """
        if not self.ai_model:
            logger.error("Gemini AI 모델이 초기화되지 않았습니다. 분석을 수행할 수 없습니다.")
            return "Gemini AI 모델이 초기화되지 않았습니다."

        if not job_postings:
            return "분석할 채용 공고 데이터가 없습니다."

        # 채용 공고 데이터를 텍스트로 요약
        summarized_jobs = []
        for i, job in enumerate(job_postings):
            summary = f"""
--- 채용 공고 {i+1} ---
회사명: {job.get('company_name', 'N/A')}
직무명: {job.get('job_title', 'N/A')}
채용구분: {job.get('experience', 'N/A')}
근무지역: {job.get('work_location', 'N/A')}
주요업무: {job.get('description', 'N/A')}
자격요건: {job.get('requirements', 'N/A')}
우대사항: {job.get('preferences', 'N/A')}
"""
            summarized_jobs.append(summary)

        # 사용자 제공 프롬프트
        prompt = f"""
당신은 채용 공고 데이터 분석 전문가 입니다. 아래 단계에 따라 분석하십시오.

## 1. 기본 구조화
- 회사명, 직무명, 채용구분(신입/주니어/무관), 근무지역 정리  
- 주요업무 / 자격요건 / 우대사항을 명확히 구분  

## 2. 역량 키워드 추출 및 분류
자격요건·우대사항에서 등장하는 **기술·지식·자격증 키워드**를 빈도 분석 후 아래 카테고리별로 분류:  
- 🔹 **보안 기초 지식**: 네트워크, 운영체제, 암호학, 취약점 분석  
- 🔹 **디지털포렌식**: 로그 분석, 메모리 포렌식, 디스크 이미지 분석, 사고 대응(IR)  
- 🔹 **프로그래밍/자동화**: Python, C/C++, Java, Bash, PowerShell, 로그 파서 개발  
- 🔹 **클라우드/인프라 보안**: AWS, Azure, GCP, VMware, Kubernetes, 컨테이너 보안, 인프라 아키텍처 보안  
- 🔹 **자격증/학위**: 정보보안기사, CISSP, CISA, CEH, 클라우드 보안 관련 자격증  
- 🔹 **소프트 스킬**: 문제해결력, 커뮤니케이션, 분석적 사고  

## 3. 기업 니즈 분석
- 공통적으로 요구되는 최소 역량 (baseline)  
- 차별화를 주는 고급 역량 (differentiator)  
- 특히 **클라우드·인프라 보안** 역량에서 강조되는 부분 별도 정리  
- 산업군(금융, IT 서비스, 제조, 게임 등)에 따른 차이  

## 4. 학습/준비 로드맵 제안
- 위 분석 기반으로 신입·주니어 취업 준비생이 갖춰야 할 **공부 우선순위** 제시  
- 단계별 로드맵 (예: 1단계 네트워크·리눅스, 2단계 Python 로그 분석, 3단계 클라우드 보안·인프라 아키텍처, 4단계 자격증·CTF 실습)  
- 각 역량별 실습 아이디어와 추천 리소스(CTF, 강의, 교재, 프로젝트 주제 등) 포함  

## 5. 최종 산출물 형식
- 📊 표: 회사별 요구사항 정리  
- 📌 bullet: 핵심 키워드 및 빈도  
- 📝 요약: 기업이 원하는 인재상과 공부 방향  

출력은 한국어로, 구조화된 보고서 형태로 작성하십시오.

---
**분석할 채용 공고 데이터:**
{chr(10).join(summarized_jobs)}
"""
        
        max_retries = 5
        base_delay = 5  # seconds
        for i in range(max_retries):
            try:
                response = await asyncio.to_thread(
                    self.ai_model.generate_content,
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=2000 # Increased output tokens for detailed report
                    )
                )
                
                analysis_text = response.text.strip()
                if analysis_text.startswith('```'):
                    analysis_text = analysis_text.split('\n')[1:-1]
                    analysis_text = '\n'.join(analysis_text)
                
                logger.info("AI 채용 공고 분석 완료")
                return analysis_text

            except google.api_core.exceptions.ResourceExhausted as e:
                if i == max_retries - 1:
                    logger.error(f"API call failed after {max_retries} retries: {e}")
                    return f"API 호출 실패: {e}"
                
                delay = base_delay * (2 ** i) + random.uniform(0, 1)
                logger.warning(f"Rate limit exceeded. Retrying in {delay:.2f} seconds...")
                await asyncio.sleep(delay)
            
            except Exception as e:
                logger.error(f"채용 공고 분석 실패: {e}")
                return f"채용 공고 분석 중 오류 발생: {e}"
        return "알 수 없는 오류로 채용 공고 분석에 실패했습니다."

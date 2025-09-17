from typing import List, Dict, Any
import re
from utils.logger import setup_logger
from database.mongo_client import mongo_client

logger = setup_logger()

class DataNormalizer:
    def __init__(self):
        self.company_mapper = CompanyNameMapper()
        self.location_normalizer = LocationNormalizer()
        self.skills_normalizer = SkillsNormalizer()
        self.salary_normalizer = SalaryNormalizer()
    
    async def normalize(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 정규화 메인 메서드"""
        normalized = raw_job.copy()
        
        try:
            # 1. 회사명 정규화
            if 'company_name' in normalized:
                normalized['company_name'] = await self.company_mapper.normalize(
                    normalized['company_name']
                )
            
            # 2. 위치 정규화
            if 'work_location' in normalized:
                normalized['work_location'] = self.location_normalizer.normalize(
                    normalized['work_location']
                )
            
            # 3. 스킬/키워드 정규화
            if 'keywords' in normalized:
                normalized['keywords'] = self.skills_normalizer.normalize(
                    normalized['keywords']
                )
            
            # 4. 급여 정규화
            if 'salary_range' in normalized:
                normalized['salary_range'] = self.salary_normalizer.normalize(
                    normalized['salary_range']
                )
            
            # 5. 직군 분류 개선
            normalized['job_category'] = await self.improve_job_categorization(normalized)
            
            # 6. 품질 점수 계산
            normalized['quality_score'] = self.calculate_quality_score(normalized)
            
            return normalized
            
        except Exception as e:
            logger.error(f"데이터 정규화 실패: {e}")
            return {**raw_job, 'quality_score': 0.3, 'normalization_error': str(e)}
    
    def calculate_quality_score(self, job: Dict[str, Any]) -> float:
        """데이터 품질 점수 계산"""
        score = 0
        max_score = 0
        
        # 필수 필드 검사
        required_fields = ['job_title', 'company_name', 'job_category']
        for field in required_fields:
            max_score += 20
            if job.get(field) and str(job[field]).strip():
                score += 20
        
        # 선택 필드 검사
        optional_fields = ['work_location', 'keywords', 'salary_range']
        for field in optional_fields:
            max_score += 10
            value = job.get(field)
            if value and (isinstance(value, list) and len(value) > 0 or value):
                score += 10
        
        # 키워드 풍부도
        max_score += 30
        keywords = job.get('keywords', [])
        if isinstance(keywords, list) and len(keywords) >= 3:
            score += 30
        elif isinstance(keywords, list) and len(keywords) >= 1:
            score += 15
        
        return min(score / max_score, 1.0) if max_score > 0 else 0.0
    
    async def improve_job_categorization(self, job: Dict[str, Any]) -> str:
        """AI를 사용한 더 정확한 직군 분류"""
        context = ' '.join([
            job.get('job_title', ''),
            ' '.join(job.get('keywords', [])),
        ]).strip()
        
        # 기존 카테고리 신뢰도 검증
        current_category = job.get('job_category', '기타')
        confidence = self.get_category_confidence(current_category, context)
        
        if confidence < 0.7:
            # 신뢰도가 낮으면 재분류
            return self.reclassify_job(context)
        
        return current_category
    
    def get_category_confidence(self, category: str, context: str) -> float:
        """카테고리 신뢰도 계산"""
        from config.categories import JOB_CATEGORIES
        
        keywords = JOB_CATEGORIES.get(category, [])
        if not keywords:
            return 0.0
        
        context_lower = context.lower()
        matches = sum(1 for keyword in keywords if keyword.lower() in context_lower)
        
        return min(matches / len(keywords), 1.0)
    
    def reclassify_job(self, context: str) -> str:
        """키워드 기반 재분류"""
        from config.categories import JOB_CATEGORIES
        
        best_category = '기타'
        max_score = 0
        
        context_lower = context.lower()
        
        for category, keywords in JOB_CATEGORIES.items():
            score = sum(1 for keyword in keywords if keyword.lower() in context_lower)
            if score > max_score:
                max_score = score
                best_category = category
        
        return best_category

class CompanyNameMapper:
    def __init__(self):
        self.aliases = self._load_company_aliases()
    
    def _load_company_aliases(self):
        """회사명 별칭 매핑 로드"""
        return {
            '삼성전자': ['삼성전자주식회사', 'Samsung Electronics', 'SEC'],
            '네이버': ['NAVER', '네이버주식회사', 'NAVER Corp'],
            '카카오': ['Kakao', '주식회사카카오', 'Kakao Corp'],
            'LG전자': ['LG Electronics', 'LG전자주식회사'],
            '현대자동차': ['현대자동차주식회사', 'Hyundai Motor'],
        }
    
    async def normalize(self, company_name: str) -> str:
        """회사명 정규화"""
        if not company_name:
            return ''
        
        # 1. 기본 정리
        normalized = company_name.strip()
        normalized = re.sub(r'주식회사|㈜|\(주\)', '', normalized)
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        # 2. 별칭 매핑
        for canonical, aliases in self.aliases.items():
            if normalized.lower() in [alias.lower() for alias in aliases]:
                return canonical
        
        return normalized

class LocationNormalizer:
    def __init__(self):
        self.location_mapping = {
            '서울시': '서울',
            '서울특별시': '서울',
            '경기도': '경기',
            '부산시': '부산',
            '부산광역시': '부산',
            '재택근무': '재택',
            '원격근무': '재택',
        }
    
    def normalize(self, location: str) -> str:
        """위치 정규화"""
        if not location:
            return ''
        
        normalized = location.strip()
        
        # 매핑 테이블 적용
        mapped = self.location_mapping.get(normalized)
        if mapped:
            return mapped
        
        # 패턴 매칭
        if '강남' in normalized and '서울' not in normalized:
            return '서울 강남구'
        
        if '판교' in normalized and '경기' not in normalized:
            return '경기 성남 판교'
        
        return re.sub(r'시$|구$|동$', '', normalized).strip()

class SkillsNormalizer:
    def __init__(self):
        self.skill_mappings = {
            'js': 'JavaScript',
            'ts': 'TypeScript',
            'python': 'Python',
            'python3': 'Python',
            'react.js': 'React',
            'reactjs': 'React',
            'vue.js': 'Vue.js',
            'vuejs': 'Vue.js',
            'node.js': 'Node.js',
            'nodejs': 'Node.js',
            'aws': 'AWS',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'postgres': 'PostgreSQL',
            'mongodb': 'MongoDB',
            'mongo': 'MongoDB',
        }
    
    def normalize(self, skills: List[str]) -> List[str]:
        """스킬 정규화"""
        if not isinstance(skills, list):
            skills = [skills] if skills else []
        
        normalized = []
        for skill in skills:
            if not skill:
                continue
            
            cleaned = skill.strip().lower()
            mapped_skill = self.skill_mappings.get(cleaned, skill.strip())
            
            if len(mapped_skill) > 1 and mapped_skill not in normalized:
                normalized.append(mapped_skill)
        
        return normalized

class SalaryNormalizer:
    def normalize(self, salary_range: Dict[str, Any]) -> Dict[str, Any]:
        """급여 정규화"""
        if not isinstance(salary_range, dict):
            return {'min': 0, 'max': 0, 'negotiable': True}
        
        min_val = self._parse_salary(salary_range.get('min', 0))
        max_val = self._parse_salary(salary_range.get('max', 0))
        negotiable = salary_range.get('negotiable', True)
        
        # 범위 검증
        if min_val > max_val and max_val > 0:
            min_val, max_val = max_val, min_val
        
        # 현실적이지 않은 값 필터링
        if min_val > 200000000:  # 2억 초과
            min_val = 0
        if max_val > 200000000:
            max_val = 0
        
        return {
            'min': max(0, min_val),
            'max': max(0, max_val),
            'negotiable': bool(negotiable)
        }
    
    def _parse_salary(self, value) -> int:
        """급여 값 파싱"""
        if isinstance(value, (int, float)):
            return int(value)
        
        if not value:
            return 0
        
        # 문자열에서 숫자 추출
        numbers = re.findall(r'\d+', str(value))
        return int(numbers[0]) if numbers else 0
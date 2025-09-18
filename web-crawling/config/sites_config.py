GLOBAL_CONFIG = {
    'experience_filters': ['신입', '1-3년차', '경력무관'],
    'exclude_filters': ['5년이상', '임원급', '계약직'],
    'job_categories': {
        'IT/개발': ['프론트엔드', '백엔드', '풀스택', '모바일', '데브옵스', 'AI/ML', '데이터'],
        '보안': ['정보보안', '디지털포렌식', '클라우드보안', '인프라보안'],
        '마케팅': ['디지털마케팅', '퍼포먼스마케팅', '브랜드마케팅', '콘텐츠마케팅'],
        '디자인': ['UI/UX', '그래픽디자인', '웹디자인', '앱디자인'],
        '기획': ['서비스기획', '사업기획', '전략기획', 'PM'],
        '영업/세일즈': ['B2B영업', 'B2C영업', '해외영업', '기술영업'],
        '금융': ['투자', '리스크관리', '회계', '재무분석']
    },
    'collection_batch_size': 10,
    'cache_ttl': {
        'job_posts': 3600,      # 1 hour
        'analysis': 21600,      # 6 hours
        'trends': 86400        # 24 hours
    }
}

VALIDATION_RULES = {
    'required_fields': ['title', 'company', 'description', 'category'],
    'min_description_length': 50,
    'max_title_length': 200,
    'keyword_min_length': 2
}

SITES_CONFIG = {
    'saramin': {
        'base_url': 'https://www.saramin.co.kr',
        'search_path': '/zf_user/search/recruit',
        'selectors': {
            'job_list': '.item_recruit',
            'title': '.job_tit a',
            'company': '.corp_name a',
            'location': '.job_condition span:first-child',
            'experience': '.job_condition span:nth-child(2)',
            'salary': '.job_condition span:last-child',
            'deadline': '.job_date .date',
            'url': '.job_tit a'
        },
        'rate_limit': 3,
        'max_pages': 10
    },
    'jobkorea': {
        'base_url': 'https://www.jobkorea.co.kr',
        'search_path': '/Search/',
        'selectors': {
            'job_list': 'div[data-sentry-component="CardCommon"]',
            'title': 'a[data-sentry-component="Title"]',
            'company': 'div[class*="styles_mb_space4__"] a',
            'location': 'div[class*="Flex_gap_space16__"] span:nth-child(4)',
            'experience': 'div[class*="Flex_gap_space16__"] span:nth-child(1)',
            'salary': 'div[class*="Flex_gap_space16__"] span:nth-child(3)',
            'deadline': 'div[class*="Flex_gap_space16__"] > span[class*="Typography_color_gray700__"]',
            'url': 'a[data-sentry-component="Title"]',
            'tags': 'div[class*="styles_mb_space12__"] a',
            'category': 'span[data-accent-color="gray900"]',
            'description': 'div[class*="styles_mb_space8__"] a',
            'conditions': 'div[class*="Flex_gap_space16__"]'
        },
        'rate_limit': 3.5,
        'max_pages': 8,
        'priority': 4
    },
    'worknet': {
        'base_url': 'https://www.work.go.kr',
        'search_path': '/empInfo/empInfoSrch/list/dtlEmpSrchList.do',
        'selectors': {
            'job_list': '.cp-item-list li',
            'title': '.cp-info-tit a',
            'company': '.cp-company-name a',
            'location': '.cp-company-info .cp-area',
            'experience': '.cp-company-info .cp-career',
            'salary': '.cp-company-info .cp-salary',
            'deadline': '.cp-date',
            'url': '.cp-info-tit a',
            'tags': '.cp-keyword span'
        },
        'rate_limit': 2,
        'max_pages': 5
    },
    'programmers': {
        'base_url': 'https://career.programmers.co.kr',
        'search_path': '/job',
        'selectors': {
            'job_list': '.list-position-card',
            'title': '.position-title',
            'company': '.company-name',
            'location': '.position-location',
            'experience': '.position-experience',
            'salary': '.position-salary',
            'deadline': '.position-date',
            'url': 'a',
            'tags': '.position-tag'
        },
        'rate_limit': 2.5,
        'max_pages': 6
    },
    'comento': {
        'base_url': 'https://comento.kr',
        'search_path': '/career/dreamverse',
        'selectors': {
            'job_list': '[data-testid="job-card"]',
            'title': '.job-title',
            'company': '.company-name',
            'location': '.location',
            'experience': '.experience',
            'skills': '.skill-tag',
            'url': 'a',
            'category': '.job-category',  # Add category selector
            'description': '.job-description',  # Add description selector
            'salary_range': '.salary-range'  # Add salary range selector
        },
        'rate_limit': 4,
        'max_pages': 5,
        'priority': 2  # Priority based on PRD
    },
    'securityfarm': {
        'base_url': 'https://securityfarm.co.kr',
        'search_path': '/job',
        'selectors': {
            'job_list': '.job-item',
            'title': '.job-title',
            'company': '.company-name',
            'location': '.location',
            'experience': '.experience',
            'skills': '.skill',
            'deadline': '.deadline',
            'url': 'a'
        },
        'rate_limit': 2,
        'max_pages': 5
    }
}

DATA_TRANSFORMATION = {
    'experience_mapping': {
        '신입': 'entry',
        '1-3년': 'junior',
        '경력무관': 'any',
        '3-5년': 'mid',
        '5년이상': 'senior'
    },
    'category_mapping': {
        '개발': 'IT/개발',
        '프로그래밍': 'IT/개발',
        '보안': '보안',
        'IT보안': '보안',
        '마케터': '마케팅',
        '기획자': '기획',
        '디자이너': '디자인'
    },
    'location_normalization': {
        'Seoul': '서울',
        'Gyeonggi': '경기',
        'Incheon': '인천'
    }
}
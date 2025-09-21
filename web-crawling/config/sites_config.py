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
    'min_description_length': 10,
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
    'worknet': {
        'base_url': 'https://www.work24.go.kr',
        'search_path': '/empInfo/empInfoSrch/list/dtlEmpSrchList.do',
        'selectors': {
            'job_list': '.job-item, .job-card, .listing-item, .post-item, article, div.job_list, tr[id^="listRow"]',
            'title': 'a.t3_sb.underline_hover',
            'company': 'td.al_left.pd24 a.cp_name',
            'location': 'td:nth-child(3)',
            'experience': 'td:nth-child(4)',
            'salary': 'td:nth-child(5)',
            'deadline': 'td:nth-child(6)',
            'url': 'a.t3_sb.underline_hover',
            'tags': 'td:nth-child(7)'
        },
        'rate_limit': 2,
        'max_pages': 5
    },
    'worknet_new': {
        'base_url': 'https://www.work24.go.kr',
        'search_path': '/wk/a/b/1200/retriveDtlEmpSrchListInPost.do',
        'form_path': '/wk/a/b/1200/retriveDtlEmpSrchList.do',
        'method': 'POST',
        'selectors': {
            'job_list': 'tr[id^="list"]',
            'title': 'a[href*="empDetailAuthView.do"]',
            'company': 'a.cp_name.underline_hover',
            'location': 'td:nth-child(3)',
            'experience': 'td:nth-child(4)',
            'salary': 'td:nth-child(5)',
            'deadline': 'td:nth-child(6)',
            'url': 'a[href*="empDetailAuthView.do"]',
            'tags': 'td:nth-child(7)'
        },
        'search_params': {
            'pageIndex': '1',
            'srcKeyword': '',
            'notSrcKeyword': '',
            'occupation': '',
            'region': '',
            'careerTypes': '',
            'employGbn': '',
            'academicGbn': ''
        },
        'rate_limit': 2,
        'max_pages': 5
    },

    'comento': {
        'base_url': 'https://comento.kr',
        'search_path': '/career/recruit',
        'selectors': {
            'job_list': 'div, article, li, section',
            'title': 'h1, h2, h3, h4, a, span',
            'company': 'div, span, p, a',
            'location': 'div, span, p',
            'experience': 'div, span, p',
            'skills': 'div, span, ul li',
            'deadline': 'div, span, p',
            'url': 'a'
        },
        'exclude_keywords': ['로그인', '회원가입'],
        'min_title_length': 2,
        'rate_limit': 4,
        'max_pages': 5,
        'priority': 2,
        'wait_time': 5,
        'scroll_enabled': True
    },
    'securityfarm': {
        'base_url': 'https://securityfarm.co.kr',
        'search_path': '/job',
        'selectors': {
            'job_list': 'div, article, li, section',
            'title': 'h1, h2, h3, h4, a, span',
            'company': 'div, span, p, a',
            'location': 'div, span, p',
            'experience': 'div, span, p',
            'skills': 'div, span, ul li',
            'deadline': 'div, span, p',
            'url': 'a',
            'description': 'div, p, span'
        },
        'exclude_keywords': ['로그인', '회원가입'],
        'min_title_length': 2,
        'rate_limit': 2,
        'max_pages': 5,
        'wait_time': 10,
        'scroll_enabled': True
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
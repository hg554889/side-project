SITES_CONFIG = {
    'saramin': {
        'base_url': 'https://www.saramin.co.kr',
        'search_path': '/zf_user/search/recruit',  # 수정된 경로
        'selectors': {
            'job_list': '.item_recruit',  # 테스트에서 확인됨
            'title': '.job_tit a',
            'company': '.corp_name a',
            'location': '.job_condition span:first-child',
            'experience': '.job_condition span:nth-child(2)',
            'salary': '.job_condition span:last-child',
            'deadline': '.job_date .date',
            'url': '.job_tit a',
            'tags': '.job_sector a'
        },
        'rate_limit': 3,
        'max_pages': 10
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
            'url': 'a'
        },
        'rate_limit': 4,
        'max_pages': 5
    },
    'jobkorea': {
        'base_url': 'https://www.jobkorea.co.kr',
        'search_path': '/recruit/joblist',
        'selectors': {
            'job_list': '.recruit-info',
            'title': '.post-list-corp-name a',
            'company': '.post-list-info .corp-name a',
            'conditions': '.post-list-info .option',
            'url': '.post-list-corp-name a'
        },
        'rate_limit': 3.5,
        'max_pages': 8
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
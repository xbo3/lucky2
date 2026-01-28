const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// 데이터 폴더 및 파일 경로
const dataDir = '/app/data';
const STATS_FILE = path.join(dataDir, 'stats.json');
const SITES_INDEX_FILE = path.join(dataDir, 'sites.json'); // 도메인 목록
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 기본 데이터 (단일 사이트 설정 스키마)
const defaultData = {
    logo: 'LUCKY <span>VIKY</span>',
    bgVideo: '',
    bgOverlay: 0.6,
    bannerVideo: '',
    eventBadge: '🎂 3rd ANNIVERSARY',
    eventTitle: '누구나 20 + 15',
    eventTitleSize: 32,
    eventBtnText: '🎰 슬롯 전용 보너스',
    eventBtnLink: '',
    benefitTitle: '💰 200,000원 입금시 3주년 혜택',
    benefitTitleSize: 18,
    benefit1: '100,000P',
    benefit2: '기프티콘 50,000원',
    benefitItemSize: 24,
    benefitNote: '* 슬롯 게임 전용 보너스',
    ctaBtnText: '🎉 3주년 기념 보너스 지금 참여하기',
    ctaBtnLink: 'https://KK-32.COM',
    contactLink: 'https://t.me/BIPLAYS',
    contactText: '@BIPLAYS',
    // 멀티 이벤트 카드 (MELBET, Lucky Wheel 등)
    events: [],
    // 동적 섹션 (배너/버튼 추가 가능)
    sections: []
};

// 기본 통계
const defaultStats = {
    totalVisits: 0,
    todayVisits: 0,
    ctaClicks: 0,
    todayCtaClicks: 0,
    lastReset: new Date().toISOString().split('T')[0],
    visitHistory: [],
    clickHistory: []
};

// 도메인 키 문자열을 파일명으로 안전하게 변환
function getDomainKey(domain) {
    if (!domain) return 'default';
    return domain.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// 도메인별 데이터 파일 경로
function getDataFile(domain) {
    const key = getDomainKey(domain);
    return path.join(dataDir, `site-${key}.json`);
}

// 사이트(도메인) 목록 로드
function loadSitesIndex() {
    try {
        if (fs.existsSync(SITES_INDEX_FILE)) {
            const data = fs.readFileSync(SITES_INDEX_FILE, 'utf8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed.sites)) return parsed;
        }
    } catch (e) {
        console.error('사이트 인덱스 로드 실패:', e);
    }
    // 기본값: 한 개의 예시 도메인
    return {
        maxSites: 10,
        sites: [
            { domain: 'vip.luckyviky.eu' }
        ]
    };
}

// 사이트(도메인) 목록 저장
function saveSitesIndex(index) {
    try {
        fs.writeFileSync(SITES_INDEX_FILE, JSON.stringify(index, null, 2));
        return true;
    } catch (e) {
        console.error('사이트 인덱스 저장 실패:', e);
        return false;
    }
}

// 사이트 인덱스에 도메인 추가 (최대 10개)
function ensureDomainInIndex(domain) {
    if (!domain) return;
    const index = loadSitesIndex();
    const exists = index.sites.some(s => s.domain === domain);
    if (!exists) {
        if (index.sites.length >= (index.maxSites || 10)) {
            throw new Error('MAX_SITES_REACHED');
        }
        index.sites.push({ domain });
        saveSitesIndex(index);
    }
}

// 도메인별 사이트 데이터 로드
function loadData(domain) {
    try {
        const file = getDataFile(domain);
        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
    return { ...defaultData };
}

// 도메인별 사이트 데이터 저장
function saveData(domain, data) {
    try {
        const file = getDataFile(domain);
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        console.log('✅ 데이터 저장 완료');
        return true;
    } catch (error) {
        console.error('데이터 저장 실패:', error);
        return false;
    }
}

// 통계 로드
function loadStats() {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = fs.readFileSync(STATS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('통계 로드 실패:', error);
    }
    return { ...defaultStats };
}

// 통계 저장
function saveStats(stats) {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
        return true;
    } catch (error) {
        console.error('통계 저장 실패:', error);
        return false;
    }
}

// 일일 리셋 체크
function checkDailyReset(stats) {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastReset !== today) {
        // 어제 데이터 히스토리에 저장
        if (stats.todayVisits > 0 || stats.todayCtaClicks > 0) {
            stats.visitHistory.push({
                date: stats.lastReset,
                visits: stats.todayVisits,
                clicks: stats.todayCtaClicks
            });
            // 최근 30일만 유지
            if (stats.visitHistory.length > 30) {
                stats.visitHistory = stats.visitHistory.slice(-30);
            }
        }
        stats.todayVisits = 0;
        stats.todayCtaClicks = 0;
        stats.lastReset = today;
        saveStats(stats);
    }
    return stats;
}

// ============ API ============

// 사이트(도메인) 목록 조회
app.get('/api/sites', (req, res) => {
    const index = loadSitesIndex();
    res.json(index);
});

// 사이트 데이터 조회 (도메인별)
app.get('/api/site', (req, res) => {
    const domain = req.query.domain || 'default';
    const data = loadData(domain);
    console.log('📦 사이트 데이터 조회:', domain);
    res.json(data);
});

// 사이트 데이터 저장 (도메인별)
app.post('/api/site', (req, res) => {
    const body = req.body || {};
    // 새로운 형식: { domain, data }
    const domain = body.domain || 'default';
    const data = body.data || body;
    console.log('💾 사이트 데이터 저장:', domain);

    try {
        // 도메인 목록에 등록 (최대 개수 체크)
        ensureDomainInIndex(domain);
    } catch (e) {
        if (e.message === 'MAX_SITES_REACHED') {
            return res.status(400).json({ success: false, message: '최대 10개 사이트까지 등록 가능합니다.' });
        }
        console.error('도메인 인덱스 처리 실패:', e);
    }

    if (saveData(domain, data)) {
        res.json({ success: true, message: '저장 완료', domain });
    } else {
        res.status(500).json({ success: false, message: '저장 실패' });
    }
});

// 방문 기록
app.post('/api/visit', (req, res) => {
    let stats = loadStats();
    stats = checkDailyReset(stats);
    
    stats.totalVisits++;
    stats.todayVisits++;
    saveStats(stats);
    
    console.log(`👀 방문: 오늘 ${stats.todayVisits} / 전체 ${stats.totalVisits}`);
    res.json({ success: true });
});

// CTA 클릭 기록
app.post('/api/click', (req, res) => {
    let stats = loadStats();
    stats = checkDailyReset(stats);
    
    stats.ctaClicks++;
    stats.todayCtaClicks++;
    saveStats(stats);
    
    console.log(`🖱️ 클릭: 오늘 ${stats.todayCtaClicks} / 전체 ${stats.ctaClicks}`);
    res.json({ success: true });
});

// 통계 조회
app.get('/api/stats', (req, res) => {
    let stats = loadStats();
    stats = checkDailyReset(stats);
    
    res.json(stats);
});

// 통계 리셋
app.post('/api/stats/reset', (req, res) => {
    const stats = { ...defaultStats, lastReset: new Date().toISOString().split('T')[0] };
    saveStats(stats);
    res.json({ success: true, message: '통계 리셋 완료' });
});

// 어드민 페이지
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log('=====================================');
    console.log(`🍀 Lucky Viky 서버 시작!`);
    console.log(`📍 프론트: http://localhost:${PORT}`);
    console.log(`📍 어드민: http://localhost:${PORT}/admin.html`);
    console.log('=====================================');
});

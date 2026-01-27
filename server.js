const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// 데이터 파일 경로
const DATA_FILE = '/app/data/site.json';
const STATS_FILE = '/app/data/stats.json';

// 데이터 폴더 생성
const dataDir = '/app/data';
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 기본 데이터
const defaultData = {
    logo: 'LUCKY <span>VIKY</span>',
    bgVideo: '',
    bgOverlay: 0.6,
    bannerImage: '',
    eventBadge: '🎂 3rd ANNIVERSARY',
    eventTitle: '누구나 20 + 15',
    eventBtnText: '🎰 슬롯 전용 보너스',
    eventBtnLink: '',
    benefitTitle: '💰 200,000원 입금시 3주년 혜택',
    benefit1: '100,000P',
    benefit2: '기프티콘 50,000원',
    benefitNote: '* 슬롯 게임 전용 보너스',
    ctaBtnText: '🎉 3주년 기념 보너스 지금 참여하기',
    ctaBtnLink: 'https://KK-32.COM',
    contactLink: 'https://t.me/BIPLAYS',
    contactText: '@BIPLAYS'
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

// 데이터 로드
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
    return defaultData;
}

// 데이터 저장
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
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

// 사이트 데이터 조회
app.get('/api/site', (req, res) => {
    const data = loadData();
    console.log('📦 사이트 데이터 조회');
    res.json(data);
});

// 사이트 데이터 저장
app.post('/api/site', (req, res) => {
    const data = req.body;
    console.log('💾 사이트 데이터 저장');
    
    if (saveData(data)) {
        res.json({ success: true, message: '저장 완료' });
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

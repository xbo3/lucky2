const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// 데이터 파일 경로
const DATA_FILE = './data/site.json';

// 데이터 폴더 생성
const dataDir = './data';
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
    ctaBtnLink: 'https://KK-02.COM',
    contactLink: 'https://t.me/BIPLAYS',
    contactText: '@BIPLAYS'
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

const langText = {
    cn: {
        home: '首页', about: '关于', toc: '目录', tags: '搜索',
        aboutTitle: '关于这本书',
        readBack: '← 目录', tocTitle: '章节目录',
        searchTitle: '搜索全书', searchPlaceholder: '输入关键词搜索全书…', searchHint: '搜索正文和知识卡片',
        noResult: '未找到相关内容', resultCount: (n) => '共 ' + n + ' 条结果', showMore: (n) => '显示更多（' + n + ' 条）',
        prev: '← 上一章', next: '下一章 →',
        ttsPlay: '🔊 听书', ttsPause: '⏸ 暂停', ttsResume: '▶ 继续', ttsReading: '正在朗读…', ttsPaused: '已暂停',
        heroSub: '重新思考神是什么', heroBtn: '开始阅读', heroAuthor: 'Yaron（野人）',
        logo: '神', footer: '© 2026《神》· 保留所有权利', langLabel: 'EN',
        cardsTitle: '卡片知识库',
        filterAll: '全部', noCards: '暂无卡片'
    },
    en: {
        home: 'Home', about: 'About', toc: 'Contents', tags: 'Search',
        aboutTitle: 'About This Book',
        readBack: '← Contents', tocTitle: 'Table of Contents',
        searchTitle: 'Search', searchPlaceholder: 'Search the book…', searchHint: 'Search text and cards',
        noResult: 'No results found', resultCount: (n) => n + ' result(s) found', showMore: (n) => 'Show ' + n + ' more',
        prev: '← Previous', next: 'Next →',
        ttsPlay: '🔊 Read Aloud', ttsPause: '⏸ Pause', ttsResume: '▶ Resume', ttsReading: 'Reading…', ttsPaused: 'Paused',
        heroSub: 'Rethinking What God Is', heroBtn: 'Start Reading', heroAuthor: 'Yaron',
        logo: 'God', footer: '© 2026 God · All Rights Reserved', langLabel: '中',
        cardsTitle: 'Knowledge Cards',
        filterAll: 'All', noCards: 'No cards yet'
    }
};

let currentLang = 'cn';
const bookDataCN = typeof bookData !== 'undefined' ? bookData : { title: '神', parts: [] };
let bookDataENData;
try { bookDataENData = bookDataEN; } catch (e) { bookDataENData = { title: 'God', parts: [] }; }
let currentBookData = bookDataCN;
let currentCardData = typeof cardData !== 'undefined' ? cardData : [];
let flatChapters = [];
let currentChapter = 0;
let currentView = 'home';
let currentCardFilter = 'all';

function rebuildFlatChapters() {
    flatChapters = [];
    let idx = 0;
    for (const part of currentBookData.parts) {
        for (const ch of part.chapters) {
            flatChapters.push({
                flatIndex: idx++, partId: part.id, partTitle: part.title,
                number: ch.number, id: ch.id, title: ch.title,
                cnNumber: ch.cnNumber, html: ch.html, text: ch.text
            });
        }
    }
}

function getText(key) {
    const t = langText[currentLang];
    return typeof t[key] === 'function' ? t[key]() : (t[key] || key);
}

function applyUILang() {
    document.getElementById('langToggle').textContent = getText('langLabel');
    document.querySelector('.hero-sub').textContent = getText('heroSub');
    document.querySelector('.hero-author').textContent = getText('heroAuthor');
    document.querySelector('.btn[data-page="toc"]').textContent = getText('heroBtn');
    document.querySelector('.topbar-logo').textContent = getText('logo');
    document.querySelector('.search-hint').textContent = getText('searchHint');
    document.getElementById('searchInput').placeholder = getText('searchPlaceholder');
    if (currentLang === 'en') {
        document.documentElement.lang = 'en';
        document.querySelector('title').textContent = 'God - Read Online';
    } else {
        document.documentElement.lang = 'zh-CN';
        document.querySelector('title').textContent = '神 - 在线阅读';
    }
}

function switchLang(lang) {
    if (lang === currentLang) return;
    stopTts();
    currentLang = lang;
    currentBookData = lang === 'cn' ? bookDataCN : bookDataENData;
    rebuildFlatChapters();
    applyUILang();
    buildTOC();
    if (currentChapter >= flatChapters.length) currentChapter = 0;
    displayChapter(currentChapter);
    if (currentView === 'toc') switchView('toc');
    if (currentView === 'tags') { document.getElementById('searchInput').value = ''; document.getElementById('searchResults').innerHTML = ''; }
    if (currentView === 'cards') renderCards();
}

document.getElementById('langToggle').addEventListener('click', function () {
    switchLang(currentLang === 'cn' ? 'en' : 'cn');
});

function switchView(viewId) {
    if (viewId === currentView) return;
    const views = document.querySelectorAll('.view');
    views.forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.topbar-nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === viewId);
    });
    const footer = document.getElementById('mainFooter');
    footer.style.display = (viewId === 'read') ? 'none' : 'block';
    currentView = viewId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (viewId === 'tags') {
        setTimeout(() => document.getElementById('searchInput').focus(), 400);
    }
}

document.querySelectorAll('.topbar-nav a').forEach(a => {
    a.addEventListener('click', function (e) {
        e.preventDefault();
        switchView(this.dataset.page);
    });
});

document.addEventListener('click', function (e) {
    const link = e.target.closest('[data-page]');
    if (link && !link.closest('.topbar-nav')) {
        e.preventDefault();
        switchView(link.dataset.page);
    }
});

function displayChapter(index) {
    if (index < 0 || index >= flatChapters.length) return;
    stopTts();
    currentChapter = index;
    const ch = flatChapters[index];
    if (currentLang === 'en') {
        document.getElementById('readChapterTitle').textContent =
            ch.number === 0 ? ch.partTitle : `${ch.partTitle} — Chapter ${ch.number}: ${ch.title}`;
    } else {
        document.getElementById('readChapterTitle').textContent =
            ch.number === 0 ? ch.partTitle : `${ch.partTitle} — 第${ch.cnNumber}章 ${ch.title}`;
    }
    document.getElementById('readContent').innerHTML = ch.html;
    document.getElementById('readPosition').textContent = `${index + 1} / ${flatChapters.length}`;
    const pct = ((index + 1) / flatChapters.length) * 100;
    document.getElementById('readProgressBar').style.width = pct + '%';
    document.getElementById('readPercent').textContent = Math.round(pct) + '%';
    updateNavButtons();
}

function goToChapter(index) {
    displayChapter(index);
    switchView('read');
}

function nextChapter() {
    if (currentChapter < flatChapters.length - 1) {
        displayChapter(currentChapter + 1);
        switchView('read');
    }
}

function previousChapter() {
    if (currentChapter > 0) {
        displayChapter(currentChapter - 1);
        switchView('read');
    }
}

function updateNavButtons() {
    document.getElementById('prevBtn').innerHTML = getText('prev');
    document.getElementById('prevBtn').disabled = currentChapter === 0;
    document.getElementById('nextBtn').innerHTML = getText('next');
    document.getElementById('nextBtn').disabled = currentChapter === flatChapters.length - 1;
    document.querySelector('.read-back').textContent = getText('readBack');
}

function buildTOC() {
    const tree = document.getElementById('tocTree');
    tree.innerHTML = '';
    let flatIdx = 0;
    for (const part of currentBookData.parts) {
        const div = document.createElement('div');
        div.className = 'toc-part';
        const hdr = document.createElement('div');
        hdr.className = 'toc-part-header';
        hdr.innerHTML = `<span class="toc-part-title">${part.title}</span><span class="toc-part-arrow">▶</span>`;
        hdr.addEventListener('click', function () { this.parentElement.classList.toggle('open'); });
        div.appendChild(hdr);
        const body = document.createElement('div');
        body.className = 'toc-chapters';
        for (const ch of part.chapters) {
            const item = document.createElement('div');
            item.className = 'toc-chapter';
            item.addEventListener('click', (fi => () => goToChapter(fi))(flatIdx));
            item.innerHTML = ch.number === 0 ? `<span class="toc-chapter-name">${ch.title}</span>`
                : `<span class="toc-chapter-num">第${ch.cnNumber}章</span><span class="toc-chapter-name">${ch.title}</span>`;
            body.appendChild(item);
            flatIdx++;
        }
        div.appendChild(body);
        tree.appendChild(div);
        div.classList.add('open');
    }
}

function renderCards() {
    const grid = document.getElementById('cardGrid');
    const filterTags = document.getElementById('cardFilterTags');
    const cats = {};
    currentCardData.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
    let filterHtml = `<button class="card-filter-btn ${currentCardFilter === 'all' ? 'active' : ''}" data-cat="all">${getText('filterAll')} (${currentCardData.length})</button>`;
    Object.keys(cats).sort().forEach(cat => {
        filterHtml += `<button class="card-filter-btn ${currentCardFilter === cat ? 'active' : ''}" data-cat="${cat}">${cat} (${cats[cat]})</button>`;
    });
    filterTags.innerHTML = filterHtml;
    filterTags.querySelectorAll('.card-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () { currentCardFilter = this.dataset.cat; renderCards(); });
    });
    const filtered = currentCardFilter === 'all' ? currentCardData : currentCardData.filter(c => c.category === currentCardFilter);
    if (filtered.length === 0) { grid.innerHTML = `<div class="no-cards">${getText('noCards')}</div>`; return; }
    let html = '';
    filtered.forEach(c => {
        const cls = c.confidence === 'high' ? 'conf-high' : c.confidence === 'low' ? 'conf-low' : 'conf-med';
        html += `<div class="card-item">
            <div class="card-item-header">
                <span class="card-item-cat">${c.category}</span>
                <span class="card-item-conf ${cls}">${c.confidence}</span>
            </div>
            <div class="card-item-title">${escHtml(c.title)}</div>
            <div class="card-item-preview">${escHtml(c.body.slice(0, 100))}${c.body.length > 100 ? '…' : ''}</div>
            <div class="card-item-tags">${(c.tags || []).slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
        </div>`;
    });
    grid.innerHTML = html;
}

// Search
let searchTimer;
let searchState = { query: '', matches: [], renderedCount: 0 };
const RESULTS_PER_PAGE = 10;

function stripMarkdown(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
        .replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

document.getElementById('searchInput').addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => doSearch(this.value), 180);
});

function doSearch(query) {
    const results = document.getElementById('searchResults');
    const q = query.trim();
    if (!q) { results.innerHTML = ''; searchState = { query: '', matches: [], renderedCount: 0 }; return; }
    const lower = q.toLowerCase();
    let matches = [];
    for (const ch of flatChapters) {
        const cleanText = stripMarkdown(ch.text);
        const haystack = (ch.title + ' ' + cleanText).toLowerCase();
        if (haystack.includes(lower)) {
            const idx = haystack.indexOf(lower);
            const start = Math.max(0, idx - 15);
            const end = Math.min(cleanText.length, idx + q.length + 50);
            let snippet = cleanText.substring(start, end);
            if (start > 0) snippet = '…' + snippet;
            if (end < cleanText.length) snippet += '…';
            matches.push({ type: 'book', flatIndex: ch.flatIndex, title: ch.partTitle + ' — ' + ch.title, snippet });
        }
    }
    for (const c of currentCardData) {
        const haystack = (c.title + ' ' + stripMarkdown(c.body)).toLowerCase();
        if (haystack.includes(lower)) {
            const cleanBody = stripMarkdown(c.body);
            const idx = haystack.indexOf(lower);
            const start = Math.max(0, idx - 15);
            const end = Math.min(cleanBody.length, idx + q.length + 50);
            let snippet = cleanBody.substring(start, end);
            if (start > 0) snippet = '…' + snippet;
            if (end < cleanBody.length) snippet += '…';
            matches.push({ type: 'card', title: '📇 ' + c.category + ' / ' + c.title, snippet });
        }
    }
    searchState = { query: q, matches, renderedCount: 0 };
    if (matches.length === 0) { results.innerHTML = '<div class="search-result-item no-result">' + getText('noResult') + '</div>'; return; }
    renderSearchResults();
}

function renderSearchResults() {
    const results = document.getElementById('searchResults');
    const end = Math.min(searchState.renderedCount + RESULTS_PER_PAGE, searchState.matches.length);
    const items = searchState.matches.slice(0, end);
    const lowerQuery = searchState.query.toLowerCase();
    let html = '<div class="search-result-count">' + getText('resultCount')(searchState.matches.length) + '</div>';
    html += items.map(m => {
        const sl = m.snippet.toLowerCase();
        const idx = sl.indexOf(lowerQuery);
        let ds = escHtml(m.snippet);
        if (idx !== -1) {
            ds = escHtml(m.snippet.substring(0, idx))
                + '<mark class="search-highlight">' + escHtml(m.snippet.substring(idx, idx + searchState.query.length)) + '</mark>'
                + escHtml(m.snippet.substring(idx + searchState.query.length));
        }
        return '<div class="search-result-item" data-idx="' + m.flatIndex + '">'
            + '<div class="result-type-badge ' + (m.type === 'card' ? 'card-badge' : 'paper-badge') + '">' + (m.type === 'card' ? '卡片' : '正文') + '</div>'
            + '<div class="result-title">' + escHtml(m.title) + '</div>'
            + '<div class="result-snippet">' + ds + '</div></div>';
    }).join('');
    if (end < searchState.matches.length) {
        html += '<div class="search-result-more">' + getText('showMore')(searchState.matches.length - end) + '</div>';
    }
    results.innerHTML = html;
}

document.getElementById('searchResults').addEventListener('click', function (e) {
    const item = e.target.closest('.search-result-item');
    if (item && !item.classList.contains('no-result')) {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
        goToChapter(parseInt(item.dataset.idx));
    }
    const more = e.target.closest('.search-result-more');
    if (more) {
        searchState.renderedCount += RESULTS_PER_PAGE;
        renderSearchResults();
    }
});

function escHtml(text) {
    const d = document.createElement('div');
    d.textContent = text.substring(0, 180);
    return d.innerHTML;
}

// TTS
const ttsState = { playing: false, paused: false, chapterIdx: -1 };
function stripHtml(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent || d.innerText || ''; }
function speakChapter(index) {
    const ch = flatChapters[index];
    if (!ch) return;
    if (ttsState.playing && ttsState.paused && ttsState.chapterIdx === index) { speechSynthesis.resume(); ttsState.paused = false; updateTtsUi(); return; }
    speechSynthesis.cancel();
    const text = ch.text || stripHtml(ch.html);
    if (!text.trim()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang === 'en' ? 'en-US' : 'zh-CN';
    utterance.rate = 0.9;
    utterance.onend = () => { ttsState.playing = false; ttsState.paused = false; ttsState.chapterIdx = -1; updateTtsUi(); };
    utterance.onpause = () => { ttsState.paused = true; updateTtsUi(); };
    utterance.onresume = () => { ttsState.paused = false; updateTtsUi(); };
    utterance.onerror = () => { ttsState.playing = false; ttsState.paused = false; ttsState.chapterIdx = -1; updateTtsUi(); };
    speechSynthesis.speak(utterance);
    ttsState.playing = true; ttsState.paused = false; ttsState.chapterIdx = index;
    updateTtsUi();
}
function toggleTts() {
    if (ttsState.playing && !ttsState.paused) { speechSynthesis.pause(); }
    else { speakChapter(currentChapter); }
}
function stopTts() { speechSynthesis.cancel(); ttsState.playing = false; ttsState.paused = false; ttsState.chapterIdx = -1; updateTtsUi(); }
function updateTtsUi() {
    const btn = document.getElementById('ttsBtn');
    const status = document.getElementById('ttsStatus');
    if (!btn) return;
    if (ttsState.playing && !ttsState.paused) { btn.textContent = getText('ttsPause'); status.textContent = getText('ttsReading'); }
    else if (ttsState.paused) { btn.textContent = getText('ttsResume'); status.textContent = getText('ttsPaused'); }
    else { btn.textContent = getText('ttsPlay'); status.textContent = ''; }
}
document.getElementById('ttsBtn').addEventListener('click', toggleTts);
document.getElementById('prevBtn').addEventListener('click', previousChapter);
document.getElementById('nextBtn').addEventListener('click', nextChapter);

document.addEventListener('keydown', function (e) {
    if (currentView !== 'read') return;
    if (e.key === 'ArrowRight') nextChapter();
    else if (e.key === 'ArrowLeft') previousChapter();
});

document.addEventListener('DOMContentLoaded', function () {
    currentBookData = bookDataCN;
    currentCardData = typeof cardData !== 'undefined' ? cardData : [];
    rebuildFlatChapters();
    applyUILang();
    buildTOC();
    displayChapter(0);
    document.querySelectorAll('.topbar-nav a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === 'home');
    });
    currentView = 'home';
});

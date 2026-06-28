const langText = {
  cn: {
    home: '首页', toc: '目录', cards: '疑问', search: '搜索',
    readBack: '← 目录',
    prev: '← 上一篇', next: '下一篇 →',
    noResult: '未找到相关内容',
    resultCount: (n) => '共 ' + n + ' 条结果',
    showMore: (n) => '显示更多（' + n + ' 条）',
    filterAll: '全部', noCards: '暂无解答',
    searchTitle: '搜索全书',
    searchPlaceholder: '输入关键词搜索研经笔记…',
    searchHint: '搜索全部研经笔记和疑问解答',
    logo: '圣经学习', heroSub: '逐卷研经 · 卡片提炼 · 系统整理',
    heroAuthor: 'Yaron（野人）', heroBtn: '开始阅读',
    fromPreface: '从 前言 开始',
    footer: '© 2026 圣经学习 Wiki · Yaron（野人）',
    langLabel: 'EN',
    ttsPlay: '🔊 听本章', ttsPause: '⏸ 暂停', ttsResume: '▶ 继续',
    ttsReading: '正在朗读…', ttsPaused: '已暂停',
    cardsTitle: '疑问解答', cardsDesc: '研经过程中已解决的困惑与疑难。',
    noNotes: '尚无研经笔记',
    noVerse: '暂无笔记',
    bookLabel: '卷',
    prefaceTitle: '前言'
  },
  en: {
    home: 'Home', toc: 'Contents', cards: 'Q&A', search: 'Search',
    readBack: '← Contents',
    prev: '← Previous', next: 'Next →',
    noResult: 'No results found',
    resultCount: (n) => n + ' result(s) found',
    showMore: (n) => 'Show ' + n + ' more',
    filterAll: 'All', noCards: 'No Q&A yet',
    searchTitle: 'Search',
    searchPlaceholder: 'Search study notes…',
    searchHint: 'Search all study notes and Q&A',
    logo: 'Bible Study', heroSub: 'Verse by Verse · Cards · System',
    heroAuthor: 'Yaron', heroBtn: 'Start Reading',
    fromPreface: 'Start with the Preface',
    footer: '© 2026 Bible Study Wiki · Yaron',
    langLabel: '中',
    ttsPlay: '🔊 Listen', ttsPause: '⏸ Pause', ttsResume: '▶ Resume',
    ttsReading: 'Reading…', ttsPaused: 'Paused',
    cardsTitle: 'Q&A', cardsDesc: 'Resolved Bible questions from study.',
    noNotes: 'No notes yet',
    noVerse: 'No notes',
    bookLabel: '',
    prefaceTitle: 'Preface'
  }
};

let currentLang = 'cn';
const bookDataCN = typeof bookData !== 'undefined' ? bookData : { title: '圣经学习 Wiki', parts: [] };
let bookDataENData;
try { bookDataENData = bookDataEN; } catch (e) { bookDataENData = { title: 'Bible Study Wiki', parts: [] }; }
const cardDataCN = typeof cardData !== 'undefined' ? cardData : [];
let cardDataENData;
try { cardDataENData = cardDataEN; } catch (e) { cardDataENData = []; }

let currentBookData = bookDataCN;
let currentCardData = cardDataCN;
let flatChapters = [];
let currentChapter = 0;
let currentView = 'home';
let currentCardFilter = 'all';

function t(key) {
  const v = langText[currentLang];
  return typeof v[key] === 'function' ? v[key]() : (v[key] || key);
}

function rebuildFlatChapters() {
  flatChapters = [];
  let idx = 0;
  for (const part of currentBookData.parts) {
    for (const book of (part.books || [])) {
      if (book.topics && book.topics.length > 0) {
        for (const topic of book.topics) {
          flatChapters.push({
            flatIndex: idx++, partId: part.id, partTitle: part.title,
            number: book.number, cnNumber: book.cnNumber,
            bookId: book.id, bookTitle: book.title,
            id: topic.id, title: topic.title,
            html: topic.html, text: topic.text
          });
        }
      } else {
        flatChapters.push({
          flatIndex: idx++, partId: part.id, partTitle: part.title,
          number: book.number, cnNumber: book.cnNumber,
          bookId: book.id, bookTitle: book.title,
          id: book.id, title: null,
          html: '', text: ''
        });
      }
    }
  }
}

function switchLang(lang) {
  if (lang === currentLang) return;
  stopTts();
  currentLang = lang;
  currentBookData = lang === 'cn' ? bookDataCN : bookDataENData;
  currentCardData = lang === 'cn' ? cardDataCN : cardDataENData;
  rebuildFlatChapters();
  applyUILang();
  buildTOC();
  if (currentChapter >= flatChapters.length) currentChapter = 0;
  displayChapter(currentChapter);
  if (currentView === 'toc') switchView('toc');
  if (currentView === 'cards') renderCards();
  if (currentView === 'tags') { document.getElementById('searchInput').value = ''; document.getElementById('searchResults').innerHTML = ''; }
}

document.getElementById('langToggle').addEventListener('click', function () {
  switchLang(currentLang === 'cn' ? 'en' : 'cn');
});

function applyUILang() {
  document.getElementById('langToggle').textContent = t('langLabel');
  document.querySelector('.topbar-logo').textContent = t('logo');
  document.querySelector('.hero-sub').textContent = t('heroSub');
  document.querySelector('.hero-author').textContent = t('heroAuthor');
  document.querySelector('.btn[data-page="toc"]').textContent = t('heroBtn');
  const from = document.querySelector('.hero-from');
  if (from) from.innerHTML = t('fromPreface');
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  document.querySelector('.search-hint').textContent = t('searchHint');
  document.getElementById('pageTitle').textContent = currentLang === 'cn' ? '圣经学习 Wiki' : 'Bible Study Wiki';
  document.documentElement.lang = currentLang === 'cn' ? 'zh-CN' : 'en';
  document.querySelector('.footer p').textContent = t('footer');
  const navs = document.querySelectorAll('.topbar-nav a');
  const pages = ['home', 'toc', 'cards', 'tags'];
  navs.forEach((a, i) => { a.textContent = t(pages[i]); });
  document.querySelector('.page-title').textContent = t('cardsTitle');
  document.querySelector('.page-desc').textContent = t('cardsDesc');
  document.getElementById('searchTitle').textContent = t('searchTitle');
}

function switchView(viewId) {
  if (viewId === currentView) return;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.topbar-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === viewId);
  });
  const footer = document.getElementById('mainFooter');
  footer.style.display = (viewId === 'read') ? 'none' : 'block';
  currentView = viewId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (viewId === 'cards') {
    renderCards();
  }
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

  const isPreface = ch.number === 0;
  if (isPreface) {
    document.getElementById('readChapterTitle').textContent = `${ch.bookTitle} · ${ch.title}`;
  } else if (ch.title) {
    document.getElementById('readChapterTitle').textContent =
      `${ch.partTitle} — ${t('bookLabel')}${ch.cnNumber} ${ch.bookTitle} · ${ch.title}`;
  } else {
    document.getElementById('readChapterTitle').textContent =
      `${ch.partTitle} — ${t('bookLabel')}${ch.cnNumber} ${ch.bookTitle}`;
  }

  if (ch.title && ch.html) {
    document.getElementById('readContent').innerHTML = ch.html;
  } else {
    document.getElementById('readContent').innerHTML =
      `<p style="color:#5a4e35;text-align:center;padding:40px 0;">📖 ${t('noNotes')}</p>`;
  }

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
  document.getElementById('prevBtn').textContent = t('prev');
  document.getElementById('prevBtn').disabled = currentChapter === 0;
  document.getElementById('nextBtn').textContent = t('next');
  document.getElementById('nextBtn').disabled = currentChapter === flatChapters.length - 1;
  document.querySelector('.read-back').textContent = t('readBack');
}

function buildTOC() {
  const tree = document.getElementById('tocTree');
  tree.innerHTML = '';
  for (const part of currentBookData.parts) {
    const partDiv = document.createElement('div');
    partDiv.className = 'toc-part';
    const hdr = document.createElement('div');
    hdr.className = 'toc-part-header';
    hdr.innerHTML = `<span class="toc-part-title">${part.title}</span><span class="toc-part-arrow">▶</span>`;
    hdr.addEventListener('click', function () { this.parentElement.classList.toggle('open'); });
    partDiv.appendChild(hdr);

    const partBody = document.createElement('div');
    partBody.className = 'toc-chapters';

    for (const book of (part.books || [])) {
      const bookDiv = document.createElement('div');
      bookDiv.className = 'toc-book';
      const bookHdr = document.createElement('div');
      bookHdr.className = 'toc-book-header';
      const isPreface = book.number === 0;
      const hasTopics = book.topics && book.topics.length > 0;

      if (isPreface) {
        bookHdr.innerHTML = `<span class="toc-book-name" style="font-weight:400;color:#7a6a4a;">${book.title}</span>`;
        const flatIdx = flatChapters.findIndex(ch => ch.bookId === 'preface');
        if (flatIdx !== -1) {
          bookHdr.addEventListener('click', function () { goToChapter(flatIdx); });
          bookHdr.style.cursor = 'pointer';
        }
      } else {
        const label = currentLang === 'cn' ? `第${book.cnNumber}卷` : `${book.cnNumber}.`;
        bookHdr.innerHTML = `<span class="toc-book-num">${label}</span><span class="toc-book-name">${book.title}</span>`;
        if (hasTopics) {
          bookHdr.innerHTML += '<span class="toc-note">📝</span>';
        }
        if (hasTopics) {
          bookHdr.addEventListener('click', function () { this.parentElement.classList.toggle('book-open'); });
          bookHdr.style.cursor = 'pointer';
          bookHdr.innerHTML += '<span class="toc-book-arrow">▶</span>';
        } else {
          const flatIdx = flatChapters.findIndex(ch =>
            ch.bookId === book.id && !ch.title
          );
          if (flatIdx !== -1) {
            bookHdr.addEventListener('click', function () { goToChapter(flatIdx); });
            bookHdr.style.cursor = 'pointer';
          }
        }
      }
      bookDiv.appendChild(bookHdr);
      if (hasTopics && !isPreface) {
        const topicBody = document.createElement('div');
        topicBody.className = 'toc-topics';
        for (const topic of book.topics) {
          const flatIdx = flatChapters.findIndex(ch =>
            ch.bookId === book.id && ch.id === topic.id
          );
          if (flatIdx === -1) continue;
          const item = document.createElement('div');
          item.className = 'toc-topic';
          item.addEventListener('click', () => goToChapter(flatIdx));
          item.innerHTML = `<span class="toc-topic-name">${topic.title}</span>`;
          topicBody.appendChild(item);
        }
        bookDiv.appendChild(topicBody);
      }
      partBody.appendChild(bookDiv);
    }
    partDiv.appendChild(partBody);
    tree.appendChild(partDiv);
    partDiv.classList.add('open');
  }
}

function renderCards() {
  const grid = document.getElementById('cardGrid');
  const filterTags = document.getElementById('cardFilterTags');

  const qaCards = currentCardData.filter(c => c.category === '疑问问答' || c.category === 'Q&A');

  const allTags = {};
  qaCards.forEach(c => (c.tags || []).forEach(t => { allTags[t] = (allTags[t] || 0) + 1; }));
  let filterHtml = `<button class="card-filter-btn ${currentCardFilter === 'all' ? 'active' : ''}" data-cat="all">${t('filterAll')} (${qaCards.length})</button>`;
  Object.keys(allTags).sort().forEach(tag => {
    filterHtml += `<button class="card-filter-btn ${currentCardFilter === tag ? 'active' : ''}" data-cat="${tag}">${tag} (${allTags[tag]})</button>`;
  });
  filterTags.innerHTML = filterHtml;
  filterTags.querySelectorAll('.card-filter-btn').forEach(btn => {
    btn.addEventListener('click', function () { currentCardFilter = this.dataset.cat; renderCards(); });
  });

  const filtered = currentCardFilter === 'all'
    ? qaCards
    : qaCards.filter(c => (c.tags || []).includes(currentCardFilter));
  if (filtered.length === 0) { grid.innerHTML = `<div class="no-cards">${t('noCards')}</div>`; return; }
  let html = '';
  filtered.forEach((c, idx) => {
    const verses = (c.verses || []).join('、');
    const verseHtml = verses
      ? `<div class="card-item-verse-block"><span class="verse-label">支持的经文：</span>${escHtml(verses)}</div>`
      : '';
    const cardId = 'qa-card-' + idx;
    html += `<div class="card-item qa-card" id="${cardId}">
      <div class="card-item-header">
        <span class="card-item-cat">${c.category}</span>
      </div>
      <div class="card-item-title qa-question">${escHtml(c.question)}</div>
      <div class="card-item-body qa-answer" style="display:none">${escHtml(c.answer)}</div>
      ${verseHtml ? `<div class="qa-verses" style="display:none">${verseHtml}</div>` : ''}
      <div class="card-item-tags qa-tags" style="display:none">${(c.tags || []).map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
    </div>`;
  });
  grid.innerHTML = html;
  grid.querySelectorAll('.qa-card').forEach(el => {
    el.addEventListener('click', function () {
      const answer = this.querySelector('.qa-answer');
      const verses = this.querySelector('.qa-verses');
      const tags = this.querySelector('.qa-tags');
      const isHidden = answer.style.display === 'none';
      answer.style.display = isHidden ? 'block' : 'none';
      if (verses) verses.style.display = isHidden ? 'block' : 'none';
      if (tags) tags.style.display = isHidden ? 'flex' : 'none';
      this.classList.toggle('qa-open', isHidden);
    });
  });
}

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
    const haystack = (ch.bookTitle + ' ' + (ch.title || '') + ' ' + cleanText).toLowerCase();
    if (haystack.includes(lower)) {
      const idx = haystack.indexOf(lower);
      const start = Math.max(0, idx - 15);
      const end = Math.min(cleanText.length, idx + q.length + 50);
      let snippet = cleanText.substring(start, end);
      if (start > 0) snippet = '…' + snippet;
      if (end < cleanText.length) snippet += '…';
      const displayTitle = ch.title
        ? `${ch.partTitle} — ${ch.bookTitle} · ${ch.title}`
        : `${ch.partTitle} — ${ch.bookTitle}`;
      matches.push({ type: 'book', flatIndex: ch.flatIndex, title: displayTitle, snippet });
    }
  }
  for (const c of currentCardData) {
    const haystack = (c.question + ' ' + (c.answer || '') + ' ' + (c.verses || []).join(' ')).toLowerCase();
    if (haystack.includes(lower)) {
      const cleanBody = stripMarkdown(c.answer || '');
      const idx = haystack.indexOf(lower);
      const start = Math.max(0, idx - 15);
      const end = Math.min(cleanBody.length, idx + q.length + 50);
      let snippet = cleanBody.substring(start, end);
      if (start > 0) snippet = '…' + snippet;
      if (end < cleanBody.length) snippet += '…';
      matches.push({ type: 'card', title: '❓ ' + c.category + ' / ' + c.question, snippet });
    }
  }
  searchState = { query: q, matches, renderedCount: 0 };
  if (matches.length === 0) { results.innerHTML = '<div class="search-result-item no-result">' + t('noResult') + '</div>'; return; }
  renderSearchResults();
}

function renderSearchResults() {
  const results = document.getElementById('searchResults');
  const end = Math.min(searchState.renderedCount + RESULTS_PER_PAGE, searchState.matches.length);
  const items = searchState.matches.slice(0, end);
  const lowerQuery = searchState.query.toLowerCase();
  let html = '<div class="search-result-count">' + t('resultCount')(searchState.matches.length) + '</div>';
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
      + '<div class="result-type-badge ' + (m.type === 'card' ? 'card-badge' : 'paper-badge') + '">' + (m.type === 'card' ? (currentLang === 'cn' ? '疑问' : 'Q&A') : (currentLang === 'cn' ? '正文' : 'Note')) + '</div>'
      + '<div class="result-title">' + escHtml(m.title) + '</div>'
      + '<div class="result-snippet">' + ds + '</div></div>';
  }).join('');
  if (end < searchState.matches.length) {
    html += '<div class="search-result-more">' + t('showMore')(searchState.matches.length - end) + '</div>';
  }
  results.innerHTML = html;
}

document.getElementById('searchResults').addEventListener('click', function (e) {
  const item = e.target.closest('.search-result-item');
  if (item && !item.classList.contains('no-result') && item.dataset.idx !== undefined) {
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
  d.textContent = text;
  return d.innerHTML;
}

document.getElementById('prevBtn').addEventListener('click', previousChapter);
document.getElementById('nextBtn').addEventListener('click', nextChapter);

document.addEventListener('keydown', function (e) {
  if (currentView !== 'read') return;
  if (e.key === 'ArrowRight') nextChapter();
  else if (e.key === 'ArrowLeft') previousChapter();
});

// TTS
const ttsState = { playing: false, paused: false, chapterIdx: -1 };

function stripHtml(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || d.innerText || '';
}

function speakChapter(index) {
  const ch = flatChapters[index];
  if (!ch) return;
  if (ttsState.playing && ttsState.paused && ttsState.chapterIdx === index) {
    speechSynthesis.resume();
    ttsState.paused = false;
    updateTtsUi();
    return;
  }
  stopTts();
  const text = ch.text || stripHtml(ch.html);
  if (!text.trim()) {
    document.getElementById('ttsStatus').textContent = t('noVerse');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === 'en' ? 'en-US' : 'zh-CN';
  utterance.rate = 0.9;
  utterance.onend = function () { ttsState.playing = false; ttsState.paused = false; ttsState.chapterIdx = -1; updateTtsUi(); };
  utterance.onpause = function () { ttsState.paused = true; updateTtsUi(); };
  utterance.onresume = function () { ttsState.paused = false; updateTtsUi(); };
  utterance.onerror = function () { ttsState.playing = false; ttsState.paused = false; ttsState.chapterIdx = -1; updateTtsUi(); };
  speechSynthesis.speak(utterance);
  ttsState.playing = true;
  ttsState.paused = false;
  ttsState.chapterIdx = index;
  updateTtsUi();
}

function toggleTts() {
  if (ttsState.playing && !ttsState.paused) {
    speechSynthesis.pause();
  } else {
    speakChapter(currentChapter);
  }
}

function stopTts() {
  speechSynthesis.cancel();
  ttsState.playing = false;
  ttsState.paused = false;
  ttsState.chapterIdx = -1;
  updateTtsUi();
}

function updateTtsUi() {
  const btn = document.getElementById('ttsBtn');
  const status = document.getElementById('ttsStatus');
  if (!btn || !status) return;
  if (ttsState.playing && !ttsState.paused) {
    btn.textContent = t('ttsPause');
    status.textContent = t('ttsReading');
  } else if (ttsState.paused) {
    btn.textContent = t('ttsResume');
    status.textContent = t('ttsPaused');
  } else {
    btn.textContent = t('ttsPlay');
    status.textContent = '';
  }
}

document.getElementById('ttsBtn').addEventListener('click', toggleTts);

document.addEventListener('DOMContentLoaded', function () {
  currentBookData = bookDataCN;
  currentCardData = cardDataCN;
  rebuildFlatChapters();
  applyUILang();
  buildTOC();
  if (flatChapters.length > 0) displayChapter(0);
  document.querySelectorAll('.topbar-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === 'home');
  });
  currentView = 'home';
});

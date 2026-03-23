(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progressBar = document.querySelector('.progress-bar');
  const hintToggle = document.querySelector('.hint-toggle');
  const fullscreenToggle = document.querySelector('.fullscreen-toggle');
  const container = document.querySelector('.slides-container');
  const chapterPill = document.querySelector('.chapter-pill');
  const slideMiniTitle = document.querySelector('.slide-mini-title');
  const teacherPanelText = document.querySelector('.teacher-panel-text');
  const currentSlideEl = document.querySelector('.current-slide');
  const totalSlidesEl = document.querySelector('.total-slides');
  const swipeTip = document.querySelector('.swipe-tip');
  const total = slides.length;
  let current = 0;
  let hintsVisible = false;

  const chapterRanges = [
    { end: 0, label: '暖场' },
    { end: 4, label: '第1章 · 认识豆包' },
    { end: 10, label: '第2章 · 好奇心发射' },
    { end: 15, label: '第3章 · 编故事' },
    { end: 22, label: '第4章 · AI画画' },
    { end: 28, label: '第5章 · AI视频' },
    { end: 33, label: '第6章 · 安全约定' },
    { end: 34, label: '结尾' }
  ];

  function getChapterLabel(index) {
    const match = chapterRanges.find(function (item) { return index <= item.end; });
    return match ? match.label : '绘本';
  }

  function getCurrentHint(index) {
    const hint = slides[index].querySelector('.teacher-hint');
    return hint ? hint.textContent.trim() : '这一页没有额外提示～';
  }

  function getCurrentTitle(index) {
    const text = slides[index].querySelector('.slide-text');
    return text ? text.textContent.trim() : '互动绘本';
  }

  function updateUi() {
    progressBar.style.width = (((current + 1) / total) * 100) + '%';
    currentSlideEl.textContent = String(current + 1);
    totalSlidesEl.textContent = String(total);
    chapterPill.textContent = getChapterLabel(current);
    slideMiniTitle.textContent = getCurrentTitle(current);
    teacherPanelText.textContent = getCurrentHint(current);

    document.querySelector('.nav-prev').style.visibility = current === 0 ? 'hidden' : 'visible';
    document.querySelector('.dock-prev').disabled = current === 0;
    document.querySelector('.nav-next').style.visibility = current === total - 1 ? 'hidden' : 'visible';
    document.querySelector('.dock-next').disabled = current === total - 1;
  }

  function goTo(index) {
    if (index < 0 || index >= total || index === current) return;
    slides[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    updateUi();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function toggleHints() {
    hintsVisible = !hintsVisible;
    document.body.classList.toggle('hints-visible', hintsVisible);
    hintToggle.classList.toggle('active', hintsVisible);
    hintToggle.title = hintsVisible ? '隐藏老师提示' : '显示老师提示';
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('fullscreen failed', err);
    }
  }

  function syncFullscreenState() {
    const active = Boolean(document.fullscreenElement);
    fullscreenToggle.classList.toggle('active', active);
    fullscreenToggle.textContent = active ? '退出全屏' : '全屏';
    fullscreenToggle.title = active ? '退出全屏' : '全屏播放';
  }

  function shouldIgnoreTap(target) {
    return target.closest('.control-dock, .top-hud, .teacher-panel, .nav-arrow, .video-overlay');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      next();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
    if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      toggleHints();
    }
    if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  document.querySelector('.nav-prev').addEventListener('click', prev);
  document.querySelector('.nav-next').addEventListener('click', next);
  document.querySelector('.dock-prev').addEventListener('click', prev);
  document.querySelector('.dock-next').addEventListener('click', next);
  document.querySelector('.tap-prev').addEventListener('click', function (e) {
    if (shouldIgnoreTap(e.target)) return;
    prev();
  });
  document.querySelector('.tap-next').addEventListener('click', function (e) {
    if (shouldIgnoreTap(e.target)) return;
    next();
  });

  let touchStartX = 0;
  let touchStartY = 0;

  container.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  hintToggle.addEventListener('click', toggleHints);
  fullscreenToggle.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', syncFullscreenState);

  slides.forEach(function (slide) {
    const src = slide.dataset.bg;
    if (!src) {
      slide.classList.add('no-image');
      return;
    }
    const img = new Image();
    img.onload = function () {
      slide.style.backgroundImage = 'url(' + src + ')';
      slide.classList.remove('no-image');
    };
    img.onerror = function () {
      slide.classList.add('no-image');
    };
    slide.classList.add('no-image');
    img.src = src;
  });

  function showHelperOnce() {
    if (sessionStorage.getItem('peach2026-helper-shown')) return;
    swipeTip.classList.remove('show');
    void swipeTip.offsetWidth;
    swipeTip.classList.add('show');
    sessionStorage.setItem('peach2026-helper-shown', '1');
  }

  slides[0].classList.add('active');
  updateUi();
  syncFullscreenState();
  showHelperOnce();
})();

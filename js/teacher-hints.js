/**
 * Teacher Hints Toggle
 * Small icon in top-right corner, default OFF.
 * Clicking shows/hides semi-transparent overlay with teacher guidance.
 */
(function () {
  let hintsVisible = false;
  const btn = document.getElementById('teacher-hint-toggle');
  const allHints = document.querySelectorAll('.teacher-hint');

  function updateVisibility() {
    allHints.forEach(h => {
      h.style.display = hintsVisible ? 'block' : 'none';
    });
    btn.classList.toggle('active', hintsVisible);
    btn.setAttribute('aria-pressed', hintsVisible);
    btn.title = hintsVisible ? '隐藏老师提示' : '显示老师提示';
  }

  btn.addEventListener('click', function () {
    hintsVisible = !hintsVisible;
    updateVisibility();
  });

  // Ensure hints are hidden on load
  updateVisibility();
})();

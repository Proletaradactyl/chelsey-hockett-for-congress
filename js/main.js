function toggleIssue(btn) {
  const body = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  if (isOpen) {
    btn.classList.remove('open');
    body.classList.remove('open');
  } else {
    btn.classList.add('open');
    body.classList.add('open');
  }
}

document.querySelectorAll('.issue-pill').forEach(pill => {
  pill.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.issue-pill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      setTimeout(() => {
        window.scrollBy({ top: -140, behavior: 'smooth' });
      }, 350);
      const header = target.querySelector('.issue-header');
      if (!header.classList.contains('open')) {
        header.classList.add('open');
        header.nextElementSibling.classList.add('open');
      }
    }
  });
});
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
  pill.addEventListener('click', function() {
    document.querySelectorAll('.issue-pill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
  });
});
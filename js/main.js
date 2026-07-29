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

/* curator-feed-default-feed-layout */
(function () {
  var i, e, d = document, s = 'script';
  i = d.createElement('script');
  i.async = 1;
  i.charset = 'UTF-8';
  i.src = 'https://cdn.curator.io/published/8c7d7601-cf77-4348-b12d-25fc4543a5f3.js';
  e = d.getElementsByTagName(s)[0];
  e.parentNode.insertBefore(i, e);
})();
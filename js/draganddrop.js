const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const feed = document.getElementById('feed');
const emptyState = document.getElementById('emptyState');
const countLabel = document.getElementById('countLabel');

let posts = [];

function updateCount() {
  countLabel.textContent = posts.length === 1 ? '1 post' : `${posts.length} posts`;
  emptyState.style.display = posts.length ? 'none' : 'block';
}

function formatTime(date) {
  return date.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function addFiles(fileList) {
  const files = Array.from(fileList).filter(
    f => f.type.startsWith('image/') || f.type === 'application/pdf'
  );
  files.forEach(file => {
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    const isPdf = file.type === 'application/pdf';
    const post = { id, url, name: file.name, time: new Date(), isPdf };
    posts.unshift(post);
    renderPost(post);
  });
  updateCount();
}

function renderPost(post) {
  const el = document.createElement('div');
  el.className = 'feed-post';
  el.dataset.id = post.id;

  const mediaHtml = post.isPdf
    ? `<a class="feed-post-pdf" href="${post.url}" target="_blank" rel="noopener">
         <div class="pdf-icon"><i class="fa-solid fa-file-pdf"></i></div>
         <div>
           <div class="pdf-label">${post.name}</div>
           <div class="pdf-sub">PDF · click to open</div>
         </div>
       </a>`
    : `<img src="${post.url}" alt="${post.name}" />`;

  el.innerHTML = `
    <div class="feed-post-photo">${mediaHtml}</div>
    <div class="feed-post-body">
      <div class="feed-post-meta">
        <span><span class="filename">${post.name}</span> · ${formatTime(post.time)}</span>
        <button class="remove" title="Remove post"><i class="fa-solid fa-xmark"></i> Remove</button>
      </div>
      <textarea class="feed-caption" rows="2" placeholder="Add a caption..."></textarea>
    </div>
  `;

  el.querySelector('.remove').addEventListener('click', () => {
    posts = posts.filter(p => p.id !== post.id);
    el.remove();
    updateCount();
  });

  if (feed.firstChild) {
    feed.insertBefore(el, feed.firstChild);
  } else {
    feed.appendChild(el);
  }
}

dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => addFiles(e.target.files));

['dragenter', 'dragover'].forEach(evt =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  })
);

['dragleave', 'drop'].forEach(evt =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  })
);

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  addFiles(e.dataTransfer.files);
});

updateCount();
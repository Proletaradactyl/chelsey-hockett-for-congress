// ---- Supabase setup ----
const SUPABASE_URL = 'https://mzijgpbtnbzzbwdynwge.supabase.co';
const SUPABASE_KEY = 'sb_publishable_roMVayVTjvOqORdc172csg_VuWJHw6j';
const BUCKET = 'team-photos';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- Elements ----
const teamLoginBtn = document.getElementById('teamLoginBtn');
const loginGate = document.getElementById('loginGate');
const teamEmailInput = document.getElementById('teamEmailInput');
const teamPasswordInput = document.getElementById('teamPasswordInput');
const teamPasswordSubmit = document.getElementById('teamPasswordSubmit');
const teamLoginCancel = document.getElementById('teamLoginCancel');
const loginGateError = document.getElementById('loginGateError');

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const feed = document.getElementById('feed');
const emptyState = document.getElementById('emptyState');
const countLabel = document.getElementById('countLabel');

let currentUser = null;

// ---- Auth ----
function setUnlocked(isUnlocked) {
  document.body.classList.toggle('unlocked', isUnlocked);
  teamLoginBtn.innerHTML = isUnlocked
    ? '<i class="fa-solid fa-lock-open"></i> Log Out'
    : '<i class="fa-solid fa-lock"></i> Team Login';
}

function openGate() {
  loginGateError.style.display = 'none';
  teamEmailInput.value = '';
  teamPasswordInput.value = '';
  loginGate.classList.add('open');
  teamEmailInput.focus();
}

function closeGate() {
  loginGate.classList.remove('open');
}

teamLoginBtn.addEventListener('click', async () => {
  if (currentUser) {
    await supabaseClient.auth.signOut();
  } else {
    openGate();
  }
});

teamLoginCancel.addEventListener('click', closeGate);

teamPasswordSubmit.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: teamEmailInput.value,
    password: teamPasswordInput.value,
  });
  if (error) {
    loginGateError.textContent = error.message;
    loginGateError.style.display = 'block';
  } else {
    closeGate();
  }
});

[teamEmailInput, teamPasswordInput].forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') teamPasswordSubmit.click();
  });
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  setUnlocked(!!currentUser);
  renderAllPosts(); // re-render so remove buttons show/hide correctly
});

// ---- Feed rendering ----
let posts = [];

function updateCount() {
  countLabel.textContent = posts.length === 1 ? '1 post' : `${posts.length} posts`;
  emptyState.style.display = posts.length ? 'none' : 'block';
}

function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function renderAllPosts() {
  feed.querySelectorAll('.feed-post').forEach(el => el.remove());
  posts.forEach(post => renderPost(post));
  updateCount();
}

function renderPost(post) {
  const el = document.createElement('div');
  el.className = 'feed-post';
  el.dataset.id = post.id;

  const mediaHtml = post.is_pdf
    ? `<a class="feed-post-pdf" href="${post.file_url}" target="_blank" rel="noopener">
         <div class="pdf-icon"><i class="fa-solid fa-file-pdf"></i></div>
         <div>
           <div class="pdf-label">${post.file_name}</div>
           <div class="pdf-sub">PDF · click to open</div>
         </div>
       </a>`
    : `<img src="${post.file_url}" alt="${post.file_name}" />`;

  el.innerHTML = `
    <div class="feed-post-photo">${mediaHtml}</div>
    <div class="feed-post-body">
      <div class="feed-post-meta">
        <span><span class="filename">${post.file_name}</span> · ${formatTime(post.created_at)}</span>
        <button class="remove" title="Remove post"><i class="fa-solid fa-xmark"></i> Remove</button>
      </div>
      <textarea class="feed-caption" rows="2" placeholder="Add a caption...">${post.caption || ''}</textarea>
    </div>
  `;

  el.querySelector('.remove').addEventListener('click', () => removePost(post));

  const captionEl = el.querySelector('.feed-caption');
  captionEl.addEventListener('blur', () => updateCaption(post, captionEl.value));

  feed.appendChild(el);
}

// ---- Load + subscribe ----
async function loadPosts() {
  const { data, error } = await supabaseClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load posts', error);
    return;
  }
  posts = data;
  renderAllPosts();
}

supabaseClient
  .channel('posts-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
    loadPosts();
  })
  .subscribe();

// ---- Upload ----
async function addFiles(fileList) {
  if (!currentUser) return;

  const files = Array.from(fileList).filter(
    f => f.type.startsWith('image/') || f.type === 'application/pdf'
  );

  for (const file of files) {
    const isPdf = file.type === 'application/pdf';
    const path = `${currentUser.id}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET)
      .upload(path, file);

    if (uploadError) {
      console.error('Upload failed', uploadError);
      continue;
    }

    const { data: urlData } = supabaseClient.storage.from(BUCKET).getPublicUrl(path);

    const { error: insertError } = await supabaseClient.from('posts').insert({
      file_url: urlData.publicUrl,
      file_name: file.name,
      is_pdf: isPdf,
      storage_path: path,
      uploaded_by: currentUser.id,
    });

    if (insertError) console.error('Insert failed', insertError);
  }
  // loadPosts() runs automatically via the realtime subscription above
}

// ---- Remove ----
async function removePost(post) {
  if (!currentUser) return;
  if (post.storage_path) {
    await supabaseClient.storage.from(BUCKET).remove([post.storage_path]);
  }
  const { error } = await supabaseClient.from('posts').delete().eq('id', post.id);
  if (error) console.error('Delete failed', error);
}

// ---- Caption editing ----
async function updateCaption(post, newCaption) {
  if (!currentUser || newCaption === (post.caption || '')) return;
  const { error } = await supabaseClient
    .from('posts')
    .update({ caption: newCaption })
    .eq('id', post.id);
  if (error) console.error('Caption update failed', error);
}

// ---- Dropzone wiring ----
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

// ---- Init ----
loadPosts();
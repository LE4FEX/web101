// ธีม
const root = document.documentElement;
const themeBtn = document.getElementById('toggleTheme');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  root.classList.add('dark');
  themeBtn?.setAttribute('aria-pressed', 'true');
}
themeBtn?.addEventListener('click', () => {
  const isDark = root.classList.toggle('dark');
  themeBtn.setAttribute('aria-pressed', String(isDark));
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// TODO list base
const form  = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const list  = document.getElementById('todoList');

// ตัวกรองสถานะ
const filtersEl = document.getElementById('filters');
let filter = localStorage.getItem('filter') || 'all';

// ค้นหา
const searchInput = document.getElementById('searchInput');
let searchTerm = '';

// แถบเครื่องมือใหม่
const countEl    = document.getElementById('count');
const clearBtn   = document.getElementById('clearDone');
const sortSelect = document.getElementById('sortSelect');
let sortBy = localStorage.getItem('sortBy') || 'newest';
if (sortSelect) sortSelect.value = sortBy;

// โหลดรายการ
let todos = JSON.parse(localStorage.getItem('todos') || '[]');

// === events ===
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  todos.push({ id: crypto.randomUUID(), title, done: false, createdAt: Date.now() });
  input.value = '';
  save(); render();
});

list?.addEventListener('click', (e) => {
  const item = e.target.closest('.todo');
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.matches('.toggle')) {
    const t = todos.find(x => x.id === id);
    if (t) t.done = !t.done;
  } else if (e.target.matches('.remove')) {
    todos = todos.filter(x => x.id !== id);
  }
  save(); render();
});

filtersEl?.addEventListener('change', (e) => {
  const target = e.target;
  if (target.name === 'filter') {
    filter = target.value;
    localStorage.setItem('filter', filter);
    render();
  }
});

// ตั้งค่า radio ให้ตรงค่าที่จำไว้
filtersEl && [...filtersEl.querySelectorAll('input[name="filter"]')].forEach(r => {
  r.checked = (r.value === filter);
});

searchInput?.addEventListener('input', (e) => {
  searchTerm = e.target.value.toLowerCase();
  render();
});

sortSelect?.addEventListener('change', (e) => {
  sortBy = e.target.value;                 // 'newest'|'oldest'|'az'|'za'
  localStorage.setItem('sortBy', sortBy);
  render();
});

clearBtn?.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save(); render();
});

// === render & helpers ===
function render() {
  // กรองตามสถานะ
  let filtered = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done')   return  t.done;
    return true;
  });

  // กรองตามคำค้น
  if (searchTerm) {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm));
  }

  // จัดเรียง
  filtered.sort((a, b) => {
    if (sortBy === 'newest') return b.createdAt - a.createdAt;
    if (sortBy === 'oldest') return a.createdAt - b.createdAt;
    if (sortBy === 'az')     return a.title.localeCompare(b.title, 'th');
    if (sortBy === 'za')     return b.title.localeCompare(a.title, 'th');
    return 0;
  });

  // นับงานคงเหลือ และสถานะปุ่มลบงานเสร็จ
  const remaining = todos.filter(t => !t.done).length;
  if (countEl) countEl.textContent = `${remaining} งานที่ยังไม่เสร็จ`;
  if (clearBtn) clearBtn.disabled = todos.every(t => !t.done);

  // วาดผลลัพธ์
  if (filtered.length === 0) {
    list.innerHTML = '<li style="opacity:.6;padding:.5rem">ไม่พบงาน</li>';
    return;
  }

  list.innerHTML = filtered.map(t => `
    <li class="todo" data-id="${t.id}">
      <span ${t.done ? 'style="text-decoration:line-through;opacity:.6"' : ''}>
        ${escapeHtml(t.title)}
      </span>
      <button class="toggle" aria-label="toggle">${t.done ? 'ยกเลิก' : 'สลับ'}</button>
      <button class="remove" aria-label="remove">ลบ</button>
    </li>
  `).join('');
}

function save() { localStorage.setItem('todos', JSON.stringify(todos)); }

function escapeHtml(str) {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

// เรนเดอร์ครั้งแรก
render();
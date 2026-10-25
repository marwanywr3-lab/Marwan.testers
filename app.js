// إدارة وحفظ التطبيقات في LocalStorage
const STORAGE_KEY = 'marwan_play_testers_apps';

const form = document.getElementById('add-app-form');
const appNameInput = document.getElementById('app-name');
const startDateInput = document.getElementById('start-date');
const appsListContainer = document.getElementById('apps-list');

// ضبط التاريخ الافتراضي لليوم
startDateInput.value = new Date().toISOString().split('T')[0];

function getStoredApps() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveApps(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(dateObj) {
  return dateObj.toLocaleDateString('ar-EG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function calculateCheckpoints(startDateStr) {
  const start = new Date(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // اليوم 1 هو تاريخ البداية
  // اليوم 3 = البداية + 2 يوم
  // اليوم 7 = البداية + 6 أيام
  // اليوم 12 = البداية + 11 يوم
  // انتهاء فترة الـ 14 يوماً = البداية + 14 يوم
  const checkpoints = [
    { label: 'اليوم 3 (تجربة أولى)', date: addDays(startDateStr, 2) },
    { label: 'اليوم 7 (منتصف المدة)', date: addDays(startDateStr, 6) },
    { label: 'اليوم 12 (فحص نهائي)', date: addDays(startDateStr, 11) }
  ];

  const endDate = addDays(startDateStr, 14);

  const formattedCheckpoints = checkpoints.map(cp => {
    const cpDate = new Date(cp.date);
    cpDate.setHours(0, 0, 0, 0);

    let statusText = 'قادم';
    let statusClass = 'status-upcoming';

    if (cpDate.getTime() === today.getTime()) {
      statusText = '⚡ يلزم التجربة اليوم!';
      statusClass = 'status-today';
    } else if (cpDate.getTime() < today.getTime()) {
      statusText = '✓ تم الموعد';
      statusClass = 'status-done';
    }

    return {
      label: cp.label,
      dateString: formatDate(cp.date),
      statusText,
      statusClass
    };
  });

  return {
    endDateFormatted: formatDate(endDate),
    checkpoints: formattedCheckpoints
  };
}

function renderApps() {
  const apps = getStoredApps();
  appsListContainer.innerHTML = '';

  if (apps.length === 0) {
    appsListContainer.innerHTML = `
      <div class="empty-state">
        لا توجد تطبيقات مسجلة حالياً. أضف أول تطبيق لبدء المتابعة وتذكيرك بمواعيد الاختبار.
      </div>
    `;
    return;
  }

  apps.forEach((app, index) => {
    const details = calculateCheckpoints(app.startDate);

    const appCard = document.createElement('div');
    appCard.className = 'app-card';

    appCard.innerHTML = `
      <div class="app-header">
        <span class="app-name">${escapeHTML(app.name)}</span>
        <button class="btn-delete" onclick="deleteApp(${index})">حذف التطبيق</button>
      </div>

      <div class="date-meta">
        <div><strong>تاريخ البدء:</strong> ${formatDate(new Date(app.startDate))}</div>
        <div><strong>تاريخ الانتهاء (14 يوم):</strong> ${details.endDateFormatted}</div>
      </div>

      <div class="timeline-title">مواعيد الفحص والتجربة المطلوبة:</div>
      <div class="checkpoints">
        ${details.checkpoints.map(cp => `
          <div class="checkpoint-item">
            <span class="checkpoint-day">${cp.label}</span>
            <span class="checkpoint-date">${cp.dateString}</span>
            <span class="checkpoint-status ${cp.statusClass}">${cp.statusText}</span>
          </div>
        `).join('')}
      </div>
    `;

    appsListContainer.appendChild(appCard);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

window.deleteApp = function(index) {
  const apps = getStoredApps();
  apps.splice(index, 1);
  saveApps(apps);
  renderApps();
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = appNameInput.value.trim();
  const startDate = startDateInput.value;

  if (!name || !startDate) return;

  const apps = getStoredApps();
  apps.unshift({ name, startDate });
  saveApps(apps);

  appNameInput.value = '';
  renderApps();
});

// العرض الأولي عند الفتح
renderApps();

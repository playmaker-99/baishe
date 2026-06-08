// shared.js - Shared UI Logic for Learner Journal

document.addEventListener('DOMContentLoaded', function () {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }

  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const openSidebarBtn = document.getElementById('open-sidebar');
  const closeSidebarBtn = document.getElementById('close-sidebar');

  if (openSidebarBtn && sidebar) {
    openSidebarBtn.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full');
      if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');
    });
  }

  if ((closeSidebarBtn || sidebarOverlay) && sidebar) {
    const closeFn = () => {
      sidebar.classList.add('-translate-x-full');
      if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
    };
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeFn);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeFn);
  }

  syncSharedUI();
  window.addEventListener('dbUpdated', syncSharedUI);
  initNotifications();
});

function syncSharedUI() {
  if (typeof DB === 'undefined') return;
  const profile = DB.getProfile();

  const sbAvatar = document.getElementById('sb-avatar');
  const sbAvatarImg = document.getElementById('sb-avatar-img');
  const sbName = document.getElementById('sb-name');
  const sbEmail = document.getElementById('sb-email');
  const sbLevel = document.getElementById('sb-level');
  const sbStreak = document.getElementById('sb-streak');
  const sbXPBar = document.getElementById('sb-xp-bar');
  const sbXPText = document.getElementById('sb-xp-text');

  if (sbAvatarImg && profile.avatar) sbAvatarImg.src = profile.avatar;
  if (sbAvatar && !profile.avatar) sbAvatar.innerText = profile.name.split(' ').map(n => n[0]).join('');
  if (sbName) sbName.innerText = profile.name;
  if (sbEmail) sbEmail.innerText = profile.email;
  if (sbLevel) sbLevel.innerText = `Lvl ${profile.level}`;
  if (sbStreak) sbStreak.innerText = profile.streak;

  if (sbXPBar && sbXPText) {
    const currentXPInLevel = profile.xp % 1000;
    const progressPercent = (currentXPInLevel / 1000) * 100;
    sbXPBar.style.width = `${progressPercent}%`;
    sbXPText.innerText = `${currentXPInLevel}/1000 XP`;
  }

  const hdAvatarImg = document.getElementById('hd-avatar-img');
  const hdStreak = document.getElementById('hd-streak');
  if (hdAvatarImg && profile.avatar) hdAvatarImg.src = profile.avatar;
  if (hdStreak) hdStreak.innerText = profile.streak;
}

function initNotifications() {
  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const notifCount = document.getElementById('notif-count');

  if (!notifBtn || !notifDropdown) return;

  notifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    notifDropdown.classList.toggle('hidden');
    if (!notifDropdown.classList.contains('hidden') && typeof DB !== 'undefined') {
      DB.markNotificationsAsRead();
      if (notifCount) notifCount.classList.add('hidden');
    }
  });

  document.addEventListener('click', () => notifDropdown.classList.add('hidden'));
  notifDropdown.addEventListener('click', e => e.stopPropagation());

  renderNotifications();
  window.addEventListener('dbUpdated', renderNotifications);
}

function renderNotifications() {
  if (typeof DB === 'undefined') return;
  
  const notifCount = document.getElementById('notif-count');
  const notifList = document.getElementById('notif-list');
  if (!notifList) return;

  const notifications = DB.getNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifCount) {
    if (unreadCount > 0) {
      notifCount.innerText = unreadCount;
      notifCount.classList.remove('hidden');
    } else {
      notifCount.classList.add('hidden');
    }
  }

  if (notifications.length === 0) {
    notifList.innerHTML = `
      <div class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
        <i data-lucide="bell-off" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-xs">No notifications yet</p>
      </div>
    `;
  } else {
    notifList.innerHTML = notifications.slice(0, 5).map(n => `
      <div class="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}">
        <div class="flex justify-between items-start gap-2">
          <p class="font-medium text-gray-900 dark:text-gray-100 text-xs">${n.title}</p>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">${n.time}</span>
        </div>
        <p class="text-[11px] text-gray-600 dark:text-gray-400 mt-1 leading-snug">${n.message}</p>
      </div>
    `).join('');
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.showAlert = function(title, message, type = 'success') {
  const container = document.getElementById('alert-container');
  if (!container) {
    const div = document.createElement('div');
    div.id = 'alert-container';
    div.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4';
    document.body.appendChild(div);
  }
  
  const alertId = 'alert-' + Date.now();
  const alertDiv = document.createElement('div');
  alertDiv.id = alertId;
  
  let bgClass = 'bg-white dark:bg-gray-900 border-emerald-500 dark:border-emerald-500';
  let iconName = 'check-circle';
  let iconColor = 'text-emerald-500';
  
  if (type === 'error') {
    bgClass = 'bg-white dark:bg-gray-900 border-rose-500 dark:border-rose-500';
    iconName = 'alert-circle';
    iconColor = 'text-rose-500';
  } else if (type === 'info') {
    bgClass = 'bg-white dark:bg-gray-900 border-indigo-500 dark:border-indigo-500';
    iconName = 'info';
    iconColor = 'text-indigo-500';
  }
  
  alertDiv.className = `flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg ${bgClass} transform translate-y-2 opacity-0 transition-all duration-300`;
  alertDiv.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 ${iconColor} shrink-0 mt-0.5"></i>
    <div class="flex-1 min-w-0">
      <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">${title}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${message}</p>
    </div>
    <button onclick="document.getElementById('${alertId}').remove()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;
  
  document.getElementById('alert-container').appendChild(alertDiv);
  if (typeof lucide !== 'undefined') lucide.createIcons();
  
  setTimeout(() => alertDiv.classList.remove('translate-y-2', 'opacity-0'), 10);
  
  setTimeout(() => {
    alertDiv.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
};
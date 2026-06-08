// settings.js - Settings Logic

document.addEventListener('DOMContentLoaded', function () {
  initSettings();

  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('prof-name').value.trim();
      const email = document.getElementById('prof-email').value.trim();
      const bio = document.getElementById('prof-bio').value.trim();
      const avatar = document.getElementById('prof-avatar-url').value.trim();

      if (!name || !email) return;
      DB.updateProfile({ name, email, bio, avatar });
      window.showAlert("Profile Saved!", "Your profile details have been updated.", "success");
    });
  }

  const customAvatarInput = document.getElementById('prof-avatar-url');
  if (customAvatarInput) {
    customAvatarInput.addEventListener('input', () => clearAvatarSelections());
  }
});

function initSettings() {
  if (typeof DB === 'undefined') return;
  const profile = DB.getProfile();

  document.getElementById('prof-name').value = profile.name;
  document.getElementById('prof-email').value = profile.email;
  document.getElementById('prof-bio').value = profile.bio || "";
  document.getElementById('prof-avatar-url').value = profile.avatar || "";

  const pickerContainer = document.getElementById('avatar-picker-container');
  if (pickerContainer && profile.avatar) {
    const images = pickerContainer.querySelectorAll('img');
    images.forEach(img => {
      if (img.src === profile.avatar) {
        img.classList.remove('ring-transparent');
        img.classList.add('ring-indigo-600', 'scale-105');
      }
    });
  }

  syncThemeCardHighlights();
}

window.selectAvatar = function (el) {
  clearAvatarSelections();
  el.classList.remove('ring-transparent');
  el.classList.add('ring-indigo-600', 'scale-105');
  const customInput = document.getElementById('prof-avatar-url');
  if (customInput) customInput.value = el.src;
};

function clearAvatarSelections() {
  const pickerContainer = document.getElementById('avatar-picker-container');
  if (pickerContainer) {
    const images = pickerContainer.querySelectorAll('img');
    images.forEach(img => {
      img.classList.remove('ring-indigo-600', 'scale-105');
      img.classList.add('ring-transparent');
    });
  }
}

function syncThemeCardHighlights() {
  const isDark = document.documentElement.classList.contains('dark');
  const lightCard = document.getElementById('theme-card-light');
  const darkCard = document.getElementById('theme-card-dark');

  if (!lightCard || !darkCard) return;

  if (isDark) {
    darkCard.classList.remove('border-slate-200');
    darkCard.classList.add('border-indigo-500', 'bg-indigo-500/5');
    darkCard.querySelector('.theme-check-dot').innerHTML = '<div class="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>';

    lightCard.classList.add('border-slate-200');
    lightCard.classList.remove('border-indigo-500', 'bg-indigo-500/5');
    lightCard.querySelector('.theme-check-dot').innerHTML = '';
  } else {
    lightCard.classList.remove('border-slate-200');
    lightCard.classList.add('border-indigo-500', 'bg-indigo-500/5');
    lightCard.querySelector('.theme-check-dot').innerHTML = '<div class="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>';

    darkCard.classList.add('border-slate-200');
    darkCard.classList.remove('border-indigo-500', 'bg-indigo-500/5');
    darkCard.querySelector('.theme-check-dot').innerHTML = '';
  }
}

window.setAppTheme = function (theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
  syncThemeCardHighlights();
};

window.exportDatabaseFile = function () {
  const dbData = localStorage.getItem('learner_journal_db');
  if (!dbData) return;

  const dataBlob = new Blob([dbData], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `mindflow_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
  window.showAlert("Database Exported!", "mindflow_backup.json downloaded successfully.", "success");
};

window.importDatabaseFile = function (input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && parsed.profile && parsed.journalEntries && parsed.skills) {
        localStorage.setItem('learner_journal_db', JSON.stringify(parsed));
        window.showAlert("Database Restored!", "Data synchronized. Reloading...", "success");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        window.showAlert("Invalid Format", "Backup JSON is missing fields.", "error");
      }
    } catch (err) {
      window.showAlert("Failed to parse JSON", "Verify the file is formatted correctly.", "error");
    }
  };
  reader.readAsText(file);
};

window.confirmSystemWipe = function () {
  if (confirm("Delete all logged study sessions, goals, entries, and progress permanently?")) {
    DB.clearAllData();
    window.showAlert("Wiping memories...", "Restoring template defaults...", "info");
    setTimeout(() => window.location.reload(), 1500);
  }
};
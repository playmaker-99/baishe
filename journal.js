// journal.js - Journal Screen Logic

let activeCategoryId = "all";
let activeSearchQuery = "";
let selectedEntryId = null;

document.addEventListener('DOMContentLoaded', function () {
  initJournal();

  const newEntryBtn = document.getElementById('new-entry-btn');
  if (newEntryBtn) newEntryBtn.addEventListener('click', openEditorForNew);

  const cancelEditorBtn = document.getElementById('cancel-editor-btn');
  if (cancelEditorBtn) cancelEditorBtn.addEventListener('click', closeEditor);

  const saveEntryBtnTrigger = document.getElementById('save-entry-btn-trigger');
  if (saveEntryBtnTrigger) saveEntryBtnTrigger.addEventListener('click', handleSaveEntry);

  const closeReaderBtn = document.getElementById('close-reader-btn');
  if (closeReaderBtn) closeReaderBtn.addEventListener('click', hideContentDisplayMobile);

  const editEntryBtn = document.getElementById('edit-entry-btn');
  if (editEntryBtn) editEntryBtn.addEventListener('click', editSelectedEntry);

  const deleteEntryBtn = document.getElementById('delete-entry-btn');
  if (deleteEntryBtn) deleteEntryBtn.addEventListener('click', deleteSelectedEntry);

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      activeSearchQuery = e.target.value.toLowerCase().trim();
      renderEntriesList();
    });
  }

  const catPills = document.querySelectorAll('#category-filter-container .cat-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', function () {
      catPills.forEach(p => p.classList.remove('active', 'bg-indigo-600', 'text-white'));
      catPills.forEach(p => p.classList.add('bg-slate-50', 'text-slate-600', 'dark:bg-zinc-800'));
      this.classList.add('active', 'bg-indigo-600', 'text-white');
      this.classList.remove('bg-slate-50', 'text-slate-600', 'dark:bg-zinc-800');
      activeCategoryId = this.innerText.toLowerCase().trim();
      renderEntriesList();
    });
  });

  window.addEventListener('dbUpdated', () => {
    renderEntriesList();
    if (selectedEntryId) renderReaderView(selectedEntryId);
  });
});

function initJournal() {
  renderEntriesList();
  const urlParams = new URLSearchParams(window.location.search);
  const newTrigger = urlParams.get('new');
  const viewId = urlParams.get('view');

  if (newTrigger === 'true') {
    openEditorForNew();
  } else if (viewId) {
    viewEntry(viewId);
  } else {
    const entries = DB.getJournalEntries();
    if (entries.length > 0 && window.innerWidth >= 1024) {
      viewEntry(entries[0].id);
    }
  }
}

function renderEntriesList() {
  const journalList = document.getElementById('journal-list');
  if (!journalList) return;

  const entries = DB.getJournalEntries();
  let filtered = entries;

  if (activeCategoryId !== "all") {
    filtered = entries.filter(e => e.category.toLowerCase().trim() === activeCategoryId);
  }

  if (activeSearchQuery !== "") {
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(activeSearchQuery) || 
      e.content.toLowerCase().includes(activeSearchQuery) || 
      e.tags.some(t => t.toLowerCase().includes(activeSearchQuery))
    );
  }

  if (filtered.length === 0) {
    journalList.innerHTML = `<div class="p-8 text-center text-slate-400"><p class="text-xs font-semibold">No journal entries found</p></div>`;
    return;
  }

  const moodEmojis = { excited: "🤩", focused: "🤓", thoughtful: "🤔", tired: "🥱", happy: "😊", stressed: "🤯" };

  journalList.innerHTML = filtered.map(entry => {
    const isSelected = entry.id === selectedEntryId;
    const moodEmoji = moodEmojis[entry.mood] || "✍️";
    const contentSnippet = entry.content.replace(/[#*`]/g, '').slice(0, 75) + (entry.content.length > 75 ? "..." : "");
    
    return `
      <div onclick="viewEntry('${entry.id}')" class="p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-zinc-800/40 border-l-4 ${
        isSelected ? 'bg-white dark:bg-zinc-800/60 border-indigo-600' : 'border-transparent bg-transparent'
      }">
        <div class="flex justify-between items-start gap-2.5">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 text-[9px] font-bold rounded-md">${entry.category}</span>
              <span class="text-[9px] text-slate-400 font-semibold">${entry.date}</span>
            </div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate ${isSelected ? 'text-indigo-600' : ''}">${entry.title}</h4>
          </div>
          <span class="text-base p-1 shrink-0 bg-slate-100 dark:bg-zinc-800 rounded-lg">${moodEmoji}</span>
        </div>
        <p class="text-[11px] text-slate-500 leading-normal mt-1.5">${contentSnippet}</p>
        <div class="flex items-center gap-1 mt-2.5 flex-wrap">
          ${entry.tags.map(t => `<span class="text-[8px] text-slate-500 font-semibold bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded-md">#${t}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function viewEntry(id) {
  selectedEntryId = id;
  renderEntriesList();

  document.getElementById('reader-empty-state').classList.add('hidden');
  document.getElementById('editor-view').classList.add('hidden');
  document.getElementById('reader-view').classList.remove('hidden');

  const displayPanel = document.getElementById('content-display-panel');
  if (displayPanel) displayPanel.classList.remove('translate-x-full');

  renderReaderView(id);
}

function hideContentDisplayMobile() {
  const displayPanel = document.getElementById('content-display-panel');
  if (displayPanel) displayPanel.classList.add('translate-x-full');
}

function renderReaderView(id) {
  const entries = DB.getJournalEntries();
  const entry = entries.find(e => e.id === id);
  if (!entry) {
    document.getElementById('reader-view').classList.add('hidden');
    document.getElementById('reader-empty-state').classList.remove('hidden');
    return;
  }

  const moodEmojis = { excited: "🤩", focused: "🤓", thoughtful: "🤔", tired: "🥱", happy: "😊", stressed: "🤯" };

  document.getElementById('read-title').innerText = entry.title;
  document.getElementById('read-category').innerText = entry.category;
  document.getElementById('read-date-text').innerText = entry.date;
  document.getElementById('read-duration-text').innerText = `${entry.timeSpent} mins study logged`;
  document.getElementById('read-mood-text').innerText = entry.mood;
  document.getElementById('read-mood').querySelector('span:first-child').innerText = moodEmojis[entry.mood] || "✍️";

  document.getElementById('read-content').innerHTML = parseMarkdown(entry.content);

  const tagsContainer = document.getElementById('read-tags');
  if (entry.tags && entry.tags.length > 0) {
    tagsContainer.innerHTML = entry.tags.map(t => `
      <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded-lg">#${t}</span>
    `).join('');
  } else {
    tagsContainer.innerHTML = `<span class="text-xs text-slate-400">No tags.</span>`;
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function parseMarkdown(text) {
  if (!text) return "";
  let escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  escaped = escaped.replace(/^#\s+(.+)$/gm, '<h3 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>');
  escaped = escaped.replace(/^##\s+(.+)$/gm, '<h4 class="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5">$1</h4>');
  escaped = escaped.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 my-2 bg-slate-50 italic text-xs">$1</blockquote>');
  escaped = escaped.replace(/^\-\s+(.+)$/gm, '<li class="list-disc list-inside ml-2 py-0.5 text-xs">$1</li>');
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-zinc-800 text-rose-500 font-mono text-xs px-1.5 py-0.5 rounded-md">$1</code>');
  return escaped;
}

function openEditorForNew() {
  selectedEntryId = null;
  document.getElementById('entry-id').value = "";
  document.getElementById('entry-title').value = "";
  document.getElementById('entry-category').value = "Technical";
  document.getElementById('entry-duration').value = "";
  document.getElementById('entry-tags').value = "";
  document.getElementById('entry-content').value = "";
  
  const radios = document.getElementsByName('mood-radio');
  radios.forEach(r => { if (r.value === 'focused') r.checked = true; });

  document.getElementById('editor-action-title').innerText = "Create New Log";
  document.getElementById('reader-empty-state').classList.add('hidden');
  document.getElementById('reader-view').classList.add('hidden');
  document.getElementById('editor-view').classList.remove('hidden');

  const displayPanel = document.getElementById('content-display-panel');
  if (displayPanel) displayPanel.classList.remove('translate-x-full');
}

function closeEditor() {
  document.getElementById('editor-view').classList.add('hidden');
  if (selectedEntryId) {
    document.getElementById('reader-view').classList.remove('hidden');
  } else {
    document.getElementById('reader-empty-state').classList.remove('hidden');
    hideContentDisplayMobile();
  }
}

function editSelectedEntry() {
  if (!selectedEntryId) return;
  const entries = DB.getJournalEntries();
  const entry = entries.find(e => e.id === selectedEntryId);
  if (!entry) return;

  document.getElementById('entry-id').value = entry.id;
  document.getElementById('entry-title').value = entry.title;
  document.getElementById('entry-category').value = entry.category;
  document.getElementById('entry-duration').value = entry.timeSpent;
  document.getElementById('entry-tags').value = entry.tags.join(', ');
  document.getElementById('entry-content').value = entry.content;

  const radios = document.getElementsByName('mood-radio');
  radios.forEach(r => { if (r.value === entry.mood) r.checked = true; });

  document.getElementById('editor-action-title').innerText = "Edit Journal Log";
  document.getElementById('reader-view').classList.add('hidden');
  document.getElementById('editor-view').classList.remove('hidden');
}

function deleteSelectedEntry() {
  if (!selectedEntryId) return;
  if (confirm("Delete this entry permanently?")) {
    DB.deleteJournalEntry(selectedEntryId);
    window.showAlert("Entry Deleted", "The entry was successfully removed.", "info");
    selectedEntryId = null;
    renderEntriesList();
    document.getElementById('reader-view').classList.add('hidden');
    document.getElementById('reader-empty-state').classList.remove('hidden');
    if (window.innerWidth < 1024) hideContentDisplayMobile();
  }
}

function handleSaveEntry() {
  const id = document.getElementById('entry-id').value;
  const title = document.getElementById('entry-title').value.trim();
  const category = document.getElementById('entry-category').value;
  const durationStr = document.getElementById('entry-duration').value;
  const tagsStr = document.getElementById('entry-tags').value;
  const content = document.getElementById('entry-content').value.trim();

  if (!title || !durationStr || !content) {
    window.showAlert("Fields Missing", "Please provide a title, content, and learning duration.", "error");
    return;
  }

  const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
  let mood = 'focused';
  const radios = document.getElementsByName('mood-radio');
  for (const r of radios) { if (r.checked) { mood = r.value; break; } }

  const entryPayload = { title, category, timeSpent: Number(durationStr), tags, mood, content };

  if (id) {
    const updated = DB.updateJournalEntry(id, entryPayload);
    if (updated) {
      window.showAlert("Entry Updated!", "Your entry was successfully saved.", "success");
      viewEntry(id);
    }
  } else {
    const created = DB.addJournalEntry(entryPayload);
    if (created) {
      window.showAlert("Entry Saved!", "New reflection added! Earned +100 XP.", "success");
      viewEntry(created.id);
    }
  }
}

window.insertMD = function (prefix, suffix = "") {
  const textarea = document.getElementById('entry-content');
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const originalText = textarea.value;
  const selectedText = originalText.substring(start, end);
  textarea.value = originalText.substring(0, start) + prefix + selectedText + suffix + originalText.substring(end);
  textarea.focus();
  const newCursorPos = start + prefix.length + selectedText.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
};
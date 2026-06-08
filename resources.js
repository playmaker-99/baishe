// resources.js - Resource Hub Logic

let activeStatusFilter = "all";
let activeTypeFilter = "all";

document.addEventListener('DOMContentLoaded', function () {
  initResources();

  const form = document.getElementById('resource-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('res-title-input').value.trim();
      const url = document.getElementById('res-url-input').value.trim();
      const type = document.getElementById('res-type-input').value;
      const status = document.getElementById('res-status-input').value;
      const tagsStr = document.getElementById('res-tags-input').value;

      if (!title || !url) return;
      const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);

      DB.addResource({ title, url, type, status, tags });
      window.showAlert("Resource Bookmarked!", `Successfully saved: "${title}"`, "success");
      form.reset();
    });
  }

  window.addEventListener('dbUpdated', renderResourcesList);
});

function initResources() { renderResourcesList(); }

function renderResourcesList() {
  const container = document.getElementById('resources-grid');
  if (!container) return;

  const resources = DB.getResources();
  let filtered = resources;

  if (activeStatusFilter !== "all") {
    filtered = resources.filter(r => r.status.toLowerCase().trim() === activeStatusFilter.toLowerCase().trim());
  }

  if (activeTypeFilter !== "all") {
    filtered = filtered.filter(r => r.type.toLowerCase().trim() === activeTypeFilter.toLowerCase().trim());
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full p-12 text-center text-slate-400 border border-dashed rounded-3xl"><p class="text-xs">No matching bookmarks found</p></div>`;
    return;
  }

  const typeIcons = { "Book": "book", "Course": "graduation-cap", "Documentation": "file-text", "Article": "globe" };
  const statusTheme = {
    "Completed": "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30",
    "Reading": "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-950/30",
    "In Progress": "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-950/30"
  };

  container.innerHTML = filtered.map(res => {
    const iconName = typeIcons[res.type] || "bookmark";
    const bgBadgeClass = statusTheme[res.status] || "bg-slate-50 text-slate-500 border-slate-200";
    
    return `
      <div class="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4.5 rounded-2xl flex flex-col justify-between space-y-4">
        <div class="flex justify-between items-start gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shrink-0"><i data-lucide="${iconName}" class="w-5 h-5"></i></div>
            <div class="min-w-0">
              <h4 class="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">${res.title}</h4>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">${res.type}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <a href="${res.url}" target="_blank" class="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/50 text-slate-500 rounded-lg border transition-all cursor-pointer"><i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>
            <button onclick="confirmDeleteResource('${res.id}', '${res.title}')" class="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-300 hover:text-rose-500 rounded-lg cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${res.tags.map(t => `<span class="text-[9px] text-slate-500 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded-md">#${t}</span>`).join('')}
        </div>
        <div class="pt-3 border-t flex justify-between items-center gap-2">
          <span class="px-2.5 py-0.5 border text-[9px] font-extrabold uppercase rounded-lg tracking-wider ${bgBadgeClass}">${res.status}</span>
          <div class="flex items-center gap-1">
            <span class="text-[9px] font-bold text-slate-400 uppercase">Update:</span>
            <select onchange="updateStatusDirect('${res.id}', this.value)" class="text-[10px] font-semibold text-slate-600 dark:text-zinc-400 border bg-slate-50 dark:bg-zinc-800 rounded-lg px-2 py-1 focus:outline-none">
              <option value="In Progress" ${res.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Reading" ${res.status === 'Reading' ? 'selected' : ''}>Reading</option>
              <option value="Completed" ${res.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.filterResources = function (status) {
  activeStatusFilter = status;
  const pills = document.querySelectorAll('#resource-status-filters button');
  pills.forEach(p => { p.classList.remove('active', 'bg-indigo-600', 'text-white'); p.classList.add('bg-slate-50', 'text-slate-600', 'dark:bg-zinc-800'); });
  const eventPill = event.currentTarget;
  eventPill.classList.add('active', 'bg-indigo-600', 'text-white');
  renderResourcesList();
};

window.filterResourcesByType = function (type) { activeTypeFilter = type; renderResourcesList(); };
window.updateStatusDirect = function (id, val) {
  const updated = DB.updateResourceStatus(id, val);
  if (updated) window.showAlert("Status Updated", `Resource marked as "${val}".`, "success");
};
window.confirmDeleteResource = function (id, title) {
  if (confirm(`Remove bookmark for "${title}"?`)) {
    DB.deleteResource(id);
    window.showAlert("Deleted", "Resource removed.", "info");
  }
};
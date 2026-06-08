// skills.js - Skills Board Logic

document.addEventListener('DOMContentLoaded', function () {
  initSkills();

  const openBtn = document.getElementById('open-add-skill-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const modal = document.getElementById('add-skill-modal');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      setTimeout(() => {
        const inner = modal.querySelector('div');
        inner.classList.remove('scale-95', 'opacity-0');
        inner.classList.add('scale-100', 'opacity-100');
      }, 10);
    });
  }

  if (closeBtn && modal) {
    const closeModal = () => {
      const inner = modal.querySelector('div');
      inner.classList.remove('scale-100', 'opacity-100');
      inner.classList.add('scale-95', 'opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    };
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }

  const form = document.getElementById('skill-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('skill-name-input').value.trim();
      const category = document.getElementById('skill-category-input').value;
      const targetHours = Number(document.getElementById('skill-target-input').value);

      if (!name || isNaN(targetHours)) return;
      DB.addSkill({ name, category, targetHours });
      window.showAlert("Skill Added", `Successfully registered "${name}"`, "success");
      if (closeBtn) closeBtn.click();
      form.reset();
    });
  }

  window.addEventListener('dbUpdated', renderSkills);
});

function initSkills() { renderSkills(); }

function renderSkills() {
  if (typeof DB === 'undefined') return;
  const skills = DB.getSkills();

  const statsTotalSkills = document.getElementById('stats-total-skills');
  const statsTotalHours = document.getElementById('stats-total-hours');
  const statsExpertSkills = document.getElementById('stats-expert-skills');

  const totalHours = skills.reduce((acc, s) => acc + s.hours, 0);
  const expertCount = skills.filter(s => s.level >= 4).length;

  if (statsTotalSkills) statsTotalSkills.innerText = skills.length;
  if (statsTotalHours) statsTotalHours.innerText = `${totalHours} hours`;
  if (statsExpertSkills) statsExpertSkills.innerText = `${expertCount} Skills`;

  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  if (skills.length === 0) {
    grid.innerHTML = `<div class="col-span-full p-12 text-center text-slate-400 border border-dashed rounded-3xl"><p class="text-xs">No skills tracked yet. Register a skill focus!</p></div>`;
    return;
  }

  const proficiencyLabels = { 1: "Novice", 2: "Initiate", 3: "Competent", 4: "Proficient", 5: "Expert" };
  const categoryIcons = { "Web Development": "globe", "Data Science": "database", "Design": "palette", "Soft Skills": "message-square", "Languages": "languages" };

  grid.innerHTML = skills.map(skill => {
    const progressPercent = Math.min(100, Math.round((skill.hours / skill.targetHours) * 100));
    const skillIcon = categoryIcons[skill.category] || "layers";
    
    return `
      <div class="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center"><i data-lucide="${skillIcon}" class="w-5 h-5"></i></div>
            <div>
              <h4 class="text-xs font-extrabold text-slate-900 dark:text-white">${skill.name}</h4>
              <span class="text-[9px] text-slate-400 font-bold uppercase mt-1.5 block">${skill.category}</span>
            </div>
          </div>
          <button onclick="confirmDeleteSkill('${skill.id}', '${skill.name}')" class="text-slate-300 hover:text-rose-500 p-1 rounded-lg cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-[11px] font-semibold text-slate-600">
            <span>Progress: <strong>${skill.hours}</strong> / ${skill.targetHours}h</span>
            <span>${progressPercent}%</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden"><div class="bg-indigo-500 h-full rounded-full" style="width: ${progressPercent}%;"></div></div>
          <div class="flex justify-between items-center pt-1.5">
            <span class="text-[10px] text-slate-400">Mastery Level</span>
            <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold rounded-md uppercase">${proficiencyLabels[skill.level] || 'Novice'}</span>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-50 dark:border-zinc-800/50 flex flex-col gap-2.5">
          <div class="flex gap-1.5">
            <button onclick="logHoursDirect('${skill.id}', 1)" class="flex-1 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-800 rounded-lg text-[10px] font-bold cursor-pointer">+1 Hr</button>
            <button onclick="logHoursDirect('${skill.id}', 2)" class="flex-1 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-800 rounded-lg text-[10px] font-bold cursor-pointer">+2 Hrs</button>
            <button onclick="logHoursDirect('${skill.id}', 5)" class="flex-1 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-800 rounded-lg text-[10px] font-bold cursor-pointer">+5 Hrs</button>
          </div>
          <div class="flex gap-1.5 items-center">
            <input type="number" id="log-custom-${skill.id}" placeholder="Custom..." class="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 rounded-lg text-[10px] focus:outline-none text-slate-900 dark:text-white">
            <button onclick="logHoursCustom('${skill.id}')" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer shrink-0">Log</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.logHoursDirect = function (id, hours) {
  const skill = DB.logSkillHours(id, hours);
  if (skill) window.showAlert("Hours Logged!", `Added ${hours}h to ${skill.name}. +${hours * 10} XP`, "success");
};

window.logHoursCustom = function (id) {
  const input = document.getElementById(`log-custom-${id}`);
  if (!input) return;
  const value = Number(input.value);
  if (isNaN(value) || value <= 0) {
    window.showAlert("Invalid input", "Provide positive hours.", "error");
    return;
  }
  const skill = DB.logSkillHours(id, value);
  if (skill) {
    window.showAlert("Hours Logged!", `Logged ${value} hours to ${skill.name}!`, "success");
    input.value = "";
  }
};

window.confirmDeleteSkill = function (id, name) {
  if (confirm(`Delete the tracker for "${name}"?`)) {
    DB.deleteSkill(id);
    window.showAlert("Deleted", `Removed ${name} tracker.`, "info");
  }
};
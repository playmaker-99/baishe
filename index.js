// index.js - Dashboard Logic for Learner Journal

document.addEventListener('DOMContentLoaded', function () {
  renderDashboard();
  window.addEventListener('dbUpdated', renderDashboard);
});

function renderDashboard() {
  if (typeof DB === 'undefined') return;

  const headerDate = document.getElementById('header-date');
  if (headerDate) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    headerDate.innerText = new Date().toLocaleDateString('en-US', options);
  }

  const profile = DB.getProfile();
  const entries = DB.getJournalEntries();
  const skills = DB.getSkills();
  const goals = DB.getGoals();
  const habits = DB.getHabits();

  const totalHours = skills.reduce((acc, curr) => acc + curr.hours, 0);

  const dashStreak = document.getElementById('dash-streak');
  const dashHours = document.getElementById('dash-hours');
  const dashEntries = document.getElementById('dash-entries');
  const dashXP = document.getElementById('dash-xp');

  if (dashStreak) dashStreak.innerText = profile.streak;
  if (dashHours) dashHours.innerText = totalHours;
  if (dashEntries) dashEntries.innerText = entries.length;
  if (dashXP) dashXP.innerText = profile.xp;

  const habitsContainer = document.getElementById('dash-habits-container');
  if (habitsContainer) {
    const today = new Date().toISOString().split('T')[0];
    
    if (habits.length === 0) {
      habitsContainer.innerHTML = `
        <div class="p-6 text-center text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
          <p class="text-xs">No habits configured. Head to Goals & Habits to add one!</p>
        </div>
      `;
    } else {
      habitsContainer.innerHTML = habits.map(habit => {
        const isDoneToday = habit.lastCompleted === today;
        return `
          <div class="flex items-center justify-between p-3 border border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-900/40 rounded-xl hover:border-indigo-100 transition-all ${isDoneToday ? 'opacity-70' : ''}">
            <div class="flex items-center gap-3">
              <button onclick="toggleHabit('${habit.id}')" class="w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center cursor-pointer ${
                isDoneToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-zinc-700 hover:border-indigo-500 text-transparent'
              }"><i data-lucide="check" class="w-4 h-4"></i></button>
              <div>
                <p class="text-xs font-semibold ${isDoneToday ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200'}">${habit.name}</p>
                <div class="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500"><i data-lucide="calendar" class="w-3 h-3"></i><span>${habit.frequency}</span></div>
              </div>
            </div>
            <span class="flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 dark:bg-orange-950/20 text-orange-500 text-[10px] font-bold rounded-full"><i data-lucide="flame" class="w-3 h-3"></i><span>${habit.streak}d streak</span></span>
          </div>
        `;
      }).join('');
    }
  }

  const entriesContainer = document.getElementById('dash-entries-container');
  if (entriesContainer) {
    if (entries.length === 0) {
      entriesContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
          <i data-lucide="book" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>
          <p class="text-xs">You haven't written any reflections yet.</p>
        </div>
      `;
    } else {
      entriesContainer.innerHTML = entries.slice(0, 2).map(entry => {
        const moodEmojis = { excited: "🤩", focused: "🤓", thoughtful: "🤔", tired: "🥱", stressed: "🤯", happy: "😊" };
        const moodEmoji = moodEmojis[entry.mood] || "✍️";
        const cleanSnippet = entry.content.replace(/[#*`]/g, '').slice(0, 150) + (entry.content.length > 150 ? "..." : "");
        
        return `
          <article class="p-4 border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs hover:border-slate-200 transition-all flex flex-col gap-3 cursor-pointer" onclick="viewJournalEntry('${entry.id}')">
            <div class="flex justify-between items-start gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 text-[10px] font-bold rounded-full">${entry.category}</span>
                  <span class="text-[10px] text-slate-400 font-medium">${entry.date}</span>
                </div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2 hover:text-indigo-600 transition-colors">${entry.title}</h4>
              </div>
              <span class="text-xl shrink-0 p-1 bg-slate-50 dark:bg-zinc-800 rounded-lg">${moodEmoji}</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">${cleanSnippet}</p>
            <div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-zinc-800/50">
              <div class="flex flex-wrap gap-1">${entry.tags.map(t => `<span class="text-[9px] text-slate-500 font-medium bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">#${t}</span>`).join('')}</div>
              <span class="flex items-center gap-1 text-[10px] text-slate-400"><i data-lucide="clock" class="w-3.5 h-3.5"></i><span>${entry.timeSpent}m read/write</span></span>
            </div>
          </article>
        `;
      }).join('');
    }
  }

  const skillsContainer = document.getElementById('dash-skills-container');
  if (skillsContainer) {
    if (skills.length === 0) {
      skillsContainer.innerHTML = `<div class="p-6 text-center text-slate-400 border border-dashed rounded-xl"><p class="text-xs">No skills registered yet.</p></div>`;
    } else {
      skillsContainer.innerHTML = skills.slice(0, 4).map(skill => {
        const progressPercent = Math.min(100, Math.round((skill.hours / skill.targetHours) * 100));
        return `
          <div class="p-3 border border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/30 rounded-xl space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white leading-none">${skill.name}</p>
                <span class="text-[9px] text-slate-400 uppercase tracking-wider block mt-1">${skill.category}</span>
              </div>
              <span class="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 text-[10px] font-extrabold rounded-md">Lvl ${skill.level}</span>
            </div>
            <div>
              <div class="flex justify-between text-[10px] font-semibold text-slate-500 mb-1"><span>Progress: ${skill.hours}/${skill.targetHours}h</span><span>${progressPercent}%</span></div>
              <div class="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div class="bg-indigo-500 h-full rounded-full transition-all duration-300" style="width: ${progressPercent}%;"></div></div>
            </div>
            <div class="flex justify-end gap-1 pt-1">
              <button onclick="logQuickHours('${skill.id}', 1)" class="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-zinc-400 hover:text-indigo-600 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer transition-all flex items-center gap-1"><i data-lucide="plus" class="w-2.5 h-2.5"></i> Log 1h</button>
              <button onclick="logQuickHours('${skill.id}', 4)" class="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-zinc-400 hover:text-indigo-600 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer transition-all flex items-center gap-1"><i data-lucide="plus" class="w-2.5 h-2.5"></i> Log 4h</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  const goalsContainer = document.getElementById('dash-goals-container');
  if (goalsContainer) {
    if (goals.length === 0) {
      goalsContainer.innerHTML = `<div class="p-6 text-center text-slate-400 border border-dashed rounded-xl"><p class="text-xs">No goals created yet.</p></div>`;
    } else {
      const sortedGoals = [...goals].sort((a, b) => a.completed - b.completed).slice(0, 4);
      goalsContainer.innerHTML = sortedGoals.map(goal => `
        <div class="flex items-start gap-2.5 p-2 bg-slate-50/30 rounded-xl transition-all ${goal.completed ? 'opacity-65' : ''}">
          <button onclick="toggleGoal('${goal.id}')" class="w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 ${
            goal.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-zinc-800 text-transparent'
          }"><i data-lucide="check" class="w-3.5 h-3.5"></i></button>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold truncate ${goal.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 dark:text-zinc-200'}">${goal.text}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1 py-0.2 rounded-md">${goal.type}</span>
              <span class="text-[9px] text-slate-400 flex items-center gap-1"><i data-lucide="calendar" class="w-2.5 h-2.5"></i>Due ${goal.deadline}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.toggleHabit = function (id) {
  const updatedHabit = DB.completeHabitToday(id);
  if (updatedHabit) {
    window.showAlert("Habit Completed!", `You completed "${updatedHabit.name}"! +50 XP`, "success");
  } else {
    window.showAlert("Already Checked!", "You already checked off this habit today.", "info");
  }
};

window.toggleGoal = function (id) { DB.toggleGoal(id); };
window.logQuickHours = function (id, hours) {
  const skill = DB.logSkillHours(id, hours);
  if (skill) {
    window.showAlert("Hours Logged!", `Logged ${hours}h to ${skill.name}. +${hours * 10} XP`, "success");
  }
};
window.viewJournalEntry = function (id) { window.location.href = `journal.html?view=${id}`; };
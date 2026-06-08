// goals.js - Goals and Habits Logic

let activeGoalsTab = "all";

document.addEventListener('DOMContentLoaded', function () {
  initGoals();

  const dateInput = document.getElementById('goal-date-input');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  const goalForm = document.getElementById('goal-form');
  if (goalForm) {
    goalForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = document.getElementById('goal-text-input').value.trim();
      const type = document.getElementById('goal-type-input').value;
      const deadline = document.getElementById('goal-date-input').value;

      if (!text || !deadline) return;
      DB.addGoal({ text, type, deadline });
      window.showAlert("Goal Declared!", `Added goal: "${text}". +150 XP on completion!`, "success");
      document.getElementById('goal-text-input').value = "";
    });
  }

  const habitForm = document.getElementById('habit-form');
  if (habitForm) {
    habitForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('habit-name-input').value.trim();
      const frequency = document.getElementById('habit-freq-input').value;

      if (!name) return;
      DB.addHabit({ name, frequency });
      window.showAlert("Habit Added", `Started tracking "${name}"!`, "success");
      document.getElementById('habit-name-input').value = "";
    });
  }

  window.addEventListener('dbUpdated', renderPageData);
});

function initGoals() { renderPageData(); }
function renderPageData() { renderGoalsList(); renderHabitsList(); }

function renderGoalsList() {
  const container = document.getElementById('goals-list');
  if (!container) return;

  const goals = DB.getGoals();
  let filtered = goals;

  if (activeGoalsTab === "pending") {
    filtered = goals.filter(g => !g.completed);
  } else if (activeGoalsTab === "completed") {
    filtered = goals.filter(g => g.completed);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-12 text-center text-slate-400 border border-dashed rounded-2xl">
        <p class="text-xs font-semibold">No goals here</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(goal => `
    <div class="flex items-start justify-between p-3.5 border border-slate-100 dark:border-zinc-800 bg-slate-50/25 rounded-xl transition-all ${goal.completed ? 'opacity-65' : ''}">
      <div class="flex items-start gap-3">
        <button onclick="toggleGoalCheck('${goal.id}')" class="w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center cursor-pointer mt-0.5 ${
          goal.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-zinc-700 text-transparent'
        }"><i data-lucide="check" class="w-4 h-4"></i></button>
        <div>
          <p class="text-xs font-semibold ${goal.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800 dark:text-zinc-200'}">${goal.text}</p>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span class="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">${goal.type}</span>
            <span class="text-[9px] text-slate-400 font-semibold flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i>Due: ${goal.deadline}</span>
          </div>
        </div>
      </div>
      <button onclick="deleteGoal('${goal.id}')" class="text-slate-300 hover:text-rose-500 p-1 rounded-lg cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.filterGoals = function (tab) {
  activeGoalsTab = tab;
  const tabBtns = document.querySelectorAll('#goals-filter-tabs button');
  tabBtns.forEach(btn => {
    btn.classList.remove('active', 'bg-slate-50', 'dark:bg-zinc-800', 'text-slate-900', 'dark:text-white');
  });

  const eventBtn = event.currentTarget;
  eventBtn.classList.add('active', 'bg-slate-50', 'dark:bg-zinc-800', 'text-slate-900', 'dark:text-white');
  renderGoalsList();
};

window.toggleGoalCheck = function (id) { DB.toggleGoal(id); };
window.deleteGoal = function (id) {
  if (confirm("Remove this goal?")) {
    DB.deleteGoal(id);
    window.showAlert("Goal Removed", "Successfully deleted the goal.", "info");
  }
};

function renderHabitsList() {
  const container = document.getElementById('habits-list');
  if (!container) return;

  const habits = DB.getHabits();
  const today = new Date().toISOString().split('T')[0];

  if (habits.length === 0) {
    container.innerHTML = `<div class="p-12 text-center text-slate-400 border border-dashed rounded-2xl"><p class="text-xs">No habits tracked yet.</p></div>`;
    return;
  }

  container.innerHTML = habits.map(habit => {
    const isDoneToday = habit.lastCompleted === today;
    const historyDots = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const completedOnDate = habit.history.includes(dateStr);
      const dayLetter = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      
      historyDots.push(`
        <div class="flex flex-col items-center gap-1.5 shrink-0">
          <div class="w-4.5 h-4.5 rounded-md flex items-center justify-center text-[8px] font-bold border ${
            completedOnDate ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-zinc-800 text-slate-400 bg-slate-50/50'
          }">${completedOnDate ? '✓' : ''}</div>
          <span class="text-[8px] font-extrabold text-slate-400 dark:text-zinc-600 uppercase">${dayLetter}</span>
        </div>
      `);
    }

    return `
      <div class="p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl space-y-4 transition-all ${isDoneToday ? 'opacity-80' : ''}">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <button onclick="toggleHabitCheck('${habit.id}')" class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isDoneToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-zinc-700 text-transparent'
            }"><i data-lucide="check" class="w-4.5 h-4.5"></i></button>
            <div>
              <p class="text-xs font-bold leading-tight ${isDoneToday ? 'line-through text-slate-400 font-medium' : 'text-slate-900 dark:text-white'}">${habit.name}</p>
              <div class="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400 font-semibold uppercase"><i data-lucide="refresh-cw" class="w-2.5 h-2.5"></i><span>${habit.frequency}</span></div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <span class="flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 dark:bg-orange-950/20 text-orange-500 text-[9px] font-extrabold rounded-full"><i data-lucide="flame" class="w-3 h-3"></i><span>${habit.streak}d streak</span></span>
            <button onclick="deleteHabit('${habit.id}')" class="text-slate-300 hover:text-rose-500 p-1 rounded-lg cursor-pointer"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        </div>
        <div class="pt-3 border-t flex justify-between items-center gap-2">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">6-Day:</span>
          <div class="flex gap-1.5">${historyDots.join('')}</div>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.toggleHabitCheck = function (id) {
  const updated = DB.completeHabitToday(id);
  if (updated) {
    window.showAlert("Habit Completed!", `Completed: "${updated.name}"! Streak at ${updated.streak} days. +50 XP`, "success");
  } else {
    window.showAlert("Already Checked!", "Already done today.", "info");
  }
};

window.deleteHabit = function (id) {
  if (confirm("Stop tracking this habit?")) {
    DB.deleteHabit(id);
    window.showAlert("Habit Discarded", "Successfully deleted.", "info");
  }
};
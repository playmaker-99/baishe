// db.js - LocalStorage Database Wrapper & Initial Mock Data for Learner Journal

const DB_KEY = 'learner_journal_db';

const defaultDB = {
  profile: {
    name: "Baishe Hamza",
    email: "hamzabaishe9@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
    bio: "Lifelong learner, engineering student, and technology enthusiast. Currently deep diving into frontend architectures, machine learning, and personal growth systems.",
    streak: 12,
    xp: 2450,
    level: 4
  },
  journalEntries: [
    {
      id: "entry-1",
      title: "Deep Dive into Frontend Performance & Bundle Optimization",
      content: "Today I spent 4 hours analyzing frontend bundling tools and how modern JS runtimes execute code. I learned that optimizing bundle sizes can improve Largest Contentful Paint (LCP) by up to 40%. I worked on splitting code, utilizing lazy loading, and understanding how tree-shaking removes unused exports. \n\nKey takeaways:\n1. Keep dependencies minimal.\n2. Leverage dynamic imports for heavy routes.\n3. Image compression is a low-hanging fruit with high impact.",
      date: "2026-06-08",
      category: "Technical",
      tags: ["JavaScript", "Performance", "Web Dev"],
      mood: "focused",
      timeSpent: 240
    },
    {
      id: "entry-2",
      title: "Mental Models for Solving Complex Architectural Problems",
      content: "Felt a bit stuck on designing a distributed cache system today. Decided to step away from the keyboard and draw a flow map. Applying First Principles thinking helped separate what is absolutely essential (fast lookups, simple invalidation) from nice-to-haves (advanced pre-fetching algorithms). Sometimes the best solution is the simplest one that fits the current constraint.\n\nI want to focus more on simple system boundaries going forward.",
      date: "2026-06-07",
      category: "Reflection",
      tags: ["Systems", "Architecture", "Philosophy"],
      mood: "thoughtful",
      timeSpent: 90
    },
    {
      id: "entry-3",
      title: "First Steps with Python Data Analysis & Pandas Library",
      content: "Explored the fundamentals of data analysis with Pandas today. Loaded a CSV dataset, cleaned missing values using `.fillna()`, and grouped data by columns to compute means. It is amazing how powerful a single line of python can be. Next, I want to learn Matplotlib and Seaborn for creating beautiful data visualizations.",
      date: "2026-06-05",
      category: "Technical",
      tags: ["Python", "Data Science", "Pandas"],
      mood: "excited",
      timeSpent: 120
    }
  ],
  skills: [
    { id: "skill-1", name: "JavaScript / ES6+", category: "Web Development", level: 4, hours: 145, targetHours: 200 },
    { id: "skill-2", name: "Python Programming", category: "Data Science", level: 3, hours: 82, targetHours: 150 },
    { id: "skill-3", name: "UI/UX & TailwindCSS", category: "Design", level: 4, hours: 98, targetHours: 120 },
    { id: "skill-4", name: "Machine Learning Basics", category: "Data Science", level: 1, hours: 15, targetHours: 80 },
    { id: "skill-5", name: "Technical Writing", category: "Soft Skills", level: 3, hours: 40, targetHours: 60 }
  ],
  goals: [
    { id: "goal-1", text: "Complete the Multi-Page Learner Journal Project", type: "Weekly", deadline: "2026-06-12", completed: true },
    { id: "goal-2", text: "Read 'Designing Data-Intensive Applications' Chapter 4 & 5", type: "Monthly", deadline: "2026-06-25", completed: false },
    { id: "goal-3", text: "Implement 5 custom visualizations using D3.js or Plotly", type: "Monthly", deadline: "2026-06-30", completed: false },
    { id: "goal-4", text: "Maintain a 15-day study journal streak", type: "Weekly", deadline: "2026-06-15", completed: false }
  ],
  habits: [
    { id: "habit-1", name: "Write Daily Reflection", frequency: "Daily", streak: 4, lastCompleted: "2026-06-08", history: ["2026-06-08", "2026-06-07", "2026-06-06", "2026-06-05"] },
    { id: "habit-2", name: "Code or Design for 1 Hour", frequency: "Daily", streak: 12, lastCompleted: "2026-06-08", history: ["2026-06-08", "2026-06-07", "2026-06-06", "2026-06-05", "2026-06-04", "2026-06-03"] },
    { id: "habit-3", name: "Read Technical Articles/Books", frequency: "Daily", streak: 0, lastCompleted: "2026-06-06", history: ["2026-06-06", "2026-06-04", "2026-06-03"] }
  ],
  resources: [
    { id: "res-1", title: "Eloquent JavaScript (3rd Edition)", type: "Book", url: "https://eloquentjavascript.net/", tags: ["JS", "Programming"], status: "Reading" },
    { id: "res-2", title: "Tailwind CSS Official Documentation", type: "Documentation", url: "https://tailwindcss.com/docs", tags: ["CSS", "Design"], status: "Completed" },
    { id: "res-3", title: "Kaggle Machine Learning Course", type: "Course", url: "https://www.kaggle.com/learn", tags: ["ML", "Python"], status: "In Progress" },
    { id: "res-4", title: "Linear App Design & UX Analysis", type: "Article", url: "https://linear.app", tags: ["UI/UX", "Productivity"], status: "Reading" }
  ],
  notifications: [
    { id: "notif-1", title: "Streak Saved!", message: "You completed your daily writing reflection! Streak is now 4 days.", time: "10m ago", read: false },
    { id: "notif-2", title: "New Milestone", message: "Congratulations! You reached Level 4 on your learning journey.", time: "2h ago", read: false }
  ]
};

function initDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
  }
}

function getDB() {
  initDB();
  try {
    return JSON.parse(localStorage.getItem(DB_KEY));
  } catch (e) {
    console.error("Failed to parse database, resetting to default.", e);
    return defaultDB;
  }
}

function saveDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('dbUpdated'));
}

const DB = {
  getProfile() {
    return getDB().profile;
  },
  updateProfile(newProfile) {
    const db = getDB();
    db.profile = { ...db.profile, ...newProfile };
    saveDB(db);
    return db.profile;
  },
  getJournalEntries() {
    return getDB().journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  addJournalEntry(entry) {
    const db = getDB();
    const newEntry = {
      id: 'entry-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      tags: [],
      ...entry
    };
    db.journalEntries.push(newEntry);
    db.profile.xp += 100;
    const newLevel = Math.floor(db.profile.xp / 1000) + 1;
    if (newLevel > db.profile.level) {
      db.profile.level = newLevel;
      this.addNotification("Level Up!", `Congratulations! You have advanced to Level ${newLevel}!`, "Just now");
    }
    this.completeHabitToday("habit-1", db);
    saveDB(db);
    return newEntry;
  },
  updateJournalEntry(id, updatedEntry) {
    const db = getDB();
    const index = db.journalEntries.findIndex(e => e.id === id);
    if (index !== -1) {
      db.journalEntries[index] = { ...db.journalEntries[index], ...updatedEntry };
      saveDB(db);
      return db.journalEntries[index];
    }
    return null;
  },
  deleteJournalEntry(id) {
    const db = getDB();
    db.journalEntries = db.journalEntries.filter(e => e.id !== id);
    saveDB(db);
  },
  getSkills() {
    return getDB().skills;
  },
  addSkill(skill) {
    const db = getDB();
    const newSkill = {
      id: 'skill-' + Date.now(),
      level: 1,
      hours: 0,
      targetHours: 100,
      ...skill
    };
    db.skills.push(newSkill);
    saveDB(db);
    return newSkill;
  },
  logSkillHours(id, hours) {
    const db = getDB();
    const skill = db.skills.find(s => s.id === id);
    if (skill) {
      skill.hours += Number(hours);
      db.profile.xp += Math.round(hours * 10);
      const newLevel = Math.floor(db.profile.xp / 1000) + 1;
      if (newLevel > db.profile.level) {
        db.profile.level = newLevel;
        this.addNotification("Level Up!", `Congratulations! You have advanced to Level ${newLevel}!`, "Just now");
      }
      const calculatedLevel = Math.min(5, Math.floor(skill.hours / 40) + 1);
      if (calculatedLevel > skill.level) {
        skill.level = calculatedLevel;
        this.addNotification("Skill Level Up!", `Your proficiency in "${skill.name}" is now Level ${calculatedLevel}!`, "Just now");
      }
      this.completeHabitToday("habit-2", db);
      saveDB(db);
      return skill;
    }
    return null;
  },
  deleteSkill(id) {
    const db = getDB();
    db.skills = db.skills.filter(s => s.id !== id);
    saveDB(db);
  },
  getGoals() {
    return getDB().goals;
  },
  addGoal(goal) {
    const db = getDB();
    const newGoal = {
      id: 'goal-' + Date.now(),
      completed: false,
      ...goal
    };
    db.goals.push(newGoal);
    saveDB(db);
    return newGoal;
  },
  toggleGoal(id) {
    const db = getDB();
    const goal = db.goals.find(g => g.id === id);
    if (goal) {
      goal.completed = !goal.completed;
      if (goal.completed) {
        db.profile.xp += 150;
        const newLevel = Math.floor(db.profile.xp / 1000) + 1;
        if (newLevel > db.profile.level) {
          db.profile.level = newLevel;
          this.addNotification("Level Up!", `Congratulations! You have advanced to Level ${newLevel}!`, "Just now");
        }
        this.addNotification("Goal Completed!", `Great job completing: "${goal.text}"`, "Just now");
      }
      saveDB(db);
      return goal;
    }
    return null;
  },
  deleteGoal(id) {
    const db = getDB();
    db.goals = db.goals.filter(g => g.id !== id);
    saveDB(db);
  },
  getHabits() {
    return getDB().habits;
  },
  completeHabitToday(id, dbInstance = null) {
    const db = dbInstance || getDB();
    const habit = db.habits.find(h => h.id === id);
    if (habit) {
      const today = new Date().toISOString().split('T')[0];
      if (habit.lastCompleted === today) {
        return habit;
      }
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (habit.lastCompleted === yesterday) {
        habit.streak += 1;
      } else {
        habit.streak = 1;
      }
      habit.lastCompleted = today;
      if (!habit.history.includes(today)) {
        habit.history.push(today);
      }
      db.profile.xp += 50;
      const allDailyDoneToday = db.habits.every(h => h.lastCompleted === today);
      if (allDailyDoneToday) {
        db.profile.streak += 1;
      }
      if (!dbInstance) {
        saveDB(db);
      }
      return habit;
    }
    return null;
  },
  addHabit(habit) {
    const db = getDB();
    const newHabit = {
      id: 'habit-' + Date.now(),
      streak: 0,
      history: [],
      ...habit
    };
    db.habits.push(newHabit);
    saveDB(db);
    return newHabit;
  },
  deleteHabit(id) {
    const db = getDB();
    db.habits = db.habits.filter(h => h.id !== id);
    saveDB(db);
  },
  getResources() {
    return getDB().resources;
  },
  addResource(resource) {
    const db = getDB();
    const newResource = {
      id: 'res-' + Date.now(),
      status: 'In Progress',
      ...resource
    };
    db.resources.push(newResource);
    saveDB(db);
    return newResource;
  },
  updateResourceStatus(id, status) {
    const db = getDB();
    const res = db.resources.find(r => r.id === id);
    if (res) {
      res.status = status;
      saveDB(db);
      return res;
    }
    return null;
  },
  deleteResource(id) {
    const db = getDB();
    db.resources = db.resources.filter(r => r.id !== id);
    saveDB(db);
  },
  getNotifications() {
    return getDB().notifications;
  },
  addNotification(title, message, time = "Just now") {
    const db = getDB();
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      message,
      time,
      read: false
    };
    db.notifications.unshift(newNotif);
    saveDB(db);
    return newNotif;
  },
  markNotificationsAsRead() {
    const db = getDB();
    db.notifications.forEach(n => n.read = true);
    saveDB(db);
  },
  clearAllData() {
    localStorage.removeItem(DB_KEY);
    initDB();
  }
};

initDB();
window.DB = DB;
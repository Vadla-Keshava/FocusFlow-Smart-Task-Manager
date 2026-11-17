const STORAGE_KEY = "focusflow_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  document.getElementById("totalStat").textContent = total;
  document.getElementById("activeStat").textContent = total - completed;
  document.getElementById("completedStat").textContent = completed;
  document.getElementById("allCount").textContent = total;
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item ${task.completed ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "in progress" : "completed"}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = document.createElement("div");
    info.className = "task-info";
    const name = document.createElement("div");
    name.className = "task-name";
    name.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = `Added ${task.createdAt}`;
    info.append(name, meta);

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = task.priority;

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.title}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, info, priority, remove);
    taskList.appendChild(item);
  });

  emptyState.style.display = visibleTasks.length ? "none" : "block";
  resultCount.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
  updateStats();
  updateFilterStyles();
}

function updateFilterStyles() {
  document.querySelectorAll("[data-filter]").forEach(button => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle("selected", active && button.classList.contains("filter-tab"));
    button.classList.toggle("active", active && button.classList.contains("nav-link"));
  });
}

function setFilter(filter) {
  currentFilter = filter;
  renderTasks();
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    title,
    priority: priorityInput.value,
    completed: false,
    createdAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })
  });

  saveTasks();
  taskInput.value = "";
  priorityInput.value = "medium";
  setFilter("all");
  taskInput.focus();
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

const now = new Date();
document.getElementById("todayLabel").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
document.getElementById("dateChip").textContent = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

renderTasks();

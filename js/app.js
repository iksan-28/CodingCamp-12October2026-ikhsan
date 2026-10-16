/* =========================================================
   app.js — Personal Dashboard
   Single JavaScript file for the entire project
   Features: Greeting · Focus Timer · To-Do · Quick Links
   Challenges: Dark Mode · Custom Name · Sort Tasks
   ========================================================= */

'use strict';

/* ─────────────────────────────────────────
   1. LocalStorage Keys
───────────────────────────────────────── */
const LS = {
  TASKS:      'dashboard_tasks',
  LINKS:      'dashboard_links',
  USER_NAME:  'dashboard_userName',
  THEME:      'dashboard_theme',
  SORT:       'dashboard_sortOrder',
};

/* ─────────────────────────────────────────
   2. DOM References
───────────────────────────────────────── */
const dom = {
  // Greeting
  datetime:     document.getElementById('current-datetime'),
  greetingText: document.getElementById('greeting-text'),
  nameDisplay:  document.getElementById('name-display'),
  editNameBtn:  document.getElementById('edit-name-btn'),
  nameEditor:   document.getElementById('name-editor'),
  nameInput:    document.getElementById('name-input'),
  saveNameBtn:  document.getElementById('save-name-btn'),
  cancelNameBtn:document.getElementById('cancel-name-btn'),

  // Theme
  themeToggle:  document.getElementById('theme-toggle'),

  // Timer
  timerDisplay: document.getElementById('timer-display'),
  timerStart:   document.getElementById('timer-start'),
  timerStop:    document.getElementById('timer-stop'),
  timerReset:   document.getElementById('timer-reset'),
  timerLabel:   document.getElementById('timer-label'),

  // To-Do
  taskInput:    document.getElementById('task-input'),
  addTaskBtn:   document.getElementById('add-task-btn'),
  taskList:     document.getElementById('task-list'),
  emptyTasks:   document.getElementById('empty-tasks'),
  sortSelect:   document.getElementById('sort-select'),

  // Quick Links
  linkNameInput:document.getElementById('link-name-input'),
  linkUrlInput: document.getElementById('link-url-input'),
  addLinkBtn:   document.getElementById('add-link-btn'),
  linksGrid:    document.getElementById('links-grid'),
  emptyLinks:   document.getElementById('empty-links'),
};

/* ─────────────────────────────────────────
   3. State
───────────────────────────────────────── */
let tasks      = [];
let quickLinks = [];
let timerInterval  = null;
let timerSeconds   = 25 * 60;   // 25 minutes in seconds
let timerRunning   = false;

/* ─────────────────────────────────────────
   4. Greeting & DateTime
───────────────────────────────────────── */

/**
 * Returns a greeting phrase based on the current hour.
 * @returns {string}
 */
function getGreetingPhrase() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

/**
 * Formats a Date into a readable string: "Wednesday, October 14, 2026 · 07:45 PM"
 * @param {Date} date
 * @returns {string}
 */
function formatDateTime(date) {
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  const day     = days[date.getDay()];
  const month   = months[date.getMonth()];
  const dateNum = date.getDate();
  const year    = date.getFullYear();

  let   hours   = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm    = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hStr = String(hours).padStart(2, '0');

  return `${day}, ${month} ${dateNum}, ${year} · ${hStr}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Updates the greeting and datetime display. Called every second.
 */
function updateGreeting() {
  const now        = new Date();
  const phrase     = getGreetingPhrase();
  const name       = localStorage.getItem(LS.USER_NAME) || '';
  const nameStr    = name ? `, ${name}` : '';

  dom.datetime.textContent     = formatDateTime(now);
  dom.greetingText.textContent = `${phrase}${nameStr}! 👋`;
}

/* ─────────────────────────────────────────
   5. Custom Name (Challenge #2)
───────────────────────────────────────── */

/**
 * Loads and renders the saved user name.
 */
function loadName() {
  const name = localStorage.getItem(LS.USER_NAME) || '';
  if (name) {
    dom.nameDisplay.textContent = `Hello, ${name}`;
    dom.nameDisplay.classList.remove('hidden');
  } else {
    dom.nameDisplay.classList.add('hidden');
  }
}

/**
 * Opens the inline name editor.
 */
function openNameEditor() {
  const current = localStorage.getItem(LS.USER_NAME) || '';
  dom.nameInput.value = current;
  dom.nameEditor.classList.remove('hidden');
  dom.nameInput.focus();
}

/**
 * Saves the entered name to localStorage and refreshes UI.
 */
function saveName() {
  const name = dom.nameInput.value.trim();
  if (name) {
    localStorage.setItem(LS.USER_NAME, name);
  } else {
    localStorage.removeItem(LS.USER_NAME);
  }
  dom.nameEditor.classList.add('hidden');
  loadName();
  updateGreeting();
}

/**
 * Cancels name editing without saving.
 */
function cancelName() {
  dom.nameEditor.classList.add('hidden');
}

/* ─────────────────────────────────────────
   6. Dark / Light Mode (Challenge #1)
───────────────────────────────────────── */

/**
 * Applies the given theme ('light' | 'dark') to the page.
 * @param {string} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(LS.THEME, theme);
}

/**
 * Toggles between light and dark mode.
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Loads the saved theme preference on startup.
 */
function loadTheme() {
  const saved = localStorage.getItem(LS.THEME);
  // If no preference saved, check system preference
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
}

/* ─────────────────────────────────────────
   7. Focus Timer
───────────────────────────────────────── */

const TIMER_DURATION = 25 * 60; // seconds

/**
 * Formats seconds into MM:SS string.
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Updates the timer display and styling.
 */
function renderTimer() {
  dom.timerDisplay.textContent = formatTime(timerSeconds);

  // Update colour based on state
  dom.timerDisplay.classList.remove('running', 'done');
  if (timerRunning) {
    dom.timerDisplay.classList.add('running');
  } else if (timerSeconds === 0) {
    dom.timerDisplay.classList.add('done');
  }
}

/**
 * Starts the countdown timer.
 */
function startTimer() {
  if (timerRunning || timerSeconds === 0) return;

  timerRunning = true;
  dom.timerStart.disabled = true;
  dom.timerStop.disabled  = false;
  dom.timerLabel.textContent = '🎯 Stay focused!';

  timerInterval = setInterval(() => {
    timerSeconds--;
    renderTimer();

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      dom.timerStart.disabled = true;
      dom.timerStop.disabled  = true;
      dom.timerLabel.textContent = '🎉 Session complete! Take a break.';
    }
  }, 1000);
}

/**
 * Stops (pauses) the timer.
 */
function stopTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  dom.timerStart.disabled = false;
  dom.timerStop.disabled  = true;
  dom.timerLabel.textContent = '⏸ Paused. Resume when ready.';
  renderTimer();
}

/**
 * Resets the timer back to 25:00.
 */
function resetTimer() {
  clearInterval(timerInterval);
  timerRunning  = false;
  timerSeconds  = TIMER_DURATION;
  dom.timerStart.disabled = false;
  dom.timerStop.disabled  = true;
  dom.timerLabel.textContent = 'Ready to focus?';
  renderTimer();
}

/* ─────────────────────────────────────────
   8. To-Do List
───────────────────────────────────────── */

/**
 * Loads tasks from localStorage.
 */
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(LS.TASKS)) || [];
  } catch {
    tasks = [];
  }
}

/**
 * Saves current tasks array to localStorage.
 */
function saveTasks() {
  localStorage.setItem(LS.TASKS, JSON.stringify(tasks));
}

/**
 * Returns a new task object.
 * @param {string} text
 * @returns {{ id: string, text: string, done: boolean, createdAt: number }}
 */
function createTask(text) {
  return {
    id:        Date.now().toString(),
    text:      text.trim(),
    done:      false,
    createdAt: Date.now(),
  };
}

/**
 * Adds a new task from the input field.
 */
function addTask() {
  const text = dom.taskInput.value.trim();
  if (!text) return;

  tasks.push(createTask(text));
  saveTasks();
  renderTasks();

  dom.taskInput.value = '';
  dom.taskInput.focus();
}

/**
 * Toggles the done state of a task.
 * @param {string} id
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

/**
 * Deletes a task by id.
 * @param {string} id
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/**
 * Saves an inline edit on a task.
 * @param {string} id
 * @param {string} newText
 */
function saveEditTask(id, newText) {
  const text = newText.trim();
  if (!text) return;
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.text = text;
    saveTasks();
    renderTasks();
  }
}

/**
 * Returns the current sort order from the select element.
 * @returns {string}
 */
function getCurrentSort() {
  return dom.sortSelect.value || localStorage.getItem(LS.SORT) || 'default';
}

/**
 * Sorts a copy of tasks according to the given sort key.
 * @param {Array} list
 * @param {string} sortKey
 * @returns {Array}
 */
function sortTasks(list, sortKey) {
  const copy = [...list];
  switch (sortKey) {
    case 'az':
      copy.sort((a, b) => a.text.localeCompare(b.text));
      break;
    case 'za':
      copy.sort((a, b) => b.text.localeCompare(a.text));
      break;
    case 'done-last':
      // Undone tasks first
      copy.sort((a, b) => Number(a.done) - Number(b.done));
      break;
    case 'done-first':
      // Done tasks first
      copy.sort((a, b) => Number(b.done) - Number(a.done));
      break;
    default:
      // Keep insertion order (oldest first)
      copy.sort((a, b) => Number(a.id) - Number(b.id));
  }
  return copy;
}

/**
 * Renders the task list to the DOM.
 */
function renderTasks() {
  dom.taskList.innerHTML = '';

  const sortKey    = getCurrentSort();
  const sortedList = sortTasks(tasks, sortKey);

  if (sortedList.length === 0) {
    dom.emptyTasks.classList.remove('hidden');
    return;
  }

  dom.emptyTasks.classList.add('hidden');

  sortedList.forEach(task => {
    const li = document.createElement('li');
    li.className  = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked   = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'undone' : 'done'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Text label
    const textSpan = document.createElement('span');
    textSpan.className   = 'task-text';
    textSpan.textContent = task.text;

    // Actions container
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon';
    editBtn.title     = 'Edit task';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => {
      // Replace text span with inline input
      const editInput = document.createElement('input');
      editInput.type      = 'text';
      editInput.className = 'task-edit-input';
      editInput.value     = task.text;
      editInput.maxLength = 120;

      li.replaceChild(editInput, textSpan);
      editInput.focus();
      editInput.select();

      const commit = () => saveEditTask(task.id, editInput.value);

      editInput.addEventListener('keydown', e => {
        if (e.key === 'Enter')  commit();
        if (e.key === 'Escape') renderTasks(); // cancel
      });
      editInput.addEventListener('blur', commit);
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon';
    deleteBtn.title     = 'Delete task';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete task "${task.text}"`);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(actions);

    dom.taskList.appendChild(li);
  });
}

/* ─────────────────────────────────────────
   9. Quick Links
───────────────────────────────────────── */

/**
 * Loads quick links from localStorage.
 */
function loadLinks() {
  try {
    quickLinks = JSON.parse(localStorage.getItem(LS.LINKS)) || [];
  } catch {
    quickLinks = [];
  }
}

/**
 * Saves quick links to localStorage.
 */
function saveLinks() {
  localStorage.setItem(LS.LINKS, JSON.stringify(quickLinks));
}

/**
 * Normalises a URL — adds https:// if no protocol present.
 * @param {string} url
 * @returns {string}
 */
function normaliseUrl(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

/**
 * Returns the favicon URL for a given link URL.
 * @param {string} url
 * @returns {string}
 */
function faviconUrl(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return '';
  }
}

/**
 * Adds a new quick link from the input fields.
 */
function addLink() {
  const name = dom.linkNameInput.value.trim();
  const raw  = dom.linkUrlInput.value.trim();

  if (!name || !raw) {
    alert('Please enter both a label and a URL.');
    return;
  }

  const url = normaliseUrl(raw);

  quickLinks.push({ id: Date.now().toString(), name, url });
  saveLinks();
  renderLinks();

  dom.linkNameInput.value = '';
  dom.linkUrlInput.value  = '';
  dom.linkNameInput.focus();
}

/**
 * Deletes a quick link by id.
 * @param {string} id
 */
function deleteLink(id) {
  quickLinks = quickLinks.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

/**
 * Renders the quick links grid.
 */
function renderLinks() {
  dom.linksGrid.innerHTML = '';

  if (quickLinks.length === 0) {
    dom.emptyLinks.classList.remove('hidden');
    return;
  }

  dom.emptyLinks.classList.add('hidden');

  quickLinks.forEach(link => {
    const card = document.createElement('div');
    card.className  = 'link-card';
    card.dataset.id = link.id;

    // Anchor wrapping favicon + label
    const anchor = document.createElement('a');
    anchor.href   = link.url;
    anchor.target = '_blank';
    anchor.rel    = 'noopener noreferrer';
    anchor.setAttribute('aria-label', `Open ${link.name}`);

    const favicon = document.createElement('img');
    favicon.src       = faviconUrl(link.url);
    favicon.alt       = '';
    favicon.className = 'link-favicon';
    favicon.onerror   = () => { favicon.style.display = 'none'; };

    const label = document.createElement('span');
    label.className   = 'link-label';
    label.textContent = link.name;

    anchor.appendChild(favicon);
    anchor.appendChild(label);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'link-delete';
    delBtn.title     = 'Remove link';
    delBtn.innerHTML = '✕';
    delBtn.setAttribute('aria-label', `Remove ${link.name}`);
    delBtn.addEventListener('click', e => {
      e.preventDefault();
      deleteLink(link.id);
    });

    card.appendChild(anchor);
    card.appendChild(delBtn);
    dom.linksGrid.appendChild(card);
  });
}

/* ─────────────────────────────────────────
   10. Sort Tasks (Challenge #3)
───────────────────────────────────────── */

/**
 * Handles sort order change.
 */
function handleSortChange() {
  localStorage.setItem(LS.SORT, dom.sortSelect.value);
  renderTasks();
}

/* ─────────────────────────────────────────
   11. Event Listeners
───────────────────────────────────────── */

function attachEventListeners() {
  // ── Theme toggle ──
  dom.themeToggle.addEventListener('click', toggleTheme);

  // ── Name ──
  dom.editNameBtn.addEventListener('click', openNameEditor);
  dom.saveNameBtn.addEventListener('click', saveName);
  dom.cancelNameBtn.addEventListener('click', cancelName);
  dom.nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveName();
    if (e.key === 'Escape') cancelName();
  });

  // ── Timer ──
  dom.timerStart.addEventListener('click', startTimer);
  dom.timerStop.addEventListener('click',  stopTimer);
  dom.timerReset.addEventListener('click', resetTimer);

  // ── Tasks ──
  dom.addTaskBtn.addEventListener('click', addTask);
  dom.taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
  dom.sortSelect.addEventListener('change', handleSortChange);

  // ── Quick Links ──
  dom.addLinkBtn.addEventListener('click', addLink);
  dom.linkUrlInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addLink();
  });
}

/* ─────────────────────────────────────────
   12. Initialisation
───────────────────────────────────────── */

/**
 * Entry point — runs when the DOM is fully loaded.
 */
function init() {
  // Apply saved theme first to avoid flash
  loadTheme();

  // Load persisted data
  loadTasks();
  loadLinks();
  loadName();

  // Restore saved sort preference
  const savedSort = localStorage.getItem(LS.SORT);
  if (savedSort) dom.sortSelect.value = savedSort;

  // Initial renders
  renderTimer();
  renderTasks();
  renderLinks();
  updateGreeting();

  // Start datetime clock (updates every second)
  setInterval(updateGreeting, 1000);

  // Bind all events
  attachEventListeners();
}

// Kick off once the DOM is ready
document.addEventListener('DOMContentLoaded', init);

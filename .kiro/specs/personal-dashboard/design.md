# Design: Personal Dashboard

## Overview

The Personal Dashboard is a single-page web application built with plain HTML, CSS, and vanilla JavaScript — no build tools, no frameworks, no dependencies beyond a Google Fonts stylesheet. It runs entirely in the browser and persists all user data in `localStorage`.

The dashboard surfaces six features on one screen:

1. A live greeting and clock that updates every second
2. An editable user name that personalises the greeting
3. A light/dark theme toggle that respects the OS colour-scheme preference
4. A 25-minute Pomodoro focus timer
5. A to-do list with inline editing and five sort modes
6. A quick-links grid with auto-fetched favicons

Because the project has no server and no bundler, every design decision favours simplicity, low file count, and direct DOM manipulation over abstractions.

---

## Architecture

### Deployment model

```
Browser
└── index.html          ← single HTML file, app shell
    ├── css/style.css   ← all styles; CSS custom properties for theming
    └── js/app.js       ← all JavaScript; named functions, no IIFE
```

The three files are served statically — a local file-system open, a simple HTTP server, or any static host all work identically.

### Runtime model

```
DOMContentLoaded
  └── init()
        ├── loadTheme()         → apply saved/system theme
        ├── loadTasks()         → restore tasks from localStorage
        ├── loadLinks()         → restore links from localStorage
        ├── loadName()          → restore user name
        ├── renderTimer()       → paint initial 25:00
        ├── renderTasks()       → paint task list (or empty state)
        ├── renderLinks()       → paint links grid (or empty state)
        ├── updateGreeting()    → paint greeting + datetime
        ├── setInterval(updateGreeting, 1000)  ← live clock
        └── attachEventListeners()
```

Two `setInterval` calls are active at runtime:

| Interval | Driver | Frequency |
|----------|--------|-----------|
| Clock | `updateGreeting()` | 1 000 ms |
| Timer countdown | anonymous inside `startTimer()` | 1 000 ms |

The timer interval handle is stored in the module-level variable `timerInterval` so `stopTimer()` and `resetTimer()` can clear it.

### State management

All mutable state lives in module-level variables in `app.js`. There is no reactive framework; UI is re-rendered by calling explicit `render*()` functions after every state mutation.

```
tasks[]         ← Task objects; source of truth for the to-do list
quickLinks[]    ← QuickLink objects; source of truth for the links grid
timerSeconds    ← number; current countdown value in seconds
timerRunning    ← boolean; whether the countdown interval is active
timerInterval   ← IntervalID | null
```

---

## Components and Interfaces

Each feature maps to a cohesive group of named functions. No class instances or modules are used — the functions share state through the module-level variables above.

### 1. Greeting & Clock

| Function | Signature | Purpose |
|----------|-----------|---------|
| `getGreetingPhrase()` | `() → string` | Returns time-of-day phrase based on `new Date().getHours()` |
| `formatDateTime(date)` | `(Date) → string` | Formats a Date as `"Wednesday, October 14, 2026 · 07:45:30 PM"` |
| `updateGreeting()` | `() → void` | Writes phrase + name to `#greeting-text` and timestamp to `#current-datetime` |

`updateGreeting` is both called once during `init()` and scheduled via `setInterval` every second.

Hour ranges used by `getGreetingPhrase()`:

| Range | Phrase |
|-------|--------|
| 5 – 11 | Good Morning |
| 12 – 16 | Good Afternoon |
| 17 – 20 | Good Evening |
| 21 – 4 | Good Night |

### 2. Custom User Name

| Function | Purpose |
|----------|---------|
| `loadName()` | Reads `LS.USER_NAME` from localStorage; shows/hides `#name-display` |
| `openNameEditor()` | Removes `.hidden` from `#name-editor`; pre-fills with saved name |
| `saveName()` | Trims input, writes to localStorage (or removes key if empty), hides editor |
| `cancelName()` | Adds `.hidden` back to `#name-editor` without touching localStorage |

### 3. Theme Toggle

| Function | Purpose |
|----------|---------|
| `loadTheme()` | On startup: reads `LS.THEME`, falls back to `prefers-color-scheme` |
| `applyTheme(theme)` | Sets `data-theme` attribute on `<html>` and writes to localStorage |
| `toggleTheme()` | Reads current `data-theme`, calls `applyTheme()` with the opposite value |

CSS reacts to `[data-theme]` entirely through custom-property overrides in `:root` vs `[data-theme="dark"]` blocks — no JavaScript touches individual element colours.

### 4. Focus Timer

| Function | Purpose |
|----------|---------|
| `formatTime(totalSeconds)` | `(number) → string`; converts seconds to `"MM:SS"` |
| `renderTimer()` | Writes `formatTime(timerSeconds)` to `#timer-display`; manages `.running` / `.done` classes |
| `startTimer()` | Guards against double-start; sets `timerRunning = true`; opens `setInterval` |
| `stopTimer()` | Clears interval; sets `timerRunning = false`; re-enables Start button |
| `resetTimer()` | Clears interval; resets `timerSeconds = TIMER_DURATION`; calls `renderTimer()` |

`TIMER_DURATION` is a module-level constant (`25 * 60 = 1500` seconds).

### 5. To-Do List

| Function | Purpose |
|----------|---------|
| `loadTasks()` | Parses `LS.TASKS` from localStorage into `tasks[]`; falls back to `[]` on error |
| `saveTasks()` | Serialises `tasks[]` to `LS.TASKS` |
| `createTask(text)` | Returns a new `Task` object with a `Date.now()` string id |
| `addTask()` | Reads `#task-input`, guards against empty, pushes via `createTask`, saves, renders, clears input |
| `toggleTask(id)` | Flips `task.done`; saves; renders |
| `deleteTask(id)` | Filters `tasks` by id; saves; renders |
| `saveEditTask(id, newText)` | Validates non-empty; updates `task.text`; saves; renders |
| `sortTasks(list, sortKey)` | Pure function; returns a sorted copy of `list` without mutating it |
| `renderTasks()` | Clears `#task-list`; calls `sortTasks`; builds DOM nodes; manages empty state |

Sort keys accepted by `sortTasks`:

| Key | Behaviour |
|-----|-----------|
| `"az"` | Ascending `localeCompare` on `.text` |
| `"za"` | Descending `localeCompare` on `.text` |
| `"done-last"` | Undone tasks first (by `Number(done)` ascending) |
| `"done-first"` | Done tasks first (by `Number(done)` descending) |
| `"default"` | Ascending numeric id (insertion order) |

### 6. Quick Links

| Function | Purpose |
|----------|---------|
| `loadLinks()` | Parses `LS.LINKS` from localStorage into `quickLinks[]` |
| `saveLinks()` | Serialises `quickLinks[]` to `LS.LINKS` |
| `normaliseUrl(url)` | Prepends `"https://"` if no `http(s)://` prefix present |
| `faviconUrl(url)` | Returns Google S2 favicon URL for the link's origin |
| `addLink()` | Validates both fields; calls `normaliseUrl`; pushes; saves; renders; clears inputs |
| `deleteLink(id)` | Filters `quickLinks` by id; saves; renders |
| `renderLinks()` | Builds link card DOM nodes; manages empty state |

---

## Data Models

### LocalStorage keys

```javascript
const LS = {
  TASKS:     'dashboard_tasks',     // JSON array of Task
  LINKS:     'dashboard_links',     // JSON array of QuickLink
  USER_NAME: 'dashboard_userName',  // string
  THEME:     'dashboard_theme',     // 'light' | 'dark'
  SORT:      'dashboard_sortOrder', // sort key string
};
```

### Task

```javascript
/**
 * @typedef {{ id: string, text: string, done: boolean, createdAt: number }} Task
 *
 * id        — Date.now().toString() at creation time; used as stable key
 * text      — trimmed task description; max 120 chars (enforced by input maxlength)
 * done      — whether the task is marked complete
 * createdAt — Unix ms timestamp; not currently displayed but preserved for future use
 */
```

### QuickLink

```javascript
/**
 * @typedef {{ id: string, name: string, url: string }} QuickLink
 *
 * id   — Date.now().toString() at creation time
 * name — display label; max 30 chars (enforced by input maxlength)
 * url  — fully qualified URL (always has http(s):// prefix after normalisation)
 */
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property reflection:** Several requirements address the same underlying function (`getGreetingPhrase`, `sortTasks`) from multiple angles. Those have been consolidated into single properties covering the full input space. Persistence round-trips for tasks and links are each captured by one property.

---

### Property 1: Greeting phrase covers all 24 hours

*For any* integer hour in `[0, 23]`, `getGreetingPhrase()` returns exactly one of the four defined phrases (`"Good Morning"`, `"Good Afternoon"`, `"Good Evening"`, `"Good Night"`) and the phrase is determined solely by which range `[5–11]`, `[12–16]`, `[17–20]`, `[21–23, 0–4]` the hour falls in.

**Validates: Requirements 1.2, 1.3, 1.4, 1.5**

---

### Property 2: Timer reset is always idempotent

*For any* timer state — running, paused, or mid-countdown with any remaining `timerSeconds` value — calling `resetTimer()` always results in `timerSeconds === 1500` and `timerRunning === false`.

**Validates: Requirements 4.4**

---

### Property 3: Task addition round-trip

*For any* non-empty, non-whitespace string `text`, after `addTask()` is called with that text, `tasks` contains exactly one more item than before, and that item's `.text` equals `text.trim()`. Immediately calling `saveTasks()` then `loadTasks()` produces a `tasks` array containing an item with the same `text`.

**Validates: Requirements 5.1, 5.6**

---

### Property 4: Task toggle is its own inverse (round-trip)

*For any* task in `tasks[]`, calling `toggleTask(id)` twice in succession leaves `task.done` equal to its original value.

**Validates: Requirements 5.2**

---

### Property 5: Task deletion is final

*For any* `tasks` array containing a task with a given `id`, after `deleteTask(id)`, no element in `tasks` has that `id`.

**Validates: Requirements 5.4**

---

### Property 6: sortTasks produces a correctly ordered copy

*For any* non-empty `tasks` array and any valid `sortKey`, `sortTasks(list, sortKey)` returns an array of the same length as `list` that satisfies the ordering invariant for that key:

- `"az"`: `result[i].text ≤ result[i+1].text` (localeCompare) for all valid `i`
- `"za"`: `result[i].text ≥ result[i+1].text` for all valid `i`
- `"done-last"`: all items where `done === false` precede all items where `done === true`
- `"done-first"`: all items where `done === true` precede all items where `done === false`
- `"default"`: `Number(result[i].id) ≤ Number(result[i+1].id)` for all valid `i`

The original `list` is not mutated.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

---

### Property 7: Quick links persistence round-trip

*For any* `quickLinks` array, calling `saveLinks()` then `loadLinks()` produces an array with the same length, same `id` values, same `name` values, and same `url` values as the original.

**Validates: Requirements 7.7**

---

### Property 8: URL normalisation always produces a valid http(s) URL

*For any* non-empty string `raw`, `normaliseUrl(raw)` returns a string that starts with `"http://"` or `"https://"`. If `raw` already starts with either prefix, the prefix is preserved unchanged.

**Validates: Requirements 7.2**

---

### Property 9: faviconUrl extracts origin correctly

*For any* well-formed absolute URL, `faviconUrl(url)` returns a non-empty string that contains the origin (scheme + host) of that URL.

**Validates: Requirements 7.3**

---

## Error Handling

### localStorage unavailability

`loadTasks()` and `loadLinks()` each wrap their JSON parse in a `try/catch` that falls back to an empty array. This covers corrupt data (manually edited storage, truncated writes) and browsers with storage disabled. The app degrades gracefully — the user loses persistence but all features remain interactive.

### URL parsing errors

`faviconUrl()` wraps `new URL(url)` in a `try/catch` that returns an empty string on failure. The rendered `<img>` element has an `onerror` handler that hides itself, so broken favicons leave no visible artefact.

### Empty-input guards

- `addTask()` returns early if `text.trim()` is empty — no task is created.
- `addLink()` calls `alert()` if either the label or URL field is blank — a simple but adequate guard for a single-user personal tool.
- `saveEditTask()` returns early if the trimmed new text is empty — preserving the existing text.

### Timer double-start guard

`startTimer()` returns early if `timerRunning === true` or `timerSeconds === 0`. The Start button is also set `disabled` once running, providing a redundant UI guard.

---

## Testing Strategy

### PBT applicability assessment

This feature is a mix of pure utility functions (well-suited for property-based testing) and DOM/localStorage side-effect operations (better served by example-based unit tests). The `getGreetingPhrase`, `formatTime`, `sortTasks`, `normaliseUrl`, and `faviconUrl` functions are all pure and have large input spaces — strong PBT candidates. Persistence round-trips over localStorage are also well-suited to property tests via mocking.

DOM interaction (rendering, event handling, CSS class management) and CSS layout rules (responsive breakpoints) are not suitable for PBT and will use example-based tests or visual regression instead.

**Selected PBT library:** [fast-check](https://github.com/dubzzz/fast-check) (JavaScript, runs in Node via a simple test runner such as Vitest or Jest; no bundler required for the test suite itself).

---

### Unit tests (example-based)

Focus on concrete scenarios, integration points, and edge cases that PBT generators are unlikely to stress:

| Area | Examples to cover |
|------|------------------|
| Greeting & Clock | `formatDateTime` output format; name appended to greeting string |
| Theme | `applyTheme('dark')` sets correct attribute; `loadTheme` with no saved pref and dark OS pref |
| Timer | Initial state 25:00; Start sets running state; Stop clears interval; display turns red at 0 |
| To-Do | Whitespace-only task rejected; empty task list shows placeholder; sort preference restored on init |
| Quick Links | Both fields required before add; link renders with `target="_blank"` and `rel="noopener noreferrer"` |
| Persistence | `loadTasks` with corrupt JSON falls back to `[]` |

---

### Property-based tests

Each test below is implemented as a single property test with **≥ 100 iterations** using fast-check's arbitraries.

| Tag | Property |
|-----|----------|
| `Feature: personal-dashboard, Property 1: greeting phrase covers all 24 hours` | `fc.integer({min:0,max:23})` → verify phrase in expected set for range |
| `Feature: personal-dashboard, Property 2: timer reset is always idempotent` | `fc.integer({min:0,max:1500})` × `fc.boolean()` → reset always yields 1500 / false |
| `Feature: personal-dashboard, Property 3: task addition round-trip` | `fc.string({minLength:1}).filter(s => s.trim().length > 0)` → length+1, text matches, survives save/load |
| `Feature: personal-dashboard, Property 4: task toggle is its own inverse` | `fc.record({id: fc.string(), text: fc.string(), done: fc.boolean(), createdAt: fc.integer()})` → double-toggle preserves done |
| `Feature: personal-dashboard, Property 5: task deletion is final` | `fc.array(taskArb, {minLength:1})` + pick random element → id absent after delete |
| `Feature: personal-dashboard, Property 6: sortTasks produces correctly ordered copy` | `fc.array(taskArb)` × `fc.constantFrom('az','za','done-last','done-first','default')` → ordering invariants hold, original unchanged |
| `Feature: personal-dashboard, Property 7: quick links persistence round-trip` | `fc.array(linkArb)` → save/load produces equivalent array |
| `Feature: personal-dashboard, Property 8: URL normalisation always produces valid http(s) URL` | `fc.string({minLength:1})` → result starts with http:// or https:// |
| `Feature: personal-dashboard, Property 9: faviconUrl extracts origin correctly` | `fc.webUrl()` → result contains origin of input URL |

---

### Visual / snapshot tests

CSS layout behaviour is not verifiable through unit tests. Use browser-based snapshot or visual regression tools (e.g. Playwright screenshot comparisons) at three representative breakpoints:

| Breakpoint | Expected layout |
|------------|----------------|
| 1 024 px | Two-column grid; timer + links left, to-do right |
| 768 px | Single-column stacked |
| 375 px | Single-column; reduced font sizes and padding |

---

### Test organisation

Because the project has no bundler, the test suite lives outside the served files:

```
tests/
  unit/
    greeting.test.js
    timer.test.js
    tasks.test.js
    links.test.js
  property/
    greeting.prop.test.js
    timer.prop.test.js
    tasks.prop.test.js
    links.prop.test.js
```

Run with: `npx vitest --run` (or `npx jest --no-coverage`) — neither requires a build step for plain `.js` test files.

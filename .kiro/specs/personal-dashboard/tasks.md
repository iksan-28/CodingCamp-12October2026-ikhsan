# Implementation Plan: Personal Dashboard

## Overview

The core application is already built across three files (`index.html`, `css/style.css`, `js/app.js`). These tasks cover verifying each requirement against the existing implementation, setting up the test environment, writing unit and property-based tests for all nine correctness properties defined in the design, and confirming responsive layout behaviour.

---

## Tasks

- [ ] 1. Set up test environment
  - Install Vitest and fast-check as dev dependencies: `npm init -y` (if no `package.json`) then `npm install --save-dev vitest fast-check`
  - Add a `vitest.config.js` (or `"test"` script in `package.json`) configured for a jsdom environment so DOM-dependent helpers can be tested
  - Create the directory tree `tests/unit/` and `tests/property/`
  - Add a `jsdom` global setup stub that provides a minimal `localStorage` mock for Node test runs
  - _Requirements: all (prerequisite for all test tasks)_

- [ ] 2. Verify and test Greeting & Real-Time Clock
  - [ ] 2.1 Audit `getGreetingPhrase`, `formatDateTime`, and `updateGreeting` in `js/app.js` against Requirements 1.1–1.6; fix any gaps
    - Confirm hour ranges `[5–11]`, `[12–16]`, `[17–20]`, `[21–23, 0–4]` match the spec exactly
    - Confirm `formatDateTime` output matches `"Wednesday, October 14, 2026 · 07:45:30 PM"` format including seconds
    - Confirm `setInterval(updateGreeting, 1000)` is called during `init()`
    - Confirm saved name is appended as `, ${name}!` in the greeting string
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write unit tests for greeting and datetime (`tests/unit/greeting.test.js`)
    - Test `formatDateTime` output format with a fixed known `Date`
    - Test name appended correctly in `updateGreeting` output
    - _Requirements: 1.1, 1.6_

  - [ ]* 2.3 Write property test for greeting phrase covers all 24 hours (`tests/property/greeting.prop.test.js`)
    - **Property 1: Greeting phrase covers all 24 hours**
    - Use `fc.integer({min: 0, max: 23})` to generate hours; verify `getGreetingPhrase` (mocking `Date`) returns exactly one of the four expected phrases and each hour maps to the correct phrase per its range
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**

- [ ] 3. Verify and test Custom User Name
  - [ ] 3.1 Audit `loadName`, `openNameEditor`, `saveName`, and `cancelName` in `js/app.js` against Requirements 2.1–2.4; fix any gaps
    - Confirm `#name-editor` hides/shows correctly on open/cancel
    - Confirm empty-name save removes the localStorage key (rather than writing an empty string)
    - Confirm Enter key in `#name-input` triggers `saveName` and Escape triggers `cancelName`
    - Confirm `loadName` is called during `init()` so persisted name survives reload
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Write unit tests for name persistence (`tests/unit/greeting.test.js`)
    - Test `saveName` writes to `localStorage` and updates the display
    - Test `cancelName` leaves `localStorage` unchanged
    - _Requirements: 2.2, 2.3_

- [ ] 4. Verify and test Dark/Light Mode Toggle
  - [ ] 4.1 Audit `loadTheme`, `applyTheme`, and `toggleTheme` in `js/app.js` against Requirements 3.1–3.4; fix any gaps
    - Confirm `data-theme` attribute is set on `<html>` (not `<body>`)
    - Confirm OS `prefers-color-scheme` fallback fires only when no key is saved in localStorage
    - Confirm icon swap is handled purely via CSS (`.icon-sun` / `.icon-moon` rules in `style.css`) with no JS class manipulation
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.2 Write unit tests for theme (`tests/unit/greeting.test.js`)
    - Test `applyTheme('dark')` sets correct `data-theme` attribute and writes to localStorage
    - Test `loadTheme` with no saved preference and a dark OS preference applies dark theme
    - _Requirements: 3.3, 3.4_

- [ ] 5. Verify and test Focus Timer
  - [ ] 5.1 Audit `formatTime`, `renderTimer`, `startTimer`, `stopTimer`, and `resetTimer` in `js/app.js` against Requirements 4.1–4.6; fix any gaps
    - Confirm initial display is `"25:00"` on load
    - Confirm `.running` class (green) applied when running; `.done` class (red) when `timerSeconds === 0`
    - Confirm Start button is disabled while timer is running (double-start guard)
    - Confirm `stopTimer` pauses (clears interval) and allows resume
    - Confirm `resetTimer` restores `timerSeconds = 1500` and `timerRunning = false` unconditionally
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 5.2 Write unit tests for timer (`tests/unit/timer.test.js`)
    - Test `formatTime(0)` → `"00:00"`, `formatTime(1500)` → `"25:00"`, `formatTime(90)` → `"01:30"`
    - Test Start sets `timerRunning = true` and disables the Start button
    - Test Stop clears the interval and sets `timerRunning = false`
    - Test timer display turns red at `timerSeconds === 0`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [ ]* 5.3 Write property test for timer reset idempotency (`tests/property/timer.prop.test.js`)
    - **Property 2: Timer reset is always idempotent**
    - Use `fc.integer({min: 0, max: 1500})` × `fc.boolean()` to seed `timerSeconds` and `timerRunning`; assert `resetTimer()` always results in `timerSeconds === 1500` and `timerRunning === false`
    - **Validates: Requirements 4.4**

- [ ] 6. Checkpoint — verify greeting, name, theme, and timer
  - Ensure all tests written so far pass with `npx vitest --run`; fix any failures before continuing.

- [ ] 7. Verify and test To-Do List
  - [ ] 7.1 Audit `loadTasks`, `saveTasks`, `createTask`, `addTask`, `toggleTask`, `deleteTask`, and `saveEditTask` in `js/app.js` against Requirements 5.1–5.6; fix any gaps
    - Confirm whitespace-only input is rejected by `addTask` (early return on `text.trim() === ""`)
    - Confirm `saveEditTask` preserves existing text on empty/whitespace new value
    - Confirm done-state strikethrough is applied via `.done` class on the `<li>`
    - Confirm empty-list placeholder `#empty-tasks` is shown/hidden correctly
    - Confirm `loadTasks` wraps JSON.parse in try/catch and falls back to `[]`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 7.2 Write unit tests for to-do list (`tests/unit/tasks.test.js`)
    - Test whitespace-only task is rejected
    - Test empty task list shows placeholder message
    - Test corrupt localStorage JSON for tasks falls back to `[]`
    - _Requirements: 5.1, 5.5, 5.6_

  - [ ]* 7.3 Write property test for task addition round-trip (`tests/property/tasks.prop.test.js`)
    - **Property 3: Task addition round-trip**
    - Use `fc.string({minLength: 1}).filter(s => s.trim().length > 0)` to generate text; assert `tasks` grows by exactly one and the new item's `.text` equals `text.trim()`; call `saveTasks()` then `loadTasks()` and assert the item survives
    - **Validates: Requirements 5.1, 5.6**

  - [ ]* 7.4 Write property test for task toggle round-trip (`tests/property/tasks.prop.test.js`)
    - **Property 4: Task toggle is its own inverse**
    - Use `fc.record({id: fc.string(), text: fc.string(), done: fc.boolean(), createdAt: fc.integer()})` to generate a task; assert double-calling `toggleTask(id)` leaves `done` equal to its original value
    - **Validates: Requirements 5.2**

  - [ ]* 7.5 Write property test for task deletion finality (`tests/property/tasks.prop.test.js`)
    - **Property 5: Task deletion is final**
    - Use `fc.array(taskArbitrary, {minLength: 1})` and pick a random element; assert no element in `tasks` has that `id` after `deleteTask(id)`
    - **Validates: Requirements 5.4**

- [ ] 8. Verify and test Task Sorting
  - [ ] 8.1 Audit `sortTasks` and `handleSortChange` in `js/app.js` against Requirements 6.1–6.6; fix any gaps
    - Confirm `sortTasks` is a pure function (returns a sorted copy, does not mutate the input)
    - Confirm all five sort keys are handled: `az`, `za`, `done-last`, `done-first`, `default`
    - Confirm `handleSortChange` writes to `LS.SORT` and calls `renderTasks()`
    - Confirm `init()` restores the saved sort value into `#sort-select`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 8.2 Write unit tests for sort persistence (`tests/unit/tasks.test.js`)
    - Test sort preference is written to localStorage on change
    - Test sort preference is restored from localStorage on init
    - _Requirements: 6.6_

  - [ ]* 8.3 Write property test for sortTasks ordering (`tests/property/tasks.prop.test.js`)
    - **Property 6: sortTasks produces a correctly ordered copy**
    - Use `fc.array(taskArbitrary)` × `fc.constantFrom('az','za','done-last','done-first','default')` to generate inputs; assert ordering invariant for each key holds and the original array is not mutated
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 9. Checkpoint — verify to-do list and sorting
  - Ensure all tests written so far pass with `npx vitest --run`; fix any failures before continuing.

- [ ] 10. Verify and test Quick Links
  - [ ] 10.1 Audit `loadLinks`, `saveLinks`, `normaliseUrl`, `faviconUrl`, `addLink`, `deleteLink`, and `renderLinks` in `js/app.js` against Requirements 7.1–7.7; fix any gaps
    - Confirm `addLink` calls `alert` and returns early when either field is blank
    - Confirm `normaliseUrl` prepends `https://` only when no `http(s)://` prefix is present
    - Confirm each `<a>` in the links grid has `target="_blank"` and `rel="noopener noreferrer"`
    - Confirm `faviconUrl` wraps `new URL()` in try/catch and returns `""` on failure
    - Confirm the favicon `<img>` has an `onerror` handler that hides it on load failure
    - Confirm `loadLinks` wraps JSON.parse in try/catch and falls back to `[]`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 10.2 Write unit tests for quick links (`tests/unit/links.test.js`)
    - Test both fields required before add (alert triggered, no new link added)
    - Test rendered link card has `target="_blank"` and `rel="noopener noreferrer"`
    - Test corrupt localStorage JSON for links falls back to `[]`
    - _Requirements: 7.1, 7.6, 7.7_

  - [ ]* 10.3 Write property test for URL normalisation (`tests/property/links.prop.test.js`)
    - **Property 8: URL normalisation always produces a valid http(s) URL**
    - Use `fc.string({minLength: 1})` to generate raw URL strings; assert `normaliseUrl(raw)` always returns a string starting with `"http://"` or `"https://"`; assert that strings already starting with either prefix are returned unchanged
    - **Validates: Requirements 7.2**

  - [ ]* 10.4 Write property test for faviconUrl origin extraction (`tests/property/links.prop.test.js`)
    - **Property 9: faviconUrl extracts origin correctly**
    - Use `fc.webUrl()` to generate well-formed absolute URLs; assert `faviconUrl(url)` returns a non-empty string containing the origin (scheme + host) of the input URL
    - **Validates: Requirements 7.3**

  - [ ]* 10.5 Write property test for quick links persistence round-trip (`tests/property/links.prop.test.js`)
    - **Property 7: Quick links persistence round-trip**
    - Use `fc.array(linkArbitrary)` to generate link arrays; call `saveLinks()` then `loadLinks()` and assert the result has the same length and the same `id`, `name`, and `url` values as the original
    - **Validates: Requirements 7.7**

- [ ] 11. Verify Responsive Layout
  - [ ] 11.1 Audit CSS media queries in `css/style.css` against Requirement 8
    - Confirm `@media (max-width: 768px)` switches grid to single-column and overrides `#todo-section` grid-row to `auto`
    - Confirm `@media (max-width: 480px)` reduces `timer-display` font size and `card` padding
    - Confirm `add-link-form` collapses to single-column at `≤768px`
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 11.2 Write snapshot/visual regression tests for layout breakpoints
    - At 1024 px: two-column grid, timer + links left, to-do right
    - At 768 px: single-column stacked layout
    - At 375 px: reduced font sizes and card padding
    - Use Playwright screenshot comparisons or equivalent browser-based tool
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 12. Final checkpoint — all tests pass
  - Run `npx vitest --run` and confirm every unit and property test passes with zero failures; fix any remaining issues before considering the implementation complete.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP pass
- The implementation files (`index.html`, `css/style.css`, `js/app.js`) are already substantially built; audit tasks (x.1 steps) focus on verifying correctness against the spec and patching any gaps rather than building from scratch
- Property tests require a `localStorage` mock in the jsdom environment; use Vitest's `vi.stubGlobal` or a setup file to provide it
- Run tests in single-execution mode: `npx vitest --run` (not watch mode)
- Each property test must run **≥ 100 iterations** (fast-check default)
- The `taskArbitrary` and `linkArbitrary` helpers should be defined once in a shared `tests/helpers/arbitraries.js` file and imported by all property test files

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1", "7.1", "8.1", "10.1", "11.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "4.2", "5.2", "5.3", "7.2", "8.2", "10.2", "11.2"] },
    { "id": 3, "tasks": ["7.3", "7.4", "7.5", "8.3", "10.3", "10.4", "10.5"] }
  ]
}
```

# Requirements

## Requirement 1: Greeting & Real-Time Clock

**User Story:** As a user, I want to see a personalized greeting and live date/time so that I always know the current time and feel welcomed.

### Acceptance Criteria
- WHEN the page loads, THEN the current date and time are displayed and update every second
- WHEN the hour is between 5-11, THEN the greeting reads "Good Morning"
- WHEN the hour is between 12-16, THEN the greeting reads "Good Afternoon"
- WHEN the hour is between 17-20, THEN the greeting reads "Good Evening"
- WHEN the hour is between 21-4, THEN the greeting reads "Good Night"
- WHEN a name is saved, THEN it is appended to the greeting (e.g. "Good Morning, Ikhsan!")

## Requirement 2: Custom User Name

**User Story:** As a user, I want to set and edit my name so that the dashboard greets me personally.

### Acceptance Criteria
- WHEN I click the edit button, THEN an inline input field appears
- WHEN I type a name and click Save or press Enter, THEN the name is saved to localStorage
- WHEN I click Cancel or press Escape, THEN the editor closes without saving
- WHEN the page reloads, THEN the saved name persists

## Requirement 3: Dark / Light Mode Toggle

**User Story:** As a user, I want to switch between light and dark mode so that I can use the dashboard comfortably in any lighting condition.

### Acceptance Criteria
- WHEN I click the theme toggle button, THEN the page switches between light and dark mode
- WHEN dark mode is active, THEN the moon icon is hidden and sun icon is shown, and vice versa
- WHEN the page loads, THEN the saved theme preference is applied
- IF no preference is saved, THEN the system color-scheme preference is respected

## Requirement 4: Focus Timer (Pomodoro)

**User Story:** As a user, I want a 25-minute focus timer so that I can track my work sessions.

### Acceptance Criteria
- WHEN the page loads, THEN the timer displays 25:00
- WHEN I click Start, THEN the countdown begins and the display turns green
- WHEN I click Stop, THEN the timer pauses and can be resumed
- WHEN I click Reset, THEN the timer returns to 25:00
- WHEN the timer reaches 0, THEN the display turns red and a completion message appears
- WHEN the timer is running, THEN the Start button is disabled

## Requirement 5: To-Do List

**User Story:** As a user, I want to manage a to-do list so that I can track my tasks.

### Acceptance Criteria
- WHEN I type a task and click Add or press Enter, THEN the task is added to the list
- WHEN I check a task checkbox, THEN the task is marked as done with strikethrough styling
- WHEN I click the edit button, THEN I can edit the task text inline; pressing Enter or blur saves it
- WHEN I click the delete button, THEN the task is removed
- WHEN the list is empty, THEN a placeholder message is shown
- WHEN the page reloads, THEN all tasks and their done state persist via localStorage

## Requirement 6: Task Sorting

**User Story:** As a user, I want to sort my to-do tasks so that I can view them in a useful order.

### Acceptance Criteria
- WHEN I select "A to Z", THEN tasks are sorted alphabetically ascending
- WHEN I select "Z to A", THEN tasks are sorted alphabetically descending
- WHEN I select "Undone first", THEN incomplete tasks appear before done tasks
- WHEN I select "Done first", THEN completed tasks appear first
- WHEN I select "Default", THEN tasks are shown in insertion order
- WHEN the page reloads, THEN the last selected sort order is restored from localStorage

## Requirement 7: Quick Links

**User Story:** As a user, I want to save and access quick links so that I can open frequently visited sites easily.

### Acceptance Criteria
- WHEN I enter a label and URL and click Add Link, THEN a link card appears in the grid
- WHEN a URL is entered without a protocol, THEN "https://" is prepended automatically
- WHEN a link card is rendered, THEN the site favicon is fetched and displayed
- WHEN I hover over a link card, THEN a delete button appears
- WHEN I click the delete button, THEN the link is removed
- WHEN I click a link card, THEN the URL opens in a new tab
- WHEN the page reloads, THEN all saved links persist via localStorage

## Requirement 8: Responsive Layout

**User Story:** As a user, I want the dashboard to work well on all screen sizes so that I can use it on mobile or desktop.

### Acceptance Criteria
- WHEN the viewport is wider than 768px, THEN a two-column grid layout is used
- WHEN the viewport is 768px or narrower, THEN a single-column stacked layout is used
- WHEN the viewport is 480px or narrower, THEN font sizes and card padding are reduced for compact display
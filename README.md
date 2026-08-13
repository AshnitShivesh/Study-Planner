# Study Planner

Study Planner is a simple web-based tool for keeping track of college assignments, tests, projects, and other academic work.

The idea was to make something practical that I would actually use instead of having deadlines spread across different apps, notes, and messages.

## Features

- Add assignments, tests, projects, and other tasks
- Add the subject and deadline for each task
- Set task priority
- Add estimated study time
- Search through tasks
- Filter tasks by subject and type
- Sort tasks by deadline, priority, or study time
- Mark tasks as completed
- Shows which task should be worked on next
- Saves tasks using browser localStorage
- Responsive layout for smaller screens

## How it works

When a task is added, the planner stores its details in the browser.

The "Next Up" section looks at:

- Task priority
- How close the deadline is
- Estimated time required

It then gives each task a score and uses that score to decide which task should be given attention first.

Completed tasks are removed from the active task count but remain visible in the task list.

## Tech Stack

- HTML
- CSS
- JavaScript
- LocalStorage

No frameworks or external backend are used.

## Project Structure

```text
study-planner/
│
├── index.html
├── style.css
├── script.js
└── README.md

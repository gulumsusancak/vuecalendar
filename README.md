Vue.js Calendar
A responsive and interactive calendar application built with Vue.js for task and appointment management.

Features

Interactive Calendar: Monthly view with navigation between months and years
Task Management: Add, edit, and delete tasks for specific dates
Drag & Drop: Easily move tasks between dates with drag-and-drop functionality
Priority Levels: Organize tasks with three priority levels (High, Medium, Low)
Visual Indicators: Color-coded dots show task priorities directly on the calendar
Filtering: Filter tasks by priority level
Persistence: Tasks are automatically saved to localStorage
Responsive Design: Works well on desktop and mobile devices

Technical Details

This application is built with:

Vue.js 3: Using the Composition API for state management
Pinia: State management for task data
Bootstrap 5: Styling and responsive design
Bootstrap Icons: Icon support throughout the application
LocalStorage API: For persistent data storage

Components

CalendarComponent: Main calendar view with month navigation and day cells
TaskList: List of tasks for the selected date with filtering capabilities
AddTaskModal: Modal for creating new tasks
calendarStore: Pinia store for centralized state management

Usage
Calendar Navigation

Use the arrows to navigate between months
Click on any date to view, add, or manage tasks for that day

Task Management

Click on a date to view its tasks
Use the "Nieuwe Taak" button to add new tasks
Edit or delete tasks using the corresponding icons
Drag tasks between dates to reschedule them
Filter tasks by priority using the dropdown selector

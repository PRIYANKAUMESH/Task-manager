
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const allCount = document.getElementById("allCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const visibleCount = document.getElementById("visibleCount");
const listTitle = document.getElementById("listTitle");
const listSubtitle = document.getElementById("listSubtitle");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");

const navItems = document.querySelectorAll(".nav-item");


// Load saved tasks from LocalStorage
let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("personalTasks") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            Number.isFinite(task.id) &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}


// Current filter
let currentFilter = "all";


// Display today's date
document.getElementById("todayDate").textContent =
    new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(new Date());


// Show notification
let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// Save tasks to LocalStorage
function saveTasks() {
    try {
        localStorage.setItem(
            "personalTasks",
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error("Could not save tasks:", error);
        showToast("Unable to save tasks in this browser.");
    }
}


// Add a new task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        showToast("Please enter a task.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    saveTasks();

    currentFilter = "all";
    updateActiveNavigation();
    renderTasks();
    updateDashboard();

    taskForm.reset();
    taskInput.focus();

    showToast("Task added successfully!");
});


// Mark a task completed or pending
function toggleTask(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
    updateDashboard();

    const task = tasks.find(task => task.id === id);

    showToast(
        task.completed
            ? "Great job! Task completed."
            : "Task moved back to pending."
    );
}


// Delete a task
function deleteTask(id) {
    const taskExists = tasks.some(task => task.id === id);

    if (!taskExists) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
    updateDashboard();

    showToast("Task deleted successfully.");
}


// Filter navigation
navItems.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;

        updateActiveNavigation();
        renderTasks();
    });
});


// Highlight selected filter
function updateActiveNavigation() {
    navItems.forEach(function(button) {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });
}


// Render the task list
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(task => !task.completed);
        listTitle.textContent = "Pending Tasks";
        listSubtitle.textContent = "One step at a time. You've got this.";
    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
        listTitle.textContent = "Completed Tasks";
        listSubtitle.textContent = "Look at everything you've achieved!";
    } else {
        listTitle.textContent = "All Tasks";
        listSubtitle.textContent = "Everything you need to do.";
    }

    visibleCount.textContent =
        `${filteredTasks.length} ${
            filteredTasks.length === 1 ? "task" : "tasks"
        }`;

    // Show the empty state when there are no matching tasks
    if (filteredTasks.length === 0) {
        emptyState.style.display = "block";

        if (currentFilter === "pending") {
            emptyTitle.textContent = "All caught up!";
            emptyMessage.textContent =
                "You have no pending tasks. Enjoy your progress!";
        } else if (currentFilter === "completed") {
            emptyTitle.textContent = "Not yet, but soon!";
            emptyMessage.textContent =
                "Complete a task and it will appear here.";
        } else {
            emptyTitle.textContent = "A fresh start!";
            emptyMessage.textContent =
                "Add your first task and make today productive.";
        }

        return;
    }

    emptyState.style.display = "none";

    filteredTasks.forEach(function(task) {
        const taskItem = document.createElement("article");

        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("is-completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.title} as ${
                task.completed ? "pending" : "completed"
            }`
        );

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });

        // Task information
        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const taskText = document.createElement("p");
        taskText.className = "task-text";
        taskText.textContent = task.title;

        const taskMeta = document.createElement("span");
        taskMeta.className = "task-meta";

        const createdDate = task.createdAt
            ? new Date(task.createdAt)
            : new Date();

        taskMeta.textContent =
            "Added " +
            new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short"
            }).format(
                Number.isNaN(createdDate.getTime())
                    ? new Date()
                    : createdDate
            );

        taskInfo.append(taskText, taskMeta);

        // Status
        const status = document.createElement("span");

        status.className = task.completed
            ? "status-pill status-completed"
            : "status-pill status-pending";

        status.textContent = task.completed
            ? "Completed"
            : "Pending";

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete task";
        deleteButton.setAttribute(
            "aria-label",
            `Delete task: ${task.title}`
        );

        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

        taskItem.append(
            checkbox,
            taskInfo,
            status,
            deleteButton
        );

        taskList.appendChild(taskItem);
    });
}


// Update statistics and progress
function updateDashboard() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;

    allCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    progressPercent.textContent = percentage + "%";
    progressFill.style.width = percentage + "%";
}


// Initial page setup
updateActiveNavigation();
renderTasks();
updateDashboard();

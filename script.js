let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];

const modal = document.getElementById("modal");
const taskList = document.getElementById("taskList");
const nextTask = document.getElementById("nextTask");
const taskCount = document.getElementById("taskCount");

const search = document.getElementById("search");
const subjectFilter = document.getElementById("subjectFilter");
const typeFilter = document.getElementById("typeFilter");
const sort = document.getElementById("sort");

const sideSubjects = document.getElementById("sideSubjects");

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function openModal() {
    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
}

document.getElementById("addTaskBtn").addEventListener("click", openModal);

const mobileAddBtn = document.getElementById("mobileAddBtn");

if (mobileAddBtn) {
    mobileAddBtn.addEventListener("click", openModal);
}

document.getElementById("close").addEventListener("click", closeModal);

modal.addEventListener("click", function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

document.getElementById("saveTask").addEventListener("click", function() {

    const name = document.getElementById("taskName").value.trim();
    const subject = document.getElementById("taskSubject").value.trim();
    const type = document.getElementById("taskType").value;
    const deadline = document.getElementById("taskDate").value;
    const hours = Number(document.getElementById("taskHours").value);
    const priority = Number(document.getElementById("taskPriority").value);

    if (name === "" || subject === "" || deadline === "" || hours <= 0) {
        alert("Please fill in all the fields.");
        return;
    }

    const task = {
        id: Date.now(),
        name: name,
        subject: subject,
        type: type,
        deadline: deadline,
        hours: hours,
        priority: priority,
        completed: false
    };

    tasks.unshift(task);

    saveTasks();
    updateSubjects();
    updateSidebarSubjects();
    displayTasks();

    document.getElementById("taskName").value = "";
    document.getElementById("taskSubject").value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskHours").value = "";

    closeModal();

    showMessage("Task added.");
});

function displayTasks() {

    let filtered = [...tasks];

    const searchText = search.value.toLowerCase();

    if (searchText !== "") {
        filtered = filtered.filter(function(task) {
            return (
                task.name.toLowerCase().includes(searchText) ||
                task.subject.toLowerCase().includes(searchText)
            );
        });
    }

    if (subjectFilter.value !== "all") {
        filtered = filtered.filter(function(task) {
            return task.subject === subjectFilter.value;
        });
    }

    if (typeFilter.value !== "all") {
        filtered = filtered.filter(function(task) {
            return task.type === typeFilter.value;
        });
    }

    if (sort.value === "deadline") {
        filtered.sort(function(a, b) {
            return new Date(a.deadline) - new Date(b.deadline);
        });
    }

    if (sort.value === "priority") {
        filtered.sort(function(a, b) {
            return b.priority - a.priority;
        });
    }

    if (sort.value === "time") {
        filtered.sort(function(a, b) {
            return b.hours - a.hours;
        });
    }

    const activeTasks = tasks.filter(function(task) {
        return !task.completed;
    });

    taskCount.textContent =
        activeTasks.length +
        (activeTasks.length === 1 ? " active task" : " active tasks");

    updateNextTask(activeTasks);

    if (filtered.length === 0) {

        taskList.innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No tasks here
                </h3>

                <p>
                    ${
                        tasks.length === 0
                        ? "Add your first assignment, test or project."
                        : "Try changing your search or filters."
                    }
                </p>

                <button class="save-btn" id="emptyAdd">
                    Add Task
                </button>

            </div>
        `;

        document.getElementById("emptyAdd").addEventListener(
            "click",
            openModal
        );

        return;
    }

    taskList.innerHTML = "";

    filtered.forEach(function(task) {

        const element = document.createElement("div");

        element.className =
            "task" + (task.completed ? " completed" : "");

        element.innerHTML = `

            <button
                class="complete-box ${task.completed ? "done" : ""}"
                data-id="${task.id}">
            </button>

            <div>

                <div class="task-name">
                    ${task.name}
                </div>

                <div class="task-info">
                    ${task.subject} · ${task.type}
                </div>

            </div>

            <div class="task-right">

                <div class="task-deadline">
                    ${formatDate(task.deadline)}
                </div>

                <div class="task-hours">
                    ${task.hours} hour${task.hours == 1 ? "" : "s"}
                </div>

                <span class="priority ${getPriorityClass(task.priority)}">
                    ${getPriorityText(task.priority)}
                </span>

            </div>
        `;

        taskList.appendChild(element);
    });

    document.querySelectorAll(".complete-box").forEach(function(button) {

        button.addEventListener("click", function() {
            completeTask(Number(this.dataset.id));
        });

    });
}

function updateNextTask(activeTasks) {

    if (activeTasks.length === 0) {

        nextTask.innerHTML = `
            <p class="empty-next">
                No tasks added yet.
            </p>
        `;

        return;
    }

    const sorted = [...activeTasks].sort(function(a, b) {
        return getScore(b) - getScore(a);
    });

    const task = sorted[0];

    nextTask.innerHTML = `
        <div class="next-task">

            <div class="next-task-name">
                ${task.name}
            </div>

            <div class="next-task-info">
                ${task.subject}
                ·
                ${formatDate(task.deadline)}
                ·
                ${task.hours} hour${task.hours == 1 ? "" : "s"}
            </div>

            <div class="next-task-priority">
                ${getPriorityText(task.priority)} PRIORITY
            </div>

        </div>
    `;
}

function getScore(task) {

    const today = new Date();
    const deadline = new Date(task.deadline);

    const days =
        (deadline - today) /
        (1000 * 60 * 60 * 24);

    let score = task.priority * 30;

    if (days <= 1) {
        score += 40;
    } else if (days <= 3) {
        score += 30;
    } else if (days <= 7) {
        score += 20;
    } else {
        score += 10;
    }

    score += Math.min(task.hours * 3, 20);

    return score;
}

function completeTask(id) {

    tasks = tasks.map(function(task) {

        if (task.id === id) {
            task.completed = !task.completed;
        }

        return task;
    });

    saveTasks();
    displayTasks();
    showMessage("Task updated.");
}

function updateSubjects() {

    const subjects = [];

    tasks.forEach(function(task) {

        if (
            task.subject &&
            !subjects.includes(task.subject)
        ) {
            subjects.push(task.subject);
        }

    });

    const current = subjectFilter.value;

    subjectFilter.innerHTML = `
        <option value="all">
            All Subjects
        </option>
    `;

    subjects.sort();

    subjects.forEach(function(subject) {

        const option = document.createElement("option");

        option.value = subject;
        option.textContent = subject;

        subjectFilter.appendChild(option);
    });

    if (subjects.includes(current)) {
        subjectFilter.value = current;
    }
}

function updateSidebarSubjects() {

    if (!sideSubjects) {
        return;
    }

    const subjects = [];

    tasks.forEach(function(task) {

        if (
            task.subject &&
            !subjects.includes(task.subject)
        ) {
            subjects.push(task.subject);
        }

    });

    if (subjects.length === 0) {

        sideSubjects.innerHTML =
            "<span>No subjects yet</span>";

        return;
    }

    sideSubjects.innerHTML = "";

    subjects.sort();

    subjects.forEach(function(subject) {

        const item = document.createElement("span");

        item.textContent = subject;

        sideSubjects.appendChild(item);
    });
}

function getPriorityText(priority) {

    if (priority === 3) {
        return "HIGH";
    }

    if (priority === 2) {
        return "MEDIUM";
    }

    return "LOW";
}

function getPriorityClass(priority) {

    if (priority === 3) {
        return "priority-high";
    }

    if (priority === 2) {
        return "priority-medium";
    }

    return "priority-low";
}

function formatDate(date) {

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
    });
}

function showMessage(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.remove("hidden");

    setTimeout(function() {
        toast.classList.add("hidden");
    }, 2000);
}

search.addEventListener("input", displayTasks);

subjectFilter.addEventListener("change", displayTasks);

typeFilter.addEventListener("change", displayTasks);

sort.addEventListener("change", displayTasks);

updateSubjects();
updateSidebarSubjects();
displayTasks();
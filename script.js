let tasks = JSON.parse(
    localStorage.getItem("studyTasks")
) || [];

let search =
    document.getElementById("search");

let subjectFilter =
    document.getElementById("subjectFilter");

let typeFilter =
    document.getElementById("typeFilter");

let sort =
    document.getElementById("sort");

let taskList =
    document.getElementById("taskList");

let taskCount =
    document.getElementById("taskCount");

let nextTask =
    document.getElementById("nextTask");

let modal =
    document.getElementById("modal");

let taskPriority = 1;


function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );

}


function getPriorityText(priority) {

    if (priority == 3) {
        return "HIGH";
    }

    if (priority == 2) {
        return "MEDIUM";
    }

    return "LOW";

}


function getPriorityClass(priority) {

    if (priority == 3) {
        return "priority-high";
    }

    if (priority == 2) {
        return "priority-medium";
    }

    return "priority-low";

}


function displayTasks() {

    let filteredTasks = [...tasks];

    let searchText =
        search.value.toLowerCase();


    if (searchText !== "") {

        filteredTasks =
            filteredTasks.filter(function(task) {

                return (
                    task.name
                        .toLowerCase()
                        .includes(searchText) ||

                    task.subject
                        .toLowerCase()
                        .includes(searchText)
                );

            });

    }


    if (subjectFilter.value !== "all") {

        filteredTasks =
            filteredTasks.filter(function(task) {

                return task.subject ===
                    subjectFilter.value;

            });

    }


    if (typeFilter.value !== "all") {

        filteredTasks =
            filteredTasks.filter(function(task) {

                return task.type ===
                    typeFilter.value;

            });

    }


    if (sort.value === "deadline") {

        filteredTasks.sort(function(a, b) {

            return new Date(a.deadline) -
                new Date(b.deadline);

        });

    }


    if (sort.value === "priority") {

        filteredTasks.sort(function(a, b) {

            return b.priority -
                a.priority;

        });

    }


    if (sort.value === "time") {

        filteredTasks.sort(function(a, b) {

            return b.hours -
                a.hours;

        });

    }


    let activeTasks =
        tasks.filter(function(task) {

            return !task.completed;

        });


    taskCount.textContent =
        activeTasks.length +
        " active task" +
        (activeTasks.length === 1 ? "" : "s");


    updateNextTask(activeTasks);


    if (filteredTasks.length === 0) {

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

                <button
                    class="main-btn"
                    id="emptyAdd">

                    Add Task

                </button>

            </div>

        `;


        document
            .getElementById("emptyAdd")
            .addEventListener(
                "click",
                openModal
            );


        return;

    }


    taskList.innerHTML = "";


    filteredTasks.forEach(function(task) {

        let element =
            document.createElement("div");


        element.className =
            "task" +
            (task.completed
                ? " completed"
                : "");


        element.innerHTML = `

            <button
                class="complete-box ${
                    task.completed ? "done" : ""
                }"
                data-id="${task.id}">
            </button>


            <div>

                <div class="task-name">
                    ${task.name}
                </div>

                <div class="task-info">

                    ${task.subject}
                    ·
                    ${task.type}

                </div>

            </div>


            <div class="task-right">

                <div class="task-deadline">

                    ${formatDate(task.deadline)}

                </div>

                <div class="task-hours">

                    ${task.hours} hour${
                        task.hours == 1 ? "" : "s"
                    }

                </div>

                <span
                    class="priority ${
                        getPriorityClass(task.priority)
                    }">

                    ${getPriorityText(task.priority)}

                </span>

            </div>

        `;


        taskList.appendChild(element);

    });


    document
        .querySelectorAll(".complete-box")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    completeTask(
                        Number(this.dataset.id)
                    );

                }
            );

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


    let sorted =
        [...activeTasks].sort(function(a, b) {

            let scoreA =
                getScore(a);

            let scoreB =
                getScore(b);

            return scoreB - scoreA;

        });


    let task = sorted[0];


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
                ${task.hours} hour${
                    task.hours == 1 ? "" : "s"
                }

            </div>

            <div class="next-task-priority">

                ${getPriorityText(task.priority)}
                PRIORITY

            </div>

        </div>

    `;

}


function getScore(task) {

    let today =
        new Date();

    let deadline =
        new Date(task.deadline);

    let difference =
        deadline - today;

    let days =
        difference /
        (1000 * 60 * 60 * 24);


    let score =
        task.priority * 30;


    if (days <= 1) {

        score += 40;

    } else if (days <= 3) {

        score += 30;

    } else if (days <= 7) {

        score += 20;

    } else {

        score += 10;

    }


    score +=
        Math.min(task.hours * 3, 20);


    return score;

}


function formatDate(date) {

    let d =
        new Date(date);


    return d.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );

}


function completeTask(id) {

    tasks =
        tasks.map(function(task) {

            if (task.id === id) {

                task.completed =
                    !task.completed;

            }

            return task;

        });


    saveTasks();

    displayTasks();

    showMessage("Task updated.");

}


function updateSubjects() {

    let subjects = [];


    tasks.forEach(function(task) {

        if (
            task.subject &&
            !subjects.includes(task.subject)
        ) {

            subjects.push(task.subject);

        }

    });


    let current =
        subjectFilter.value;


    subjectFilter.innerHTML = `

        <option value="all">
            All Subjects
        </option>

    `;


    subjects.sort();


    subjects.forEach(function(subject) {

        let option =
            document.createElement("option");

        option.value = subject;

        option.textContent = subject;

        subjectFilter.appendChild(option);

    });


    if (subjects.includes(current)) {

        subjectFilter.value = current;

    }

}


function openModal() {

    modal.classList.remove("hidden");

}


function closeModal() {

    modal.classList.add("hidden");

}


document
    .getElementById("addTaskBtn")
    .addEventListener(
        "click",
        openModal
    );


document
    .getElementById("heroAddBtn")
    .addEventListener(
        "click",
        openModal
    );


document
    .getElementById("viewTasksBtn")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById("tasks")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


document
    .getElementById("close")
    .addEventListener(
        "click",
        closeModal
    );


modal.addEventListener(
    "click",
    function(event) {

        if (event.target === modal) {

            closeModal();

        }

    }
);


document
    .getElementById("saveTask")
    .addEventListener(
        "click",
        function() {

            let name =
                document
                    .getElementById("taskName")
                    .value
                    .trim();


            let subject =
                document
                    .getElementById("taskSubject")
                    .value
                    .trim();


            let type =
                document
                    .getElementById("taskType")
                    .value;


            let deadline =
                document
                    .getElementById("taskDate")
                    .value;


            let hours =
                Number(
                    document
                        .getElementById("taskHours")
                        .value
                );


            let priority =
                Number(
                    document
                        .getElementById("taskPriority")
                        .value
                );


            if (
                name === "" ||
                subject === "" ||
                deadline === "" ||
                hours <= 0
            ) {

                alert(
                    "Please fill in all the fields."
                );

                return;

            }


            let task = {

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

            displayTasks();

            closeModal();


            document
                .getElementById("taskName")
                .value = "";


            document
                .getElementById("taskSubject")
                .value = "";


            document
                .getElementById("taskDate")
                .value = "";


            document
                .getElementById("taskHours")
                .value = "";


            showMessage(
                "Task added."
            );

        }
    );


function showMessage(message) {

    let toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.remove(
        "hidden"
    );


    setTimeout(function() {

        toast.classList.add(
            "hidden"
        );

    }, 2000);

}


search.addEventListener(
    "input",
    displayTasks
);


subjectFilter.addEventListener(
    "change",
    displayTasks
);


typeFilter.addEventListener(
    "change",
    displayTasks
);


sort.addEventListener(
    "change",
    displayTasks
);


updateSubjects();

displayTasks();
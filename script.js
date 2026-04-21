const taskForm = document.getElementById("taskForm");
const taskNameInput = document.getElementById("taskName");
const taskDeadlineInput = document.getElementById("taskDeadline");
const taskStatusInput = document.getElementById("taskStatus");
const taskList = document.getElementById("taskList");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const totalTasksElement = document.getElementById("totalTasks");
const pendingTasksElement = document.getElementById("pendingTasks");
const completedTasksElement = document.getElementById("completedTasks");
const taskCardTemplate = document.getElementById("taskCardTemplate");

const tasks = [];
let editingTaskId = null;

function formatDeadline(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

function getStatusClass(status) {
    return status.toLowerCase().replace(/\s+/g, "-");
}

function resetForm() {
    taskForm.reset();
    taskStatusInput.value = "Pending";
    editingTaskId = null;
    submitButton.textContent = "Add Task";
    cancelEditButton.classList.add("hidden");
}

function updateStats() {
    totalTasksElement.textContent = tasks.length;
    pendingTasksElement.textContent = tasks.filter((task) => task.status !== "Completed").length;
    completedTasksElement.textContent = tasks.filter((task) => task.status === "Completed").length;
}

function renderEmptyState() {
    taskList.innerHTML = '<div class="empty-state">No tasks yet. Add your first item to start tracking work.</div>';
}

function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        renderEmptyState();
        updateStats();
        return;
    }

    tasks
        .slice()
        .sort((left, right) => left.deadline.localeCompare(right.deadline))
        .forEach((task) => {
            const taskCard = taskCardTemplate.content.firstElementChild.cloneNode(true);
            const statusBadge = taskCard.querySelector(".task-card__status");

            statusBadge.textContent = task.status;
            statusBadge.classList.add(getStatusClass(task.status));
            taskCard.querySelector(".task-card__title").textContent = task.name;
            taskCard.querySelector(".task-card__deadline").textContent = formatDeadline(task.deadline);
            taskCard.querySelector(".task-card__status-text").textContent = task.status;

            taskCard.querySelector(".edit-button").addEventListener("click", () => {
                editingTaskId = task.id;
                taskNameInput.value = task.name;
                taskDeadlineInput.value = task.deadline;
                taskStatusInput.value = task.status;
                submitButton.textContent = "Save Changes";
                cancelEditButton.classList.remove("hidden");
                taskNameInput.focus();
            });

            taskCard.querySelector(".delete-button").addEventListener("click", () => {
                const taskIndex = tasks.findIndex((entry) => entry.id === task.id);

                if (taskIndex !== -1) {
                    tasks.splice(taskIndex, 1);

                    if (editingTaskId === task.id) {
                        resetForm();
                    }

                    renderTasks();
                }
            });

            taskList.appendChild(taskCard);
        });

    updateStats();
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const taskData = {
        name: taskNameInput.value.trim(),
        deadline: taskDeadlineInput.value,
        status: taskStatusInput.value
    };

    if (!taskData.name || !taskData.deadline || !taskData.status) {
        return;
    }

    if (editingTaskId) {
        const existingTask = tasks.find((task) => task.id === editingTaskId);

        if (existingTask) {
            existingTask.name = taskData.name;
            existingTask.deadline = taskData.deadline;
            existingTask.status = taskData.status;
        }
    } else {
        tasks.push({
            id: crypto.randomUUID(),
            ...taskData
        });
    }

    resetForm();
    renderTasks();
});

cancelEditButton.addEventListener("click", () => {
    resetForm();
});

resetForm();
renderTasks();
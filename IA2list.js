// ----------------------
// PART 2: ADD TEAMMATES
// ----------------------

const addBtn = document.querySelector(".input-row .btn.btn-blue"); // first blue button
const teammateInput = document.querySelector(".teammate-input");
const teammateDropdown = document.querySelector(".teammate-dropdown");

// Keep a teammates list
let teammates = [];

addBtn.addEventListener("click", (event) => {
    event.preventDefault(); // stop page reload

    const name = teammateInput.value.trim();

    // 1. Prevent empty input
    if (name === "") {
        showMessage("Please enter a teammate name.");
        return;
    }

    // 2. Prevent duplicates
    for (let option of teammateDropdown.options) {
        if (option.value.toLowerCase() === name.toLowerCase()) {
            showMessage(`${name} already exists!`);
            return;
        }
    }

    // 3. Add teammate to array
    teammates.push(name);
    teammates.sort();

    // 4. Refresh dropdown
    updateDropdown();

    // 5. Clear input + message
    teammateInput.value = "";
    clearMessage();

    saveState(); //save to localStorage
});

// Show error message under input
function showMessage(msg) {
    let error = document.getElementById("error-msg");
    if (!error) {
        error = document.createElement("p");
        error.id = "error-msg";
        error.style.color = "red";
        error.style.fontSize = "0.9em";
        teammateInput.parentElement.appendChild(error);
    }
    error.textContent = msg;
}

// Clear error message
function clearMessage() {
    const error = document.getElementById("error-msg");
    if (error) error.textContent = "";
}

// Keep dropdown sorted alphabetically
function updateDropdown() {
    teammateDropdown.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.textContent = "Assign to";
    placeholder.disabled = true;
    placeholder.selected = true;
    teammateDropdown.appendChild(placeholder);

    teammates.forEach(tm => {
        const opt = document.createElement("option");
        opt.value = tm;
        opt.textContent = tm;
        teammateDropdown.appendChild(opt);
    });
}



// ----------------------
// PART 3: ASSIGN TASKS
// ----------------------

const assignBtn = document.querySelectorAll(".btn.btn-blue")[1]; // second blue button
const taskInput = document.querySelector(".task-input");
const dateInput = document.querySelector(".date-input");
const taskList = document.getElementById("taskList");

// Data model for tasks
let tasks = {}; // { teammateName: [ {text, due, completed} ] }

assignBtn.addEventListener("click", (event) => {
    event.preventDefault(); // stop page reload

    const teammate = teammateDropdown.value;
    const task = taskInput.value.trim();
    const due = dateInput.value;

    // --- Error checking ---
    if (teammate === "Assign to" || !task || !due) {
        alert("Please fill all fields before assigning.");
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // midnight today
    if (new Date(due) < today) {
        alert("Due date must be today or later.");
        return;
    }

    // --- Add task to data model ---
    if (!tasks[teammate]) tasks[teammate] = [];
    tasks[teammate].push({ text: task, due: due, completed: false });

    // --- Re-render tasks ---
    renderTasks();

    // --- Clear inputs ---
    taskInput.value = "";
    dateInput.value = "";

    saveState(); //save to localStorage
});

// Render tasks grouped by teammate
function renderTasks() {
    taskList.innerHTML = "";

    // If no tasks exist, show placeholder
    const hasAnyTask = Object.keys(tasks).some(tm => tasks[tm].length > 0);
    if (!hasAnyTask) {
        taskList.innerHTML = `<p id="empty-msg" class="empty-msg">No tasks right now. Please add a teammate and assign a task.</p>`;
        return;
    }

    // Sort teammates alphabetically
    const sortedTeammates = Object.keys(tasks).sort();

    sortedTeammates.forEach(teammate => {
        if (tasks[teammate].length === 0) return;

        // --- Add teammate heading once ---
        const heading = document.createElement("h2");
        heading.textContent = teammate;
        heading.classList.add("teammate-name"); // add class
        taskList.appendChild(heading);

        // Sort tasks by due date
        tasks[teammate].sort((a, b) => new Date(a.due) - new Date(b.due));

        // --- Render each task ---
        tasks[teammate].forEach(t => {
            const row = document.createElement("div");
            row.classList.add("task-row");
            if (t.completed) row.classList.add("task-completed");

            const span = document.createElement("span");
            span.textContent = t.text;

            const dueSpan = document.createElement("span");
            dueSpan.classList.add("due-date");
            dueSpan.textContent = `Due: ${t.due}`;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = t.completed;
            checkbox.addEventListener("change", () => {
                t.completed = checkbox.checked;
                renderTasks();
                saveState(); //save after checkbox change
            });

            row.appendChild(span);
            row.appendChild(dueSpan);
            row.appendChild(checkbox);
            taskList.appendChild(row);
        });
    });
}



// ----------------------
// PART 4: CLEAR + RESET
// ----------------------

const clearBtn = document.querySelector(".btn.btn-green");
const resetBtn = document.querySelector(".btn.btn-gray");

// Clear completed tasks
clearBtn.addEventListener("click", (event) => {
    event.preventDefault();

    let changed = false;
    for (let tm in tasks) {
        const originalLength = tasks[tm].length;
        tasks[tm] = tasks[tm].filter(t => !t.completed);
        if (tasks[tm].length !== originalLength) changed = true;
        if (tasks[tm].length === 0) delete tasks[tm];
    }

    if (changed) {
        renderTasks();
        saveState(); //save after clear
    }
});

// Reset everything
resetBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const confirmReset = confirm("Are you sure you want to reset all teammates and to-do items?");
    if (!confirmReset) return;

    // Clear all data
    teammates = [];
    tasks = {};

    // Reset dropdown to just "Assign to"
    updateDropdown();

    // Reset task area
    taskList.innerHTML = `<p id="empty-msg" class="empty-msg">No tasks right now. Please add a teammate and assign a task.</p>`;

    // Clear input fields
    teammateInput.value = "";
    taskInput.value = "";
    dateInput.value = "";

    saveState(); //save after reset
});



// ----------------------
// LOCAL STORAGE
// ----------------------

function saveState() {
    localStorage.setItem("teammates", JSON.stringify(teammates));
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadState() {
    const tmData = JSON.parse(localStorage.getItem("teammates"));
    const taskData = JSON.parse(localStorage.getItem("tasks"));

    teammates = tmData || [];
    tasks = taskData || {};

    updateDropdown();
    renderTasks();
}

//Load saved state when the page first opens
loadState();

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) ? JSON.parse(localStorage.getItem("tasks")) : [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    if (!nextId) {
        nextId = 1;
        localStorage.setItem("nextId", JSON.stringify(nextId));
        return 0;
    }
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return nextId - 1;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    let dueStatus = "";
    if (task.status !== "done") {
        dueStatus = getStatus(task.date);
    }
    let card = $(`
    <div class="card task-card my-3 w-75 drag" data-id=${task.id} 
    ${dueStatus !== "" ? dueStatus === "overdue" ? "style='background-color: red; color: white'" : "style='background-color: orange; color: white'": ""}>
        <div class="card-header">
            <h4 class="card-title">${task.title}</h4>
        </div>
        <div class="card-body">
            <p class="card-text">${task.date}</p>
            <p class="card-text">${task.description}</p>
            <btn class="btn btn-danger deleteTask" data-id=${task.id} ${dueStatus === "overdue" ? "style='border: solid white 1px'" : ""}>Delete</btn>
        </div>
    </div>
    `);
    return card;
}

function getStatus(dueDate) {
    const today = dayjs().format("MM/DD/YYYY");
    let daysLeft = dayjs(dueDate, "MM/DD/YYYY").diff(dayjs(today), 'day');
    return daysLeft < 0 ? "overdue" : daysLeft <=5 ? "approaching" : "";
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards, #in-progress-cards, #done-cards").empty();
    taskList.forEach(task => {
        let taskCard = createTaskCard(task);
       
        switch (task.status) {
            case "to-do":
                $("#todo-cards").append(taskCard);
                break;
            case "in-progress":
                $("#in-progress-cards").append(taskCard);
                break;
            case "done":
                $("#done-cards").append(taskCard);
                break;
            default:
                console.error(`${task.status} isn't a valid status!`);
                break;
        }
    });
    $(".drag").draggable({
        opacity: 0.75,
        zIndex: 100,
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    let task = {
        id: generateTaskId(),
        title: $("#inputTitle").val(),
        date: $("#inputDate").val(),
        description: $("#inputDescription").val(),
        status: "to-do"
    }
    $("#inputTitle").val("");
    $("#inputDate").val("");
    $("#inputDescription").val("");
    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    $(event.target).parent().parent().remove();
    let id = parseInt($(this).attr("data-id"));
    taskList = taskList.filter(task => {
        return task.id !== id;
    });
    localStorage.setItem("tasks", JSON.stringify(taskList));
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    // update task status in local storage
   
    for(task of taskList){
        if (task.id == $(ui.draggable[0]).attr("data-id")){
            task.status = $(event.target).attr("id");
            break;
        }
    }
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $("#taskForm").on("submit", handleAddTask);
    $(document).on("click", ".deleteTask", handleDeleteTask)

    $("#inputDate").datepicker({
        changeMonth: true,
        changeYear: true,
    });

    $(".lane").droppable({
        accept: ".drag",
        drop: handleDrop
    });
});

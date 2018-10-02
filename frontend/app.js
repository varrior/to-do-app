//I am using ES6 features like arrow fuction, promises, spread operator, const, let and async/await. So in this case this app not working in IE, because does not support arrow function
document.addEventListener('DOMContentLoaded', (e)=>{
    const form = document.getElementById('listForm');
    const newTask = document.querySelector('.newTask');
    const taskTable = document.querySelector('#taskTable');
    const toggleTask = document.getElementsByClassName('toggleTask');
    const alertMsg = document.querySelector('.alert-success');
    const alertDanger = document.querySelector('.alert-danger');
    const trash = document.querySelector('.trash');
    let dragSrcEl;

    alertMsg.style.display = 'none';
    alertDanger.style.display = 'none';
    //Make asynchronous request to the REST. This is using in GET, PUT, POST AND DELETE method
    function request(method, url, data=null) {
        return new Promise((resolve, reject)=> {
            const xhr = new XMLHttpRequest;
            xhr.timeout = 2000;
            xhr.responseType = 'json'
            xhr.onreadystatechange = (e) => {
                if(xhr.readyState === 4){
                    xhr.status === 200 ? resolve(xhr.response) : reject(xhr.status)
                }
            }
            xhr.ontimeout = () => reject('timeout');
            xhr.open(method, url, true);

            if(method.toString().toLowerCase() === 'get') {
                xhr.send(data)
            } else {
                xhr.setRequestHeader('Accept','application/json');
                xhr.setRequestHeader('Content-type', 'application/json');
                xhr.send(data)
            }
        })
    }
    //Here I would like to show how works async/awain instead of a promises and how attach callback for further operations. Function for every CRUD operation.
    async function taskAction(method, url, data, callback){
        const res = await request(method, url, JSON.stringify(data))
        callback(res)
    }
    //Here are drag and drop functions. This works only in frontend, I don't implement changing position tasks in database.
    function dragStart(e){
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('data', this.innerHTML);
        e.dataTransfer.setData('className', this.className);
        e.dataTransfer.setData('taskId', this.getAttribute('task-id'));
    }
    function dragOver(e){
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    function drop(e){
        const liDrag = document.querySelectorAll('li[draggable="true"]');
        //Check whether 'this' context (in our case li tag) is the same like when we have started drag
        if (dragSrcEl !== this) {
            dragSrcEl.innerHTML = this.innerHTML;
            dragSrcEl.className = this.className;
            //Add task id as attribute for other CRUD operations
            dragSrcEl.setAttribute('task-id', this.getAttribute('task-id'));
            this.innerHTML = e.dataTransfer.getData('data');
            this.className = e.dataTransfer.getData('className');
            this.setAttribute('task-id', e.dataTransfer.getData('taskId'));
          }
          return false;
    }
    //Attach all drag event listeners 
    function dragAndDrop(el) {
        el.addEventListener('dragstart', dragStart, false);
        el.addEventListener('dragover', dragOver, false);
        el.addEventListener('drop', drop, false);
    }
    //Here I would like to show how works async/awain instead of a promises. Get all tasks from database
    async function getTasks(){
        const task = await request('GET', '/api/to-do-list');
        if(task.success){
            task.tasks.forEach(element => {
                const li = document.createElement('li');
                //Dynamically create all tasks loaded from databse
                if(element.taskToDo){
                    li.className = 'taskToDo'
                    li.innerHTML = `<div class="col-2">
                                        <label class="checkbox-label">
                                            <input class="toggleTask" type="checkbox" name="taskDone">  
                                            <span class="customCheck"></span>
                                        </label>                                   
                                    </div>
                                    <div class="col-10">
                                        <p>${element.taskToDo}</p>   
                                        <span class="trash glyphicon glyphicon-trash"></span>                              
                                    </div>`                
                } else if(element.taskDone) {
                    li.className = 'taskDone'
                    li.innerHTML = `<div class="col-2">
                                        <label class="checkbox-label">
                                            <input class="toggleTask" type="checkbox" name="taskDone" checked=true>     
                                            <span class="customCheck"></span>
                                        </label>                       
                                    </div>
                                    <div class="col-10">
                                        <p>${element.taskDone}</p>   
                                        <span class="trash glyphicon glyphicon-trash"></span>                              
                                    </div>`
                }
                li.setAttribute('task-id', element._id);
                li.setAttribute('draggable', true);
                //Add new task to DOM
                taskTable.appendChild(li)       
            });
            //Here, after loaded all tasks we can call, drag function
            const liDrag = document.querySelectorAll('li[draggable="true"]');
            [...liDrag].forEach(function(element){
                dragAndDrop(element)
            })
        } else {
            //Display error message when error occure during loading tasks
            alertDanger.style.display = 'block';
            alertDanger.innerHTML = data.message;
        }
    }
    getTasks()
    //Post new task to database and display this new task.
    form.addEventListener('submit', e => {
        e.preventDefault()
        const data = {
            content: newTask.value
        }
        //Client side validation. New task can not be empty. If empty show message
        if(!newTask.value.length){
            alertDanger.style.display = 'block';
            alertDanger.innerHTML = 'Your task can not be empty! Add some text!';
            setTimeout(()=>{
                alertDanger.style.display = 'none';
            },2000)
        } else {
            //New task always is "ToDo". 
            taskAction('POST', '/api/to-do-list', data, function(data){
                if(data.success){
                    const li = document.createElement('li');
                    li.className = 'taskToDo'
                    li.innerHTML = `<div class="col-2">
                                        <label class="checkbox-label">
                                            <input class="toggleTask" type="checkbox" name="taskDone">   
                                            <span class="customCheck"></span>
                                        </label>                     
                                    </div>
                                    <div class="col-10">
                                        <p>${data.task.taskToDo}</p>   
                                        <span class="trash glyphicon glyphicon-trash"></span>                              
                                    </div>`
                    li.setAttribute('task-id', data.task._id);
                    li.setAttribute('draggable', true);
                    taskTable.appendChild(li);
                    dragAndDrop(li)
                    newTask.value = '';
                    alertMsg.style.display = 'block';
                    alertMsg.innerHTML = data.message;
                    setTimeout(()=>{
                        alertMsg.style.display = 'none';
                    },2000)
                } else {
                    alertDanger.style.display = 'block';
                    alertDanger.innerHTML = data.message;
                }
            })            
        }
    });
    //Here I am using event delegation using e.target
    document.addEventListener('click', e => {
        //Check if trash is clicked and li has task-id attribute. Next delete task fom database
        if(e.target.classList[0] === 'trash' && e.target.parentElement.parentElement.hasAttribute('task-id')){
            const task = {
                id: e.target.parentElement.parentElement.getAttribute('task-id')
            }
            taskAction('DELETE', '/api/to-do-list/remove', task, data => {
                if(data.success){
                    taskTable.removeChild(e.target.parentElement.parentElement);
                    alertMsg.style.display = 'block';
                    alertMsg.innerHTML = data.message;
                    setTimeout(()=>{
                        alertMsg.style.display = 'none';
                    },2000)
                } else {
                    alertDanger.style.display = 'block';
                    alertDanger.innerHTML = data.message;
                    setTimeout(()=>{
                        alertDanger.style.display = 'none';
                    },2000)
                }
            })
        //Toggle click to change task status. Task to do --> task done.
        } else if(e.target.classList[0] === 'toggleTask') {
            //Task object is send to rest api
            const task = {
                id: e.target.parentElement.parentElement.parentElement.getAttribute('task-id'),
                content: e.target.parentElement.parentElement.nextElementSibling.children[0].innerHTML,
                checked: e.target.checked
            }
            //Update task status
            taskAction('PUT', '/api/to-do-list/change', task, data =>{
                if(data.success){
                    //Check whether task is "ToDo" or "Done" and change class name and attribute.
                    if(data.task.taskToDo){
                        e.target.parentElement.parentElement.parentElement.className = 'taskToDo';
                        e.target.removeAttribute('checked');
                    } else {
                        e.target.parentElement.parentElement.parentElement.className = 'taskDone';
                        e.target.setAttribute('checked',"true");
                    } 
                } else {
                    alertDanger.style.display = 'block';
                    alertDanger.innerHTML = data.message;
                    setTimeout(()=>{
                        alertDanger.style.display = 'none';
                    },2000)
                }
            })
        }
    })
});
const ToDoList = require('./models'); // Import mongogoose schema with our to-do-app.

module.exports = router => {
    //Get all tasks from database
    router.get('/to-do-list', (req,res)=>{
        ToDoList.find({}, (err, task)=>{
            if(err) res.json({ success: false, message: 'Something wrong!' });
            if(!task) {
                res.json({ success: false, message: 'You have no tasks!' });
            } else {
                res.json({ success: true, tasks: task })
            }
        })
    });
    //Add new task to database
    router.post('/to-do-list', (req,res)=>{
        const {content} = req.body;
        const toDoList = new ToDoList(); //create new object with mongoose schema constructor
        toDoList.taskToDo = content;
        if(!content.length){
            res.json({ success: false, message: 'Add some content' })
        } else {
            //save new task in database and if no error send response to client
            toDoList.save((err, data)=>{
                err ? res.json({ success: false, message: 'Something wrong!' }) : res.json({ success: true, message: 'New task has been added', task: data })
            })            
        }
    });
    //Delete task from database
    router.delete('/to-do-list/remove', (req, res)=>{
        const { id } = req.body;
        //Find task by id and next remove from database, here I using ternary operator for error and no error response
        ToDoList.findByIdAndRemove({ _id: id }, (err, task)=>{
            err?res.json({ success: false, message: 'Something wrong!' }) : res.json({ success: true, message: 'Task has been removed' })
        })
    });
    //Change task status and save updated in database. Task done or task to do.
    router.put('/to-do-list/change', (req,res) => {
        //Here I am using E6 destructuring
        const { id, content, checked } = req.body;
        ToDoList.findById({ _id: id }, (err,task) => {
            if(checked){
                task.taskToDo = undefined;
                task.taskDone = content;
            } else {
                task.taskToDo = content;
                task.taskDone = undefined;
            }
            task.save((err, task) => {
                if(err){
                    res.json({ success: false, message: 'Something wrong!' })
                } else {
                    res.json({ success: true, message: 'Task has been changed', task: task })
                }
            })
        })
    })

    return router  
}
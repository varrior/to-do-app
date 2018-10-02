const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//Simple schema for our to do app
let toDoSchema = new Schema({
    taskToDo: {
        type: String
    },
    taskDone: {
        type: String
    }
});

module.exports = mongoose.model('ToDoList', toDoSchema)
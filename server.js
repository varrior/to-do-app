//Here is simple server based on express
const express = require('express');
const app = express();
const http = require('http').Server(app)
const router = express.Router();
const port = process.env.PORT || 8080;
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./backend/api')(router)
//Enable send information from client in req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//Set prefix /api in every route
app.use('/api', routes);
//Enable usung static files e.g. css
app.use(express.static(__dirname));
//Send start file
app.get('*', (req, res) => res.sendFile(path.join(`${__dirname}/frontend/index.html`)));
//Connect to mongodb database
mongoose.connect('mongodb://localhost:27017/to-do-app', {useNewUrlParser: true}, err => err?console.log(err):console.log('Successfully connected to MongoDB'));  

http.listen(port, (err)=>err?console.log(err):console.log(`Server running on ${port}`))

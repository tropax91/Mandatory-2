const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const server = require('http').Server(app);
const io = require("socket.io")(server);
nicknames = [];
connections = [];

let userName;
let userLoggedIn = false;


//Connect to mongo
let path = "mongodb://localhost:27017/chat"
mongo.connect('mongodb://localhost:27017/chat')

const db = mongoose.connect(path, function (err, db) {
    if (err) {
        console.log("Error running mongodb", err);
        return;
    }
    console.log("Connected to MongoDB!");
});


app.use(express.static(__dirname + "/public"));// Needed in order to serve CSS, JS and images from html
app.use(bodyParser.urlencoded({ extended: false }))//In order to read HTTP post data, we have to use body-parser
app.use(bodyParser.json());//To grab the ajax data, we need bodyParser

//CHAT SECTION

//Flexible Document Structure Define
var chatSchema = mongoose.Schema({
    nickN: String,
    msg: String,
    msgSent: {type: Date, default: Date.now}
});

//Data Model. message collection will become plural in mongodb
var Chat = mongoose.model('Message', chatSchema);

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

//This is called when a user connects to the chat. Appears on chat side because of socket.io.js
io.on("connection", function (socket) {
    connections.push(socket);
    console.log("A client connected: %s sockets connected! ", connections.length);

    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1);
        if (!socket.nickname) 
        return;

        console.log('User disconnected: %s sockets connected!', connections.length);
        nicknames.splice(nicknames.indexOf(socket.nickname), 1);
        updateNicknames();
    })

    //Retrieve and show all messages as soon as a user connects
    let query = Chat.find({});
    query.sort('-msgSent').limit(10).exec(function(err, docs) {
        if(err) throw err;
        socket.emit('Load all messages', docs)
    })

    // Check if entered username is already in the array
    socket.on('new user', function (data, callback) {
        if (nicknames.indexOf(data) != -1) {
            callback(false);
        } else {
            //give the specific socket a name
            socket.nickname = data;
            nicknames.push(socket.nickname);
            io.emit('usernames', nicknames);
            callback(true);
            updateNicknames();
        }
    });

    //update usernames
    function updateNicknames() {
        io.emit('usernames', nicknames);
    }

    socket.on('send message', function (data) {

        var newMsg = new Chat({ msg: data, nickN: socket.nickname });
        newMsg.save(function(err){
            if(err)throw err;
        })
        io.emit('new message', { msg: data, nickN: socket.nickname });
    });

    
});

app.post('/login', function(req, res) {
    //findOne returns one document that satisfies the specified query criteria on the collection, in this case 'username'
    //and match it with what ajax sent back.The method returns null if no document is found.
    mongo.connect(path, function(err, db) {
        db.collection('users').findOne({username: req.body.username}, {fullname: 1, email: 1, password: 1,
        passwordMatch: 1, username: 1}, function(err, user) {

            if(user === null) {
                console.log('User doesn´t exist!')
                
            }

           else if(user.username === req.body.username && user.password === req.body.password) {
                console.log("ACCESS GRANTED!");

                userName = user.username;
                userLoggedIn = true;
                
                return res.redirect('/chat')
            }
            
            else {
                return res.json({error:"No user found!"});
                
                
            }
        })
    })
})

//Registration
app.post('/register', function(req, res) {

    var data = req.body; //bodyParser at work, makes this work
    console.log(data);

    if(!req.body.fullname || !req.body.email || !req.body.password || !req.body.passwordMatch || !req.body.username) 
        return res.json({error: 'Please fill out all fields!'});

    if(db.users.get(req.body.username))
        return res.json({error: 'This username has already been registered'});

    if(req.body.username.length > 15 || req.body.password.length > 20)
        return res.json({error: 'Username or Password is too long'});

    if(req.body.password !== req.body.passwordMatch){
            var err = new Error('Passwords do not match.');
            err.status = 400;
            res.send('Passwords do not match');
        }

           
    

    mongo.connect(path, function(err, db) {
        if(err) {
            console.log("Error connecting to mongodb: ", err);
            
        }

        let collection = db.collection('users'); //insertion, table name

        collection.insert(data, function(err, success) {
            console.log(success);
            db.close();
            
        });

        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.json({error:'Salt failed.'});
            bcrypt.hash(req.body.password, salt, null, (err, hash) => {
                if(err) return res.json({error:'Hash failed.'});
                db.users.set(userId, {username, hash});
            })
        })

    });
    
});

app.get("/chat", function(req, res){

    if(userLoggedIn){
        res.sendFile(__dirname + "/public/chat.html");
    }
    else{
        console.log('Log in to access this page.');
        res.status(401).send();
        
    }
})






server.listen('3000', function (err){
    if(err){
        console.log('Could not connect to the server');
        
    }
    console.log('Server is running on port', server.address().port);
    
})




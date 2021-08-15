const dotenv = require('dotenv').config()
const { throws } = require('assert');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const express = require('express');
const moment = require('moment');
const { MongoClient } = require('mongodb');
const { allowedNodeEnvironmentFlags } = require('process');
const fetch = require("node-fetch");
const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))
const url = process.env.DB_URL
app.use(cors({origin: ['http://localhost:3000', 'http://localhost:8080', url, 'cors-anywhere.herokuapp.com:3000', 'cors-anywhere.herokuapp.com:8080'],
optionsSuccessStatus: 200 }));
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
                origin: ['http://localhost:8080',
                'http://localhost:3000',
                'cors-anywhere.herokuapp.com:3000',
                'cors-anywhere.herokuapp.com:8080']
  }
});


app.get('/', (req, res) => {
              console.log('req: '+req+' res: '+res)
              res.send('<h1>Hey Socket.io</h1>');
            });

app.post('/', (req, res) => {
  console.log('req: '+req+' res: '+res)
  res.send('<h1>Hey Socket.io</h1>');
});



let history = [{room:'', chats:[]}]
let room = ''
let rooms = []
let userName = ''
let messages = []
let defRoom = 'start'

const colName = room
const client = new MongoClient(url)
// Database Name
const dbName = 'Cluster0'

// async function main() {
//   // Use connect method to connect to the server
//   await client.connect()
//   console.log('Connected successfully to server')
//   const db = client.db(dbName)
//   const collection = db.collection(colName)

//   // the following code examples can be pasted here...
//   const insertResult = await collection.insertOne({user:user, message:message})
//   console.log('Inserted documents =>', insertResult+' '+moment(user.timeStamp).format('HH:mm:ss'))

// //   const findResult = await collection.find({}).toArray()
// //               console.log('Found documents =>', findResult)

//   return 'done.'
// }

async function mainLoad(room) {
              // Use connect method to connect to the server
              await client.connect()
              console.log('Connected successfully to server ' +room)
              const db = client.db(dbName)
              const collection = db.collection(room)
              let findResult = []
              let data = {}
              findResult = await collection.find({}).limit(97).toArray()
              
              
                // findResult = await collection.find({}).limit(250).toArray()
              console.log('findResult?.length: '+findResult?.length)
              //             console.log('Found documents =>', findResult)
            data = {result: findResult}
            return data
            }

io.on('connection', (socket) => {
              //receive token from client
              // socket.join(defRoom)
              let token = socket.handshake.auth.token;
              if(token){console.log('handshake succes '+token.toString())}
              // console.log(socket.handshake.auth.name)
              let user = newUser(socket.handshake.auth.name)
              // console.log('userFromServer: '+JSON.stringify(user))
              // socket.to(defRoom).emit('connection-success', user)
              socket.emit('connection-succes', user)
              // io.emit('connection-succes', user)
              
              //user joins a room
              socket.on('new-user', (userName, room) => {
                            console.log('new-user event on server: '+userName+' room: '+room)
                          user.name = userName
                          user.timeStamp = Date.now()
                          let data = mainLoad(room).then(data => { socket.emit('messages',data)})
                            return user
                          })
              socket.on('join-room', (roomToGo, user) => {
                socket.join(roomToGo.name)
                socket.emit('room-joined',userList, messages)
              })
              //message that a user has sent
              socket.on('send-chat-message', (message, usr) => {
                            // if(message){
                            user.timeStamp = Date.now()
                            user.name = usr.name
                            user.rooms = usr.rooms
                           
                            console.log('message received on server: '+message+'from: '+user.name+' '+Object.keys(user))
                            // socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
                            // socket.emit('chat-message',{message: message, user: user})
                            
                            const received = {message: message, user: user}
                            console.log('received.message: '+received.message)
                            //post to MongoDB
                            io.emit('chat-message', received)
                            socket.emit('chat-message',{message:'received your message',user:received.user})
                            // }
                            return user
                          });
            
           
            
              //when user disconnects
              socket.on('disconnect', () => {
                            console.log('user disconnected');
                            socket.emit('user-disconnected')
              //               getUserRooms(socket).forEach(room => {
              //                             socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
              //                             delete rooms[room].users[socket.id]
              //                           })
              });
            });



function newUser(userName){
              return  user = {
                id: uuidv4(),
                name: userName,
                status: 'online',
                typing: false,
                timeStamp: Date.now(),
                rooms: {}
              }
            }
            
            const TYPES = {
              'undefined'        : 'undefined',
              'number'           : 'number',
              'boolean'          : 'boolean',
              'string'           : 'string',
              '[object Function]': 'function',
              '[object RegExp]'  : 'regexp',
              '[object Array]'   : 'array',
              '[object Date]'    : 'date',
              '[object Error]'   : 'error'
            },
            TOSTRING = Object.prototype.toString;
            
            function type(o) {
              return TYPES[typeof o] || TYPES[TOSTRING.call(o)] || (o ? 'object' : 'null');
            };


http.listen(.listen(process.env.PORT || 3000), function() {
              console.log('listening on 3000 http')
            })
// app.listen(3000, function() {
//               console.log('listening on 3000 app')
//             })
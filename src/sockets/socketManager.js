import connectCodeSocket from "./codeSocket.js";
import { contestSocket } from "./contestSocket.js";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = () => {

    if (!global.io) {
        console.error("❌ Socket.io instance not found on global scope!");
        return;
    }

    global.io.on("connection", (socket) => {

        console.log("⚡ User Connected:", socket.id);

        // =========================
        // Code Execution Socket
        // =========================
        connectCodeSocket(socket);

        // =========================
        // Contest Socket
        // =========================
        contestSocket(socket);

        // =========================
        // Join Call
        // =========================
        socket.on("join-call", (path) => {

            socket.join(path);

            if (!connections[path]) {
                connections[path] = [];
            }

            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for (let i = 0; i < connections[path].length; i++) {

                global.io.to(connections[path][i]).emit(
                    "user-joined",
                    socket.id,
                    connections[path]
                );
            }

            if (messages[path]) {

                messages[path].forEach((msg) => {

                    global.io.to(socket.id).emit(
                        "chat-message",
                        msg.data,
                        msg.sender,
                        msg["socket-id-sender"]
                    );

                });
            }
        });

        // =========================
        // WebRTC Signal
        // =========================
        socket.on("signal", (toId, message) => {

            global.io.to(toId).emit(
                "signal",
                socket.id,
                message
            );

        });

        // =========================
        // Chat
        // =========================
        socket.on("chat-message", (data, sender) => {

            const [room, found] = Object.entries(connections).reduce(
                ([matchedRoom, isFound], [key, value]) => {

                    if (!isFound && value.includes(socket.id)) {
                        return [key, true];
                    }

                    return [matchedRoom, isFound];

                },
                ["", false]
            );

            if (!found) return;

            if (!messages[room]) {
                messages[room] = [];
            }

            messages[room].push({
                sender,
                data,
                "socket-id-sender": socket.id,
            });

            connections[room].forEach((id) => {

                global.io.to(id).emit(
                    "chat-message",
                    data,
                    sender,
                    socket.id
                );

            });
        });

        // =========================
        // Disconnect
        // =========================
        socket.on("disconnect", () => {

            console.log(
                "❌ User Disconnected:",
                socket.id
            );

            for (
                const [room, users]
                of Object.entries(connections)
            ) {

                if (!users.includes(socket.id)) {
                    continue;
                }

                users.forEach((id) => {

                    global.io.to(id).emit(
                        "user-left",
                        socket.id
                    );

                });

                connections[room] = users.filter(
                    (id) => id !== socket.id
                );

                if (connections[room].length === 0) {

                    delete connections[room];
                    delete messages[room];

                }

                break;
            }

            delete timeOnline[socket.id];
        });
    });
};

export default connectToSocket;






// import connectCodeSocket from "./codeSocket.js";

// let connections = {};
// let messages = {};
// let timeOnline = {};

// export const connectToSocket = () => {
//     if (!global.io) {
//         console.error("❌ Socket.io instance not found on global scope!");
//         return;
//     }

//     global.io.on("connection", (socket) => {

//         console.log("⚡ User Connected:", socket.id);

//         // Code execution socket
//         connectCodeSocket(socket);

//         // Join Call
//         socket.on("join-call", (path) => {

//             socket.join(path);

//             if (!connections[path]) {
//                 connections[path] = [];
//             }

//             connections[path].push(socket.id);

//             timeOnline[socket.id] = new Date();

//             for (let i = 0; i < connections[path].length; i++) {
//                 global.io.to(connections[path][i]).emit(
//                     "user-joined",
//                     socket.id,
//                     connections[path]
//                 );
//             }

//             if (messages[path]) {
//                 messages[path].forEach((msg) => {
//                     global.io.to(socket.id).emit(
//                         "chat-message",
//                         msg.data,
//                         msg.sender,
//                         msg["socket-id-sender"]
//                     );
//                 });
//             }
//         });

//         // WebRTC Signal
//         socket.on("signal", (toId, message) => {
//             global.io.to(toId).emit("signal", socket.id, message);
//         });

//         // Chat
//         socket.on("chat-message", (data, sender) => {

//             const [room, found] = Object.entries(connections).reduce(
//                 ([matchedRoom, isFound], [key, value]) => {

//                     if (!isFound && value.includes(socket.id)) {
//                         return [key, true];
//                     }

//                     return [matchedRoom, isFound];

//                 },
//                 ["", false]
//             );

//             if (!found) return;

//             if (!messages[room]) {
//                 messages[room] = [];
//             }

//             messages[room].push({
//                 sender,
//                 data,
//                 "socket-id-sender": socket.id,
//             });

//             connections[room].forEach((id) => {
//                 global.io.to(id).emit(
//                     "chat-message",
//                     data,
//                     sender,
//                     socket.id
//                 );
//             });
//         });

//         // Disconnect
//         socket.on("disconnect", () => {

//             console.log("❌ User Disconnected:", socket.id);

//             for (const [room, users] of Object.entries(connections)) {

//                 if (!users.includes(socket.id)) continue;

//                 users.forEach((id) => {
//                     global.io.to(id).emit("user-left", socket.id);
//                 });

//                 connections[room] = users.filter(
//                     (id) => id !== socket.id
//                 );

//                 if (connections[room].length === 0) {
//                     delete connections[room];
//                     delete messages[room];
//                 }

//                 break;
//             }
//         });

//     });
// };

// export default connectToSocket;





















// import connectToSocket from './codeSocket.js';

// let connections = {};
// let messages = {};
// let timeOnline = {};

// export const connectToSocket = () => {
//     // 🌟 global.io व्यवस्थित सेट झाला आहे की नाही ते तपासणे
//     if (!global.io) {
//         console.error("❌ Socket.io instance not found on global scope!");
//         return;
//     }

//     global.io.on("connection", (socket) => {
//         console.log("⚡ User Connected to Socket:", socket.id);

//         connectCodeSocket(socket);

//         console.log("user connected:", socket.id);
        
//         // 1. Join Call Event
//         socket.on("join-call", (path) => {
//             if (connections[path] === undefined) {
//                 connections[path] = [];
//             }
//             connections[path].push(socket.id);

//             timeOnline[socket.id] = new Date();

//             // रूममधील सर्व युजर्सना नवीन युजर जॉईन झाल्याचा इव्हेंट पाठवणे
//             for (let a = 0; a < connections[path].length; a++) {
//                 global.io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
//             }

//             // जर या रूमचे जुने मेसेजेस असतील, तर ते नवीन युजरला पाठवणे
//             if (messages[path] !== undefined) {
//                 for (let a = 0; a < messages[path].length; ++a) {
//                     global.io.to(socket.id).emit(
//                         "chat-message",
//                         messages[path][a]['data'],
//                         messages[path][a]['sender'],
//                         messages[path][a]['socket-id-sender']
//                     );
//                 }
//             }
//         });

//         // 2. Signaling Event (WebRTC Peer-to-Peer Connection साठी)
//         socket.on("signal", (toId, message) => {
//             global.io.to(toId).emit("signal", socket.id, message);
//         });

//         // 3. Chat Message Event
//         socket.on("chat-message", (data, sender) => {
//             // युजर कोणत्या रूममध्ये आहे ते शोधणे
//             const [matchingRoom, found] = Object.entries(connections)
//                 .reduce(([room, isFound], [rooKey, roomValue]) => {
//                     if (!isFound && roomValue.includes(socket.id)) {
//                         return [rooKey, true];
//                     }
//                     return [room, isFound];
//                 }, ['', false]);

//             if (found === true) {
//                 if (messages[matchingRoom] === undefined) {
//                     messages[matchingRoom] = [];
//                 }
                
//                 // मेसेज हिस्टरीमध्ये सेव्ह करणे
//                 messages[matchingRoom].push({
//                     'sender': sender, 
//                     "data": data, 
//                     "socket-id-sender": socket.id
//                 });
                
//                 console.log(`💬 Message in ${matchingRoom} from ${sender}:`, data);

//                 // रूममधील प्रत्येकाला मेसेज ब्रॉडकास्ट करणे
//                 connections[matchingRoom].forEach((elem) => {
//                     global.io.to(elem).emit("chat-message", data, sender, socket.id);
//                 });
//             }
//         });

//         // 4. Disconnect Event
//         socket.on("disconnect", () => {
//             console.log("❌ User Disconnected:", socket.id);
//             let key;

//             for (const [k, v] of Object.entries(connections)) {
//                 for (let a = 0; a < v.length; ++a) {
//                     if (v[a] === socket.id) {
//                         key = k;

//                         // रूममधील इतर युजर्सना युजर लेफ्ट झाल्याचे कळवणे
//                         for (let i = 0; i < connections[key].length; ++i) {
//                             global.io.to(connections[key][i]).emit('user-left', socket.id);
//                         }

//                         // कनेक्शन्स अरेमधून युजरचा socket.id काढून टाकणे
//                         let index = connections[key].indexOf(socket.id);
//                         if (index !== -1) {
//                             connections[key].splice(index, 1);
//                         }

//                         // जर रूम पूर्णपणे रिकामी झाली असेल, तर मेमरी क्लीनअप करणे
//                         if (connections[key].length === 0) {
//                             delete connections[key];
//                             delete messages[key];
//                         }
//                     }
//                 }
//             }
//         }); 
//     }); 
// };

// export default connectToSocket;
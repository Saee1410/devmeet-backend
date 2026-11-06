export const contestSocket = (socket) => {
    socket.on("joinContest", ({ contestCode }) => {

        if (!contestCode) {
            console.log("Contest code missing");
            return;
        }

        socket.join(contestCode);

        console.log(
            `🟢 ${socket.id} joined contest room: ${contestCode}`
        );

        global.io.to(contestCode).emit("participantJoined", {
            message: "A new participant has joined the contest.",
        });
    });

    socket.on("startContest", ({ contestCode }) => {

        if (!contestCode) {
            return;
        }

        global.io.to(contestCode).emit("contestStarted");

        console.log(
            `🚀 Contest started: ${contestCode}`
        );
    });
};


// export const contestSocket = (io) => {

//     io.on("connection", (socket) => {
//         console.log("User Connected:", socket.id);

//         socket.on("joinContest", ({ contestCode }) => {

//             socket.join(contestCode);

//              console.log(`${socket.id} joined ${contestCode}`);

//              io.to(contestCode).emit("participantJoined", {
//                 message: "A new participant has joined the contest."
//                 });
//              });

//              socket.on("startContest", ({ contestCode }) => {

//                 io.to(contestCode).emit("contestStarted");
//              });

//              socket.on("disconnect", () => {
//                 console.log("User Disconnected:", socket.id);

//         });
//     });
// };
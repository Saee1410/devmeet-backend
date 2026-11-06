import { codeQueue } from "../queues/codeQueue.js";


const connectCodeSocket = (socket) => {
    socket.on("run-code", async (data) => {

        console.log(" run-code event received:", data);
        
        const { code, language, roomId} = data;

        if(!code || !language || !roomId) {
            socket.emit("codeOutput", {
                success: false,
                error: "Missing required fileds"
            });
            return
        }

        try {
            await codeQueue.add('compileJob', {
                code, 
                language,
                roomId
            });
        } catch (err) {
            socket.emit("codeOutput", {
                success: false,
                 error: "Failed to enqueue job"
            });
        }
    });
};

export default connectCodeSocket;
import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";

import { runJava } from "../executors/javaExecutor.js";
import { runCpp } from "../executors/cppExecutor.js";
import { runC } from "../executors/cExecutor.js";

// Duplicate the connection so the worker gets its own dedicated blocking socket
const workerConnection = redisConnection.duplicate();

const codeWorker = new Worker(
    "codeExecution",
    async (job) => {
        const {
            code,
            language,
            roomId,
            input
        } = job.data;

        console.log("🚀 Worker received:");
        console.log({
            language,
            roomId,
            input
        });

        let result;

        switch (language) {
            case "java":
                result = await runJava(code, input || "");
                break;
            case "cpp":
                result = await runCpp(code, input || "");
                break;
            case "c":
                result = await runC(code, input || "");
                break;
            default:
                throw new Error("Unsupported language");
        }

        return {
            ...result,
            roomId,
        };
    },
    {
        connection: workerConnection,
    }
);

codeWorker.on("completed", (job, result) => {
    const { success, output, error, roomId } = result;

    if (!global.io) {
        console.error("Worker cannot find the global instance!");
        return;
    }

    if (success) {
        global.io.to(roomId).emit("codeOutput", {
            success: true,
            output,
        });
    } else {
        global.io.to(roomId).emit("codeOutput", {
            success: false,
            error,
        });
    }
});

codeWorker.on("error", (err) => {
    console.error("Worker encountered a Redis error:", err.message);
});

export default codeWorker;


// // import { Worker } from "bullmq";
// // import IORedis from "ioredis";

// import { Worker } from "bullmq";
// import redisConnection from "../config/redis.js";

// import { runJava } from "../executors/javaExecutor.js";
// import { runCpp } from "../executors/cppExecutor.js";
// import { runC } from "../executors/cExecutor.js";

// // const redisConnection = new IORedis({
// //     host: "localhost",
// //     port: 6379,
// //     maxRetriesPerRequest: null,
// // });

// const codeWorker = new Worker(
//     "codeExecution",

//     async (job) => {

//         const {
//             code,
//             language,
//             roomId,
//             input
//         } = job.data;

//         console.log("🚀 Worker received:");
//         console.log({
//             language,
//             roomId,
//             input
//         });

//         let result;

//         switch (language) {

//             case "java":
//                 result = await runJava(
//                     code,
//                     input || ""
//                 );
//                 break;

//             case "cpp":
//                 result = await runCpp(
//                     code,
//                     input || ""
//                 );
//                 break;

//             case "c":
//                 result = await runC(
//                     code,
//                     input || ""
//                 );
//                 break;

//             default:
//                 throw new Error(
//                     "Unsupported language"
//                 );
//         }

//         return {
//             ...result,
//             roomId,
//         };
//     },

//     {
//         connection: redisConnection
//     }
// );

// codeWorker.on(
//     "completed",
//     (job, result) => {

//         const {
//             success,
//             output,
//             error,
//             roomId
//         } = result;

//         if (!global.io) {

//             console.error(
//                 "Worker cannot find the global instance!"
//             );

//             return;
//         }

//         if (success) {

//             global.io
//                 .to(roomId)
//                 .emit("codeOutput", {
//                     success: true,
//                     output,
//                 });

//         } else {

//             global.io
//                 .to(roomId)
//                 .emit("codeOutput", {
//                     success: false,
//                     error,
//                 });

//         }
//     }
// );

// export default codeWorker;



// import { Worker } from "bullmq";
// import IORedis from "ioredis";

// import { runJava } from "../executors/javaExecutor.js";
// import { runCpp } from "../executors/cppExecutor.js";
// import { runC } from "../executors/cExecutor.js";

// const redisConnection = new IORedis({
//     host: "localhost",
//     port: 6379,
//     maxRetriesPerRequest: null,
// });

// const codeWorker = new Worker(
//     "codeExecution",
//     async (job) => {
//         const { code, language, roomId } = job.data;

//         let result;

//         switch (language) {
//             case "java":
//                 result = await runJava(code);
//                 break;

//             case "cpp":
//                 result = await runCpp(code);
//                 break;

//             case "c":
//                 result = await runC(code);
//                 break;

//             default:
//                 throw new Error("Unsupported language");
//         }

//         return {
//             ...result,
//             roomId,
//         };
//     },
//     { connection: redisConnection }
// );

// codeWorker.on("completed", (job, result) => {
//     const { success, output, error, roomId } = result;

//     if (!global.io) {
//         console.error("Worker cannot find the global instance!");
//         return;
//     }

//     if (success) {
//         global.io.to(roomId).emit("codeOutput", {
//             success: true,
//             output,
//         });
//     } else {
//         global.io.to(roomId).emit("codeOutput", {
//             success: false,
//             error,
//         });
//     }
// });

// export default codeWorker;




// import { Worker } from 'bullmq';
// import IORedis from 'ioredis';
// import fs from 'fs';
// import path from 'path';
// import { exec } from 'child_process';
// import { createTempFolder } from '../utils/createTempFolder.js';
// import { deleteTempFolder } from '../utils/deleteTempFolder.js';    
// import { dockerCommand } from '../utils/dockerCommand.js';
// import { runJava } from '../executors/javaExecutor.js';
// import { fileURLToPath } from 'url';

// // import { io } from '../app.js'; 

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const redisConnection = new IORedis({
//     host: 'localhost',
//     port: 6379,
//     maxRetriesPerRequest: null
// });

// const codeWorker = new Worker('codeExecution', async (job) => {
//     const { code, language, roomId } = job.data;

//     const tempDir = createTempFolder();
    
//     // const runId = uuidv4();
//     // const tempDir = path.join(__dirname, "..", `temp_${runId}`);
//     // fs.mkdirSync(tempDir, { recursive: true });

//     // let fileName = '';
//     // let dockerImage = '';
    
//     // if (language === 'java') {
//     //     fileName = 'Main.java';
//     //     dockerImage = 'sandbox-java';

//     if(language === "java"){
//         const result = await runJava(code);

//         return {
//             ...result,
//             roomId,
//         };
    
//     } else if (language === 'cpp') {
//         fileName = 'program.cpp';
//         dockerImage = 'sandbox-cpp';
//     } else if (language === 'c') {
//         fileName = 'program.c';
//         dockerImage = 'sandbox-c';
//     } else {
//        // fs.rmSync(tempDir, { recursive: true, force: true });
//        deleteTempFolder(tempDir); // Use the utility function to delete the temp folder
//         throw new Error("Unsupported language");
//     }

//     const filePath = path.join(tempDir, fileName);
//     fs.writeFileSync(filePath, code);

//     const runCommand = dockerCommand(dockerImage, tempDir);
//     // const dockerSafePath = tempDir.replace(/\\/g, '/'); 
//     // const runCommand = `docker run --rm --net none -v "${dockerSafePath}:/app" ${dockerImage}`;

//     return new Promise((resolve, reject) => {
//         exec(runCommand, { timeout: 5000 }, (error, stdout, stderr) => {
           

//   deleteTempFolder(tempDir); // Use the utility function to delete the temp folder

//             //deleteTempFolder(tempDir); // Use the utility function to delete the temp folder
//             // try {
//             //     fs.rmSync(tempDir, { recursive: true, force: true });
//             // } catch (rmErr) {
//             //     console.error("Error occurred while removing temp directory:", rmErr);
//             // }

//             if (error) {
//                 if (error.killed) {
//                     resolve({ success: false, error: "Execution timed out", roomId });
//                 } else {
//                     resolve({ success: false, error: stderr || error.message, roomId });
//                 }
//             } else {
//                 resolve({ success: true, output: stdout, roomId });
//             }
//         });
//     });
// }, { connection: redisConnection });


// codeWorker.on('completed', (job, result) => {
//     const { success, output, error, roomId } = result;

//     if (!global.io){
//         console.error("Worker cannot find the global instance!");
//         return;
//     }
    
//     if (success) {
//         global.io.to(roomId).emit('codeOutput', { success: true, output });
//     } else {
//         global.io.to(roomId).emit('codeOutput', { success: false, error });
//     }
// });

// export default codeWorker;

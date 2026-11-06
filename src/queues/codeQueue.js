import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null
});

export const codeQueue = new Queue(
    "codeExecution",
    {
        connection: redisConnection
    }
);

export const codeQueueEvents = new QueueEvents(
    "codeExecution",
    {
        connection: redisConnection
    }
);

await codeQueueEvents.waitUntilReady();

console.log("✅ Code Queue Ready");
console.log("✅ Code Queue Events Ready");


// import { Queue, QueueEvents } from "bullmq";

// import IORedis from "ioredis";


// const redisConnection = new IORedis({

//     host: "localhost",

//     port: 6379,

//     maxRetriesPerRequest: null

// });


// export const codeQueue = new Queue(
//     "codeExecution",
//     {
//         connection: redisConnection
//     }
// );


// export const codeQueueEvents =
//     new QueueEvents(
//         "codeExecution",
//         {
//             connection: redisConnection
//         }
//     );

    
// import { Queue } from 'bullmq';
// import IORedis from 'ioredis';


// const redisConnection = new IORedis({
//        host: 'localhost',
//        port: 6379,
//        maxRetriesPerRequest: null
// });

// export const codeQueue = new Queue('codeExecution', {
//     connection: redisConnection
// });
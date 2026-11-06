import { codeQueue } from "../queues/codeQueue.js";

export const compileService = async (
    code,
    language,
    roomId,
    input = ""
) => {

    console.log("📤 SERVICE INPUT:", {
        language,
        roomId,
        input
    });

    const job = await codeQueue.add("compileJob", {
        code,
        language,
        roomId,
        input
    });

    return {
        success: true,
        jobId: job.id,
        message: "Code compilation job added to the queue."
    };
};
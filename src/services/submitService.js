import Contest from "../models/contest.model.js";
import ContestParticipant from "../models/contestParticipant.model.js";
import Question from "../models/question.model.js";

import { codeQueue, codeQueueEvents } from "../queues/codeQueue.js";


// =====================================
// SUBMIT CODE SERVICE
// =====================================
export const submitCodeService = async ({
    contestCode,
    userId,
    questionId,
    code,
    language
}) => {

    console.log("\n==============================");
    console.log("🚀 SUBMIT CODE");
    console.log("==============================");

    console.log("Contest Code:", contestCode);
    console.log("User ID:", userId);
    console.log("Question ID:", questionId);
    console.log("Language:", language);


    // =====================================
    // FIND CONTEST
    // =====================================

    const contest = await Contest.findOne({
        contestCode
    });


    if (!contest) {

        throw new Error(
            "Contest not found."
        );
    }


    console.log(
        "Contest Status:",
        contest.status
    );


    // =====================================
    // CHECK CONTEST STATUS
    // =====================================

    if (contest.status !== "running") {

        throw new Error(
            `Contest is not running. Current status: ${contest.status}`
        );
    }


    // =====================================
    // CHECK CONTEST TIME
    // =====================================

    if (
        contest.endTime &&
        new Date() >= contest.endTime
    ) {

        contest.status = "ended";

        await contest.save();


        throw new Error(
            "Contest time has expired."
        );
    }


    // =====================================
    // CHECK PARTICIPANT
    // =====================================

    console.log(
        "🔍 Checking participant..."
    );


    const participant =
        await ContestParticipant.findOne({

            contest: contest._id,

            user: userId
        });


    console.log(
        "Participant:",
        participant
    );


    if (!participant) {

        throw new Error(
            "You are not a participant of this contest."
        );
    }


    console.log(
        "✅ Participant verified:",
        participant._id.toString()
    );


    // =====================================
    // FIND QUESTION
    // =====================================

    const question =
        await Question.findById(
            questionId
        );


    if (!question) {

        throw new Error(
            "Question not found."
        );
    }


    console.log(
        "Question:",
        question.title
    );


    // =====================================
    // CHECK QUESTION BELONGS TO CONTEST
    // =====================================

    const questionExists =
        contest.questions.some(
            question =>
                question.toString() ===
                questionId.toString()
        );


    if (!questionExists) {

        throw new Error(
            "Question does not belong to this contest."
        );
    }


    // =====================================
    // VALIDATE CODE
    // =====================================

    if (
        !code ||
        code.trim() === ""
    ) {

        throw new Error(
            "Code cannot be empty."
        );
    }


    if (
        !language ||
        language.trim() === ""
    ) {

        throw new Error(
            "Programming language is required."
        );
    }


    // =====================================
    // GET TEST CASES
    // =====================================

    const testCases =
        question.testCases || [];


    if (testCases.length === 0) {

        throw new Error(
            "No test cases available for this question."
        );
    }


    console.log(
        "🧪 Total Test Cases:",
        testCases.length
    );


    // =====================================
    // CHECK ALREADY SOLVED
    // =====================================

    const alreadySolved =
        participant.solvedQuestions.some(
            question =>
                question.toString() ===
                questionId.toString()
        );


    // =====================================
    // RUN ALL TEST CASES
    // =====================================

    const testResults = [];


    for (
        let i = 0;
        i < testCases.length;
        i++
    ) {

        const testCase = testCases[i];


        // ---------------------------------
        // GET INPUT
        // ---------------------------------

        const input =
            testCase.input || "";


        const expectedOutput =
            (testCase.output || "")
                .trim();


        console.log(
            `🧪 Running Test Case ${i + 1}`
        );


        console.log(
            "Input:",
            JSON.stringify(input)
        );


        console.log(
            "Expected Output:",
            JSON.stringify(expectedOutput)
        );


        // ---------------------------------
        // ADD JOB TO BULLMQ
        // ---------------------------------

        const job =
            await codeQueue.add(
                "submitCode",
                {
                    code,

                    language,

                    roomId: contestCode,

                    input
                }
            );


        console.log(
            "📦 Job Added:",
            job.id
        );


        // ---------------------------------
        // WAIT FOR RESULT
        // ---------------------------------

        const executionResult =
            await job.waitUntilFinished(
                codeQueueEvents,
                10000
            );


        console.log(
            `📤 Test Case ${i + 1} Execution Result:`,
            executionResult
        );


        // ---------------------------------
        // GET ACTUAL OUTPUT
        // ---------------------------------

        const actualOutput =
            (executionResult.output || "")
                .trim();


        // ---------------------------------
        // CHECK OUTPUT
        // ---------------------------------

        const outputMatched =
            executionResult.success === true &&
            actualOutput === expectedOutput;


        console.log(
            "Actual Output:",
            JSON.stringify(actualOutput)
        );


        console.log(
            "Expected Output:",
            JSON.stringify(expectedOutput)
        );


        console.log(
            "Output Matched:",
            outputMatched
        );


        // ---------------------------------
        // STORE TEST RESULT
        // ---------------------------------

        testResults.push({

            testCase:
                i + 1,

            input,

            expectedOutput,

            output:
                actualOutput,

            error:
                executionResult.error || "",

            success:
                outputMatched
        });


        // ---------------------------------
        // STOP IF TEST CASE FAILED
        // ---------------------------------

        if (!outputMatched) {

            console.log(
                `❌ Test Case ${i + 1} Failed`
            );

            break;
        }

    }


    // =====================================
    // CHECK FINAL RESULT
    // =====================================

    const allPassed =
        testResults.length ===
        testCases.length &&
        testResults.every(
            result =>
                result.success === true
        );


    console.log(
        "🏁 ALL TEST CASES PASSED:",
        allPassed
    );


    // =====================================
    // CALCULATE POINTS
    // =====================================

    let points = 100;


    if (question.difficulty === "Medium") {

        points = 200;

    } else if (question.difficulty === "Hard") {

        points = 300;

    }


    console.log(
        "🎯 Points:",
        points
    );


    // =====================================
    // ACCEPTED
    // =====================================

    if (allPassed) {

        // =================================
        // ALREADY SOLVED
        // =================================

        if (alreadySolved) {

            console.log(
                "ℹ️ Question already solved."
            );


            return {

                success: true,

                accepted: true,

                alreadySolved: true,

                message:
                    "Question already solved.",

                contestCode,

                questionId,

                questionTitle:
                    question.title,

                language,

                totalTestCases:
                    testCases.length,

                passedTestCases:
                    testCases.length,

                pointsEarned: 0,

                score:
                    participant.score,

                solvedCount:
                    participant.solvedQuestions.length,

                totalQuestions:
                    contest.questions.length,

                wrongAttempts:
                    participant.wrongAttempts,

                testResults
            };
        }


        // =================================
        // NEW SOLUTION
        // =================================

        participant.solvedQuestions.push(
            questionId
        );


        participant.score += points;


        await participant.save();


        console.log(
            "🏆 Question solved!"
        );


        console.log(
            "🎯 Points Earned:",
            points
        );


        console.log(
            "💰 Total Score:",
            participant.score
        );


        // =================================
        // UPDATE LEADERBOARD
        // =================================

        if (global.io) {

            global.io
                .to(contest.contestCode)
                .emit(
                    "leaderboardUpdated"
                );
        }


        // =================================
        // SUCCESS RESPONSE
        // =================================

        return {

            success: true,

            accepted: true,

            alreadySolved: false,

            message:
                "All test cases passed.",

            contestCode,

            questionId,

            questionTitle:
                question.title,

            language,

            totalTestCases:
                testCases.length,

            passedTestCases:
                testCases.length,

            pointsEarned:
                points,

            score:
                participant.score,

            solvedCount:
                participant.solvedQuestions.length,

            totalQuestions:
                contest.questions.length,

            wrongAttempts:
                participant.wrongAttempts,

            testResults
        };
    }


    // =====================================
    // WRONG ANSWER
    // =====================================

    participant.wrongAttempts += 1;


    await participant.save();


    console.log(
        "❌ Wrong submission"
    );


    console.log(
        "❌ Wrong Attempts:",
        participant.wrongAttempts
    );


    // =====================================
    // WRONG ANSWER RESPONSE
    // =====================================

    return {

        success: true,

        accepted: false,

        alreadySolved: false,

        message:
            "Some test cases failed.",

        contestCode,

        questionId,

        questionTitle:
            question.title,

        language,

        totalTestCases:
            testCases.length,

        passedTestCases:
            testResults.filter(
                result =>
                    result.success === true
            ).length,

        pointsEarned: 0,

        score:
            participant.score,

        solvedCount:
            participant.solvedQuestions.length,

        totalQuestions:
            contest.questions.length,

        wrongAttempts:
            participant.wrongAttempts,

        testResults
    };

};


// import Contest from "../models/contest.model.js";
// import ContestParticipant from "../models/contestParticipant.model.js";
// import Question from "../models/question.model.js";

// import { codeQueue, codeQueueEvents } from "../queues/codeQueue.js";


// // =====================================
// // SUBMIT CODE SERVICE
// // =====================================
// export const submitCodeService = async ({
//     contestCode,
//     userId,
//     questionId,
//     code,
//     language
// }) => {

//     console.log("\n==============================");
//     console.log("🚀 SUBMIT CODE");
//     console.log("==============================");

//     console.log("Contest Code:", contestCode);
//     console.log("User ID:", userId);
//     console.log("Question ID:", questionId);
//     console.log("Language:", language);


//     // =====================================
//     // FIND CONTEST
//     // =====================================

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {

//         throw new Error(
//             "Contest not found."
//         );
//     }


//     console.log(
//         "Contest Status:",
//         contest.status
//     );


//     // =====================================
//     // CHECK CONTEST STATUS
//     // =====================================

//     if (contest.status !== "running") {

//         throw new Error(
//             `Contest is not running. Current status: ${contest.status}`
//         );
//     }


//     // =====================================
//     // CHECK CONTEST TIME
//     // =====================================

//     if (
//         contest.endTime &&
//         new Date() >= contest.endTime
//     ) {

//         contest.status = "ended";

//         await contest.save();


//         throw new Error(
//             "Contest time has expired."
//         );
//     }


//     // =====================================
//     // CHECK PARTICIPANT
//     // =====================================

//     console.log(
//         "🔍 Checking participant..."
//     );


//     const participant =
//         await ContestParticipant.findOne({

//             contest: contest._id,

//             user: userId
//         });


//     console.log(
//         "Participant:",
//         participant
//     );


//     if (!participant) {

//         throw new Error(
//             "You are not a participant of this contest."
//         );
//     }


//     console.log(
//         "✅ Participant verified:",
//         participant._id.toString()
//     );


//     // =====================================
//     // FIND QUESTION
//     // =====================================

//     const question =
//         await Question.findById(
//             questionId
//         );


//     if (!question) {

//         throw new Error(
//             "Question not found."
//         );
//     }


//     console.log(
//         "Question:",
//         question.title
//     );


//     // =====================================
//     // CHECK QUESTION BELONGS TO CONTEST
//     // =====================================

//     const questionExists =
//         contest.questions.some(
//             question =>
//                 question.toString() ===
//                 questionId.toString()
//         );


//     if (!questionExists) {

//         throw new Error(
//             "Question does not belong to this contest."
//         );
//     }


//     // =====================================
//     // VALIDATE CODE
//     // =====================================

//     if (
//         !code ||
//         code.trim() === ""
//     ) {

//         throw new Error(
//             "Code cannot be empty."
//         );
//     }


//     if (
//         !language ||
//         language.trim() === ""
//     ) {

//         throw new Error(
//             "Programming language is required."
//         );
//     }


//     // =====================================
//     // GET TEST CASES
//     // =====================================

//     const testCases =
//         question.testCases || [];


//     if (testCases.length === 0) {

//         throw new Error(
//             "No test cases available for this question."
//         );
//     }


//     console.log(
//         "🧪 Total Test Cases:",
//         testCases.length
//     );


//     // =====================================
//     // RUN ALL TEST CASES
//     // =====================================

//     const testResults = [];


//     for (
//         let i = 0;
//         i < testCases.length;
//         i++
//     ) {

//         const testCase = testCases[i];


//         // ---------------------------------
//         // GET INPUT
//         // ---------------------------------

//         const input =
//             testCase.input || "";


//         console.log(
//             `🧪 Running Test Case ${i + 1}`
//         );

//         console.log(
//             "Input:",
//             JSON.stringify(input)
//         );


//         // ---------------------------------
//         // ADD JOB TO BULLMQ
//         // ---------------------------------

//         const job =
//             await codeQueue.add(
//                 "submitCode",
//                 {
//                     code,

//                     language,

//                     roomId: contestCode,

//                     input
//                 }
//             );


//         console.log(
//             "📦 Job Added:",
//             job.id
//         );


//         // ---------------------------------
//         // WAIT FOR RESULT
//         // ---------------------------------

//         const result =
//             await job.waitUntilFinished(
//                 codeQueueEvents,
//                 10000
//             );


//         console.log(
//             `📤 Test Case ${i + 1} Result:`,
//             result
//         );


//         testResults.push({

//             testCase:
//                 i + 1,

//             input,

//             output:
//                 result.output || "",

//             error:
//                 result.error || "",

//             success:
//                 result.success === true
//         });


//         // ---------------------------------
//         // STOP IF TEST CASE FAILED
//         // ---------------------------------

//         if (
//             result.success !== true
//         ) {

//             break;
//         }
//     }


//     // =====================================
//     // CHECK FINAL RESULT
//     // =====================================

//     const allPassed =
//         testResults.length ===
//         testCases.length &&
//         testResults.every(
//             result =>
//                 result.success === true
//         );


//     // =====================================
//     // UPDATE PARTICIPANT
//     // =====================================

// //     if (allPassed) {

// //     const alreadySolved =
// //         participant.solvedQuestions.some(
// //             question =>
// //                 question.toString() ===
// //                 questionId.toString()
// //         );

// //     if (!alreadySolved) {

// //         participant.solvedQuestions.push(
// //             questionId
// //         );

// //         participant.score += 100;

// //         await participant.save();

// //         console.log("🏆 Question solved!");
// //         console.log("Score:", participant.score);

// //         if (global.io) {
// //             global.io
// //                 .to(contest.contestCode)
// //                 .emit("leaderboardUpdated");
// //         }

// //         console.log(
// //             "🏆 Question solved!"
// //         );

// //         console.log(
// //             "Score:",
// //             participant.score
// //         );
// //     }
// // }

//     if (allPassed) {

//         const alreadySolved =
//             participant.solvedQuestions.some(
//                 question =>
//                     question.toString() ===
//                     questionId.toString()
//             );


//         if (!alreadySolved) {

//             participant.solvedQuestions.push(
//                 questionId
//             );


//             participant.score += 100;


//             await participant.save();

//             console.log("🏆 Question solved!");
// console.log("Score:", participant.score);

// if (global.io) {
//     global.io
//         .to(contest.contestCode)
//         .emit("leaderboardUpdated");
// }
//     return {
//     success: true,
//     accepted: true,

//     message: "All test cases passed.",

//     contestCode,
//     questionId,
//     questionTitle: question.title,
//     language,

//     totalTestCases: question.testCases.length,
//     passedTestCases: question.testCases.length,

//     pointsEarned: points,
//     score: participant.score,

//     solvedCount: participant.solvedQuestions.length,
//     totalQuestions: contest.questions.length,

//     wrongAttempts: participant.wrongAttempts,

//     testResults,
// };

//             console.log(
//                 "🏆 Question solved!"
//             );

//             console.log(
//                 "Score:",
//                 participant.score
//             );
//         }
//     }


//     // =====================================
//     // FINAL RESULT
//     // =====================================

//     const result = {

//         success:
//             allPassed,

//         message:
//             allPassed
//                 ? "All test cases passed."
//                 : "Some test cases failed.",

//         contestCode,

//         questionId,

//         questionTitle:
//             question.title,

//         language,

//         totalTestCases:
//             testCases.length,

//         passedTestCases:
//             testResults.filter(
//                 result =>
//                     result.success
//             ).length,

//         testResults,

//         score:
//             participant.score
//     };


//     console.log(
//         "================================"
//     );

//     console.log(
//         "🏁 SUBMISSION RESULT"
//     );

//     console.log(
//         result
//     );

//     console.log(
//         "================================\n"
//     );


//     return result;
// };




// import Contest from "../models/contest.model.js";
// import ContestParticipant from "../models/contestParticipant.model.js";


// // =====================================
// // SUBMIT CODE SERVICE
// // =====================================
// export const submitCodeService = async ({
//     contestCode,
//     userId,
//     questionId,
//     code,
//     language
// }) => {

//     console.log("\n==============================");
//     console.log("🚀 SUBMIT CODE");
//     console.log("==============================");

//     console.log("Contest Code:", contestCode);
//     console.log("User ID:", userId);
//     console.log("Question ID:", questionId);
//     console.log("Language:", language);


//     // =====================================
//     // VALIDATE USER ID
//     // =====================================

//     if (!userId) {

//         throw new Error(
//             "User authentication required."
//         );
//     }


//     // =====================================
//     // FIND CONTEST
//     // =====================================

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {
//         throw new Error(
//             "Contest not found."
//         );
//     }


//     console.log(
//         "Contest ID:",
//         contest._id
//     );


//     console.log(
//         "Contest Status:",
//         contest.status
//     );


//     // =====================================
//     // CHECK CONTEST STATUS
//     // =====================================

//     if (contest.status !== "running") {

//         throw new Error(
//             `Contest is not running. Current status: ${contest.status}`
//         );
//     }


//     // =====================================
//     // CHECK CONTEST TIME
//     // =====================================

//     if (
//         contest.endTime &&
//         new Date() >= contest.endTime
//     ) {

//         contest.status = "completed";

//         await contest.save();


//         throw new Error(
//             "Contest time has expired."
//         );
//     }


//     // =====================================
//     // CHECK PARTICIPANT
//     // =====================================

//     console.log(
//         "🔍 Checking participant..."
//     );

//     console.log(
//         "Contest ID:",
//         contest._id.toString()
//     );

//     console.log(
//         "User ID:",
//         userId.toString()
//     );


//     const participant =
//         await ContestParticipant.findOne({

//             contest: contest._id,

//             user: userId
//         });


//     console.log(
//         "Participant:",
//         participant
//     );


//     if (!participant) {

//         throw new Error(
//             "You are not a participant of this contest."
//         );
//     }


//     console.log(
//         "✅ Participant verified:",
//         participant._id.toString()
//     );


//     // =====================================
//     // CHECK QUESTION
//     // =====================================

//     const questionExists =
//         contest.questions.some(
//             question =>
//                 question.toString() ===
//                 questionId.toString()
//         );


//     if (!questionExists) {

//         throw new Error(
//             "Question does not belong to this contest."
//         );
//     }


//     // =====================================
//     // VALIDATE CODE
//     // =====================================

//     if (!code || code.trim() === "") {

//         throw new Error(
//             "Code cannot be empty."
//         );
//     }


//     if (!language || language.trim() === "") {

//         throw new Error(
//             "Programming language is required."
//         );
//     }


//     // =====================================
//     // HERE YOU CALL YOUR CODE EXECUTION
//     // =====================================

//     /*
//        IMPORTANT:

//        Tujha existing BullMQ / Redis
//        code execution logic इथे call कर.

//        Example:

//        const result = await executeCode({
//            code,
//            language,
//            questionId
//        });

//     */


//     // Temporary result
//     const result = {

//         success: true,

//         message: "Code submitted successfully.",

//         code,

//         language,

//         questionId,

//         contestCode
//     };


//     console.log(
//         "✅ Code submitted successfully"
//     );


//     console.log("==============================\n");


//     return result;
// };


// import Contest from "../models/contest.model.js";
// import ContestParticipant from "../models/contestParticipant.model.js";


// // =====================================
// // SUBMIT CODE SERVICE
// // =====================================
// export const submitCodeService = async ({
//     contestCode,
//     userId,
//     questionId,
//     code,
//     language
// }) => {

//     console.log("\n==============================");
//     console.log("🚀 SUBMIT CODE");
//     console.log("==============================");

//     console.log("Contest Code:", contestCode);
//     console.log("User ID:", userId);
//     console.log("Question ID:", questionId);
//     console.log("Language:", language);


//     // =====================================
//     // FIND CONTEST
//     // =====================================

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {
//         throw new Error(
//             "Contest not found."
//         );
//     }


//     console.log(
//         "Contest Status:",
//         contest.status
//     );


//     // =====================================
//     // CHECK CONTEST STATUS
//     // =====================================

//     if (contest.status !== "running") {

//         throw new Error(
//             `Contest is not running. Current status: ${contest.status}`
//         );
//     }


//     // =====================================
//     // CHECK CONTEST TIME
//     // =====================================

//     if (
//         contest.endTime &&
//         new Date() >= contest.endTime
//     ) {

//         contest.status = "completed";

//         await contest.save();


//         throw new Error(
//             "Contest time has expired."
//         );
//     }


//     // =====================================
//     // CHECK PARTICIPANT
//     // =====================================

//     const participant =
//         await ContestParticipant.findOne({

//             contest: contest._id,

//             user: userId
//         });


//     if (!participant) {

//         throw new Error(
//             "You are not a participant of this contest."
//         );
//     }


//     // =====================================
//     // CHECK QUESTION
//     // =====================================

//     const questionExists =
//         contest.questions.some(
//             question =>
//                 question.toString() ===
//                 questionId.toString()
//         );


//     if (!questionExists) {

//         throw new Error(
//             "Question does not belong to this contest."
//         );
//     }


//     // =====================================
//     // VALIDATE CODE
//     // =====================================

//     if (!code || code.trim() === "") {

//         throw new Error(
//             "Code cannot be empty."
//         );
//     }


//     if (!language || language.trim() === "") {

//         throw new Error(
//             "Programming language is required."
//         );
//     }


//     // =====================================
//     // HERE YOU CALL YOUR CODE EXECUTION
//     // =====================================

//     /*
//        IMPORTANT:

//        Tujha existing BullMQ / Redis
//        code execution logic इथे call कर.

//        Example:

//        const result = await executeCode({
//            code,
//            language,
//            questionId
//        });

//     */


//     // Temporary result
//     const result = {
//         success: true,

//         message: "Code submitted successfully.",

//         code,

//         language,

//         questionId,

//         contestCode
//     };


//     console.log(
//         "✅ Code submitted successfully"
//     );


//     console.log("==============================\n");


//     return result;
// };



// import Contest from "../models/contest.model.js";
// import Question from "../models/question.model.js";
// import ContestParticipant from "../models/contestParticipant.model.js";

// import { runJava } from "../executors/javaExecutor.js";
// import { runCpp } from "../executors/cppExecutor.js";
// import { runC } from "../executors/cExecutor.js";


// // ======================================
// // POINTS BASED ON DIFFICULTY
// // ======================================

// const pointsMap = {
//     Easy: 100,
//     Medium: 200,
//     Hard: 300,
// };

// // ======================================
// // SUBMIT CODE SERVICE
// // ======================================

// export const submitCodeService = async (
//     user,
//     body
// ) => {

//     const {
//         contestCode,
//         questionId,
//         code,
//         language,
//     } = body;


//     // ==================================
//     // VALIDATION
//     // ==================================

//     if (
//         !contestCode ||
//         !questionId ||
//         !code ||
//         !language
//     ) {
//         throw new Error(
//             "Contest code, question ID, code and language are required."
//         );
//     }


//     // ==================================
//     // FIND CONTEST
//     // ==================================

//     const contest = await Contest.findOne({
//         contestCode,
//     });

//     if (!contest) {
//         throw new Error(
//             "Contest not found."
//         );
//     }


//     // ==================================
//     // CHECK CONTEST STATUS
//     // ==================================

//     if (contest.status !== "running") {
//         throw new Error(
//             "Contest is not running."
//         );
//     }


//     // ==================================
//     // FIND QUESTION
//     // ==================================

//     const question = await Question.findById(
//         questionId
//     );

//     if (!question) {
//         throw new Error(
//             "Question not found."
//         );
//     }


//     // ==================================
//     // CHECK QUESTION BELONGS TO CONTEST
//     // ==================================

//     const questionExists =
//         contest.questions.some(
//             (id) =>
//                 id.toString() ===
//                 questionId.toString()
//         );

//     if (!questionExists) {
//         throw new Error(
//             "This question does not belong to this contest."
//         );
//     }


//     // ==================================
//     // FIND PARTICIPANT
//     // ==================================

//     const participant =
//         await ContestParticipant.findOne({
//             contest: contest._id,
//             user: user._id,
//         });

//     if (!participant) {
//         throw new Error(
//             "You have not joined this contest."
//         );
//     }


//     // ==================================
//     // CHECK ALREADY SOLVED
//     // ==================================

//     const alreadySolved =
//         participant.solvedQuestions.some(
//             (id) =>
//                 id.toString() ===
//                 questionId.toString()
//         );

//     if (alreadySolved) {
//         return {
//             success: true,
//             accepted: true,
//             alreadySolved: true,
//             message:
//                 "Question already solved. No additional points awarded.",
//             score: participant.score,
//             solvedCount:
//                 participant.solvedQuestions.length,
//             totalQuestions:
//                 contest.questions.length,
//         };
//     }


//     // ==================================
//     // CHECK TEST CASES
//     // ==================================

//     if (
//         !question.testCases ||
//         question.testCases.length === 0
//     ) {
//         throw new Error(
//             "No test cases available for this question."
//         );
//     }


//     // ==================================
//     // SELECT EXECUTOR
//     // ==================================

//     let executeCode;

//     switch (language.toLowerCase()) {

//         case "java":
//             executeCode = runJava;
//             break;

//         case "cpp":
//             executeCode = runCpp;
//             break;

//         case "c":
//             executeCode = runC;
//             break;

//         default:
//             throw new Error(
//                 "Unsupported programming language."
//             );
//     }


//     // ==================================
//     // RUN ALL TEST CASES
//     // ==================================

//     const testResults = [];

//     let allPassed = true;


//     for (
//         let i = 0;
//         i < question.testCases.length;
//         i++
//     ) {

//         const testCase =
//             question.testCases[i];


//         const result =
//             await executeCode(
//                 code,
//                 testCase.input
//             );


//         // ==============================
//         // EXECUTION ERROR
//         // ==============================

//         if (!result.success) {

//             allPassed = false;

//             testResults.push({
//                 testCase: i + 1,
//                 passed: false,
//                 error: result.error,
//             });

//             break;
//         }


//         // ==============================
//         // NORMALIZE OUTPUT
//         // ==============================

//         const actualOutput =
//             result.output
//                 .trim()
//                 .replace(/\r\n/g, "\n");

//         const expectedOutput =
//             testCase.output
//                 .trim()
//                 .replace(/\r\n/g, "\n");


//         // ==============================
//         // COMPARE
//         // ==============================

//         const passed =
//             actualOutput ===
//             expectedOutput;


//         testResults.push({
//             testCase: i + 1,
//             passed,
//         });


//         if (!passed) {

//             allPassed = false;

//             break;
//         }
//     }


//     // ==================================
//     // WRONG ANSWER
//     // ==================================

//     if (!allPassed) {

//         participant.wrongAttempts += 1;

//         await participant.save();

//         if (global.io){
//             global.io.to(contest.contestCode).emit("leaderboardUpdated");
//         }

//         return {
//             success: true,
//             accepted: false,

//             message:
//                 "Wrong Answer",

//             score:
//                 participant.score,

//             solvedCount:
//                 participant.solvedQuestions.length,

//             totalQuestions:
//                 contest.questions.length,

//             wrongAttempts:
//                 participant.wrongAttempts,

//             testResults,
//         };
//     }


//     // ==================================
// // ACCEPTED
// // ==================================

// const points =
//     pointsMap[question.difficulty] || 100;

// participant.solvedQuestions.push(
//     question._id
// );

// participant.score += points;

// await participant.save();

// if (global.io){
//     global.io.to(contest.contestCode).emit("leaderboardUpdated");
// }

//     // const points =
//     //     pointsMap[question.difficulty] || 100;


//     // participant.solvedQuestions.push(
//     //     question._id
//     // );

//     // participant.score += points;


//     // await participant.save();


//     // ==================================
//     // RETURN RESULT
//     // ==================================

//     return {
//         success: true,

//         accepted: true,

//         message:
//             "Accepted! All test cases passed.",

//         pointsEarned:
//             points,

//         score:
//             participant.score,

//         solvedCount:
//             participant.solvedQuestions.length,

//         totalQuestions:
//             contest.questions.length,

//         wrongAttempts:
//             participant.wrongAttempts,

//         testResults,
//     };
// };
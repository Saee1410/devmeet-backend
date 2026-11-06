import Contest from "../models/contest.model.js";
import Question from "../models/question.model.js";
import ContestParticipant from "../models/contestParticipant.model.js";


// ======================================================
// GENERATE UNIQUE CONTEST CODE
// ======================================================

const generateContestCode = () => {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return code;
};


// ======================================================
// CREATE CONTEST
// ======================================================

export const createContestService = async (
    userId,
    data = {}
) => {

    const {
        title = "DevMeet Contest",
        description = "",
        duration = 30,
        maxParticipants = 5,
        visibility = "private"
    } = data;


    // Generate unique code
    let contestCode;
    let existingContest;

    do {

        contestCode = generateContestCode();

        existingContest = await Contest.findOne({
            contestCode
        });

    } while (existingContest);


    // Get random 5 questions
    const questions = await Question.aggregate([
        {
            $sample: {
                size: 5
            }
        }
    ]);


    if (!questions || questions.length === 0) {
        throw new Error("No questions available.");
    }


    const questionIds = questions.map(
        question => question._id
    );


    // Create contest
    const contest = await Contest.create({

        contestCode,

        createdBy: userId,

        title,

        description,

        questions: questionIds,

        duration,

        maxParticipants,

        visibility,

        status: "waiting",

        startTime: null,

        endTime: null
    });


    // Add creator as participant
    const participant =
        await ContestParticipant.create({

            contest: contest._id,

            user: userId,

            score: 0,

            joinedAt: new Date()
        });


    // Add participant reference to contest
    contest.participants.push(
        participant._id
    );

    await contest.save();


    console.log(
        `🟡 Contest created: ${contestCode}`
    );


    console.log(
        `🟢 Creator added as participant: ${userId}`
    );


    return contest;
};


// ======================================================
// JOIN CONTEST
// ======================================================

export const joinContestService = async (
    contestCode,
    userId
) => {

    const contest = await Contest.findOne({
        contestCode
    });


    if (!contest) {
        throw new Error("Contest not found.");
    }


    if (contest.status === "ended") {

        throw new Error(
            "Contest has already ended."
        );
    }


    // Check already joined
    const existingParticipant =
        await ContestParticipant.findOne({

            contest: contest._id,

            user: userId
        });


    if (existingParticipant) {

        return {
            contest,
            participant: existingParticipant
        };
    }


    // Check room capacity
    const participantCount =
        await ContestParticipant.countDocuments({

            contest: contest._id
        });


    if (
        contest.maxParticipants &&
        participantCount >= contest.maxParticipants
    ) {

        throw new Error(
            "Contest room is full."
        );
    }


    // Create participant
    const participant =
        await ContestParticipant.create({

            contest: contest._id,

            user: userId,

            score: 0,

            joinedAt: new Date()
        });


    // Add participant reference
    contest.participants.push(
        participant._id
    );

    await contest.save();


    console.log(
        `🟢 User ${userId} joined ${contestCode}`
    );


    return {
        contest,
        participant
    };
};


// ======================================================
// START CONTEST
// ======================================================

export const startContestService = async (
    contestCode,
    userId
) => {

    const contest = await Contest.findOne({
        contestCode
    });


    if (!contest) {
        throw new Error("Contest not found.");
    }


    // Only creator can start
    if (
        contest.createdBy.toString() !==
        userId.toString()
    ) {

        throw new Error(
            "Only contest creator can start the contest."
        );
    }


    // Already running
    if (contest.status === "running") {

        return contest;
    }


    // Already ended
    if (contest.status === "ended") {

        throw new Error(
            "Contest has already ended."
        );
    }


    // ==============================
    // START CONTEST
    // ==============================

    contest.status = "running";

    contest.startTime = new Date();

    contest.endTime = new Date(
        Date.now() +
        (contest.duration || 30) * 60 * 1000
    );


    await contest.save();


    console.log(
        `🟢 Contest ${contestCode} started`
    );

    console.log(
        "Status:",
        contest.status
    );

    console.log(
        "Start:",
        contest.startTime
    );

    console.log(
        "End:",
        contest.endTime
    );


    return contest;
};


// ======================================================
// END CONTEST
// ======================================================

export const endContestService = async (
    contestCode,
    userId
) => {

    const contest = await Contest.findOne({
        contestCode
    });


    if (!contest) {
        throw new Error("Contest not found.");
    }


    if (
        contest.createdBy.toString() !==
        userId.toString()
    ) {

        throw new Error(
            "Only contest creator can end the contest."
        );
    }


    if (contest.status !== "running") {

        throw new Error(
            "Contest is not running."
        );
    }


    contest.status = "ended";

    contest.endTime = new Date();


    await contest.save();


    console.log(
        `🔴 Contest ${contestCode} ended`
    );


    return contest;
};


// ======================================================
// GET CONTEST
// ======================================================

export const getContestService = async (
    contestCode
) => {

    const contest = await Contest.findOne({
        contestCode
    })
        .populate("questions")
        .populate("createdBy");


    if (!contest) {
        throw new Error("Contest not found.");
    }


    // Automatically end expired contest
    if (
        contest.status === "running" &&
        contest.endTime &&
        new Date() >= contest.endTime
    ) {

        contest.status = "ended";

        await contest.save();

        console.log(
            `🔴 Contest ${contestCode} automatically ended`
        );
    }


    return contest;
};


// ======================================================
// GET LEADERBOARD
// ======================================================

export const getLeaderboardService = async (
    contestCode
) => {

    const contest = await Contest.findOne({
        contestCode
    });


    if (!contest) {
        throw new Error("Contest not found.");
    }


    const leaderboard =
        await ContestParticipant.find({

            contest: contest._id

        })
            .populate(
                "user",
                "name username email"
            )
            .sort({
                score: -1
            });


    return leaderboard;
};


// ======================================================
// UPDATE SCORE
// ======================================================

export const updateParticipantScoreService = async (
    contestCode,
    userId,
    score
) => {

    const contest = await Contest.findOne({
        contestCode
    });


    if (!contest) {
        throw new Error("Contest not found.");
    }


    const participant =
        await ContestParticipant.findOne({

            contest: contest._id,

            user: userId
        });


    if (!participant) {
        throw new Error(
            "Participant not found."
        );
    }


    participant.score = score;

    await participant.save();


    return participant;
};


// import Contest from "../models/contest.model.js";
// import Question from "../models/question.model.js";
// import ContestParticipant from "../models/contestParticipant.model.js";


// // ======================================================
// // GENERATE UNIQUE CONTEST CODE
// // ======================================================

// const generateContestCode = () => {

//     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

//     let code = "";

//     for (let i = 0; i < 6; i++) {
//         code += chars.charAt(
//             Math.floor(Math.random() * chars.length)
//         );
//     }

//     return code;
// };


// // ======================================================
// // CREATE CONTEST
// // ======================================================

// export const createContestService = async (
//     userId,
//     data = {}
// ) => {

//     const {
//         title = "DevMeet Contest",
//         duration = 30,
//         maxParticipants = 5
//     } = data;


//     // Generate unique code
//     let contestCode;
//     let existingContest;

//     do {

//         contestCode = generateContestCode();

//         existingContest = await Contest.findOne({
//             contestCode
//         });

//     } while (existingContest);


//     // Get random 5 questions
//     const questions = await Question.aggregate([
//         {
//             $sample: {
//                 size: 5
//             }
//         }
//     ]);


//     if (!questions || questions.length === 0) {
//         throw new Error("No questions available.");
//     }


//     const questionIds = questions.map(
//         question => question._id
//     );


//     // Create contest
//     const contest = await Contest.create({

//         contestCode,

//         createdBy: userId,

//         title,

//         questions: questionIds,

//         duration,

//         maxParticipants,

//         status: "waiting",

//         startTime: null,

//         endTime: null
//     });


//     // Add creator as participant
//     await ContestParticipant.create({

//         contest: contest._id,

//         user: userId,

//         score: 0,

//         joinedAt: new Date()
//     });


//     console.log(
//         `🟡 Contest created: ${contestCode}`
//     );


//     return contest;
// };


// // ======================================================
// // JOIN CONTEST
// // ======================================================

// export const joinContestService = async (
//     contestCode,
//     userId
// ) => {

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {
//         throw new Error("Contest not found.");
//     }


//     if (contest.status === "ended") {
//         throw new Error(
//             "Contest has already ended."
//         );
//     }


//     // Check already joined
//     const existingParticipant =
//         await ContestParticipant.findOne({

//             contest: contest._id,

//             user: userId
//         });


//     if (existingParticipant) {

//         return {
//             contest,
//             participant: existingParticipant
//         };
//     }


//     // Check room capacity
//     const participantCount =
//         await ContestParticipant.countDocuments({

//             contest: contest._id
//         });


//     if (
//         contest.maxParticipants &&
//         participantCount >= contest.maxParticipants
//     ) {

//         throw new Error(
//             "Contest room is full."
//         );
//     }


//     // Create participant
//     const participant =
//         await ContestParticipant.create({

//             contest: contest._id,

//             user: userId,

//             score: 0,

//             status: "joined",

//             joinedAt: new Date()
//         });


//     console.log(
//         `🟢 User ${userId} joined ${contestCode}`
//     );


//     return {
//         contest,
//         participant
//     };
// };


// // ======================================================
// // START CONTEST
// // ======================================================

// export const startContestService = async (
//     contestCode,
//     userId
// ) => {

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {
//         throw new Error("Contest not found.");
//     }


//     // Only creator can start
//     if (
//         contest.createdBy.toString() !==
//         userId.toString()
//     ) {

//         throw new Error(
//             "Only contest creator can start the contest."
//         );
//     }


//     // Already running
//     if (contest.status === "running") {

//         return contest;
//     }


//     // Already completed
//     if (contest.status === "ended") {

//         throw new Error(
//             "Contest has already ended."
//         );
//     }


//     // ==============================
//     // START CONTEST
//     // ==============================

//     contest.status = "running";

//     contest.startTime = new Date();

//     contest.endTime = new Date(
//         Date.now() +
//         (contest.duration || 30) * 60 * 1000
//     );


//     await contest.save();


//     console.log(
//         `🟢 Contest ${contestCode} started`
//     );

//     console.log(
//         "Status:",
//         contest.status
//     );

//     console.log(
//         "Start:",
//         contest.startTime
//     );

//     console.log(
//         "End:",
//         contest.endTime
//     );


//     return contest;
// };


// // ======================================================
// // END CONTEST
// // ======================================================

// export const endContestService = async (
//     contestCode,
//     userId
// ) => {

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {
//         throw new Error("Contest not found.");
//     }


//     if (
//         contest.createdBy.toString() !==
//         userId.toString()
//     ) {

//         throw new Error(
//             "Only contest creator can end the contest."
//         );
//     }


//     if (contest.status !== "running") {

//         throw new Error(
//             "Contest is not running."
//         );
//     }


//     contest.status = "ended";

//     contest.endTime = new Date();


//     await contest.save();


//     console.log(
//         `🔴 Contest ${contestCode} ended`
//     );


//     return contest;
// };


// // ======================================================
// // GET CONTEST
// // ======================================================

// export const getContestService = async (
//     contestCode
// ) => {

//     const contest = await Contest.findOne({
//         contestCode
//     })
//         .populate("questions")
//         .populate("createdBy");


//     if (!contest) {
//         throw new Error("Contest not found.");
//     }


//     // Automatically complete expired contest
//     if (
//         contest.status === "running" &&
//         contest.endTime &&
//         new Date() >= contest.endTime
//     ) {

//         contest.status = "ended";

//         await contest.save();

//         console.log(
//             `🔴 Contest ${contestCode} automatically completed`
//         );
//     }


//     return contest;
// };


// // ======================================================
// // GET LEADERBOARD
// // ======================================================

// export const getLeaderboardService = async (
//     contestCode
// ) => {

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {
//         throw new Error("Contest not found.");
//     }


//     const leaderboard =
//         await ContestParticipant.find({

//             contest: contest._id

//         })
//             .populate(
//                 "user",
//                 "name username email"
//             )
//             .sort({
//                 score: -1
//             });


//     return leaderboard;
// };


// // ======================================================
// // UPDATE SCORE
// // ======================================================

// export const updateParticipantScoreService = async (
//     contestCode,
//     userId,
//     score
// ) => {

//     const contest = await Contest.findOne({
//         contestCode
//     });


//     if (!contest) {
//         throw new Error("Contest not found.");
//     }


//     const participant =
//         await ContestParticipant.findOne({

//             contest: contest._id,

//             user: userId
//         });


//     if (!participant) {
//         throw new Error(
//             "Participant not found."
//         );
//     }


//     participant.score = score;

//     await participant.save();


//     return participant;
// };


// import Contest from "../models/contest.model.js";
// import Question from "../models/question.model.js";
// import ContestParticipant from "../models/contestParticipant.model.js";

// const generateContestCode = () => {
//     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//     let code = "";

//     for(let i = 0; i < 6; i++){
//         code += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return code;
// };

// export const createContestService = async (user, body) => {

//     const questions = await Question.aggregate([
//         {
//             $sample: { size: 5 }
//         }
//     ]);

//     if (questions.length < 5) {
//         throw new Error("Not enough questions available.");
//     }

//     const contest = await Contest.create({
//         contestCode: generateContestCode(),
//         title: body.title,
//         description: body.description,
//         createdBy: user._id,
//         questions: questions.map(q => q._id),
//         duration: body.duration || 30,
//         visibility: body.visibility || "private",
//         status: "waiting"
//     });

//     // Creator automatically joins the contest
//     const participant = await ContestParticipant.create({
//         contest: contest._id,
//         user: user._id,
//     });

//     contest.participants.push(participant._id);

//     await contest.save();

//     return contest;
// };



// export const joinContestService = async (user, body) => {

//     const { contestCode } = body;

//     console.log("🔎 Contest Code:", contestCode);
//     console.log("🔎 User ID:", user?._id);

//     if (!contestCode) {
//         throw new Error("Contest code is required.");
//     }

//     if (!user?._id) {
//         throw new Error("User authentication failed.");
//     }

//     const contest = await Contest.findOne({
//         contestCode: contestCode.trim().toUpperCase()
//     });

//     if (!contest) {
//         throw new Error("Contest not found.");
//     }

//     console.log("✅ Contest found:", contest.contestCode);
//     console.log("📊 Status:", contest.status);
//     console.log(
//         "👥 Participants:",
//         contest.participants.length
//     );
//     console.log(
//         "👥 Max Participants:",
//         contest.maxParticipants
//     );

//     if (contest.status !== "waiting") {
//         throw new Error("Contest already started.");
//     }

//     const maxParticipants = contest.maxParticipants || 5;

//     if (contest.participants.length >= maxParticipants) {
//         throw new Error("Contest is full.");
//     }

//     const alreadyJoined = await ContestParticipant.findOne({
//         contest: contest._id,
//         user: user._id,
//     });

//     if (alreadyJoined) {
//         throw new Error("User already joined the contest.");
//     }

//     const participant = await ContestParticipant.create({
//         contest: contest._id,
//         user: user._id,
//     });

//     contest.participants.push(participant._id);

//     await contest.save();

//     console.log(
//         "✅ Participant added:",
//         participant._id
//     );

//     return contest;
// };




// export const startContestService = async (contestCode, userId) => {
//     const contest = await Contest.findOne({ contestCode });

//     if (!contest) {
//         throw new Error("Contest not found.");
//     }

//     if (contest.createdBy.toString() !== userId.toString()) {
//         throw new Error("Only contest creator can start the contest.");
//     }

//     if (contest.status === "running") {
//         throw new Error("Contest is already running.");
//     }

//     if (contest.status === "completed") {
//         throw new Error("Contest is already completed.");
//     }

//     contest.status = "running";
//     contest.startTime = new Date();

//     await contest.save();

//     return contest;
// };





// export const getContestService = async (contestCode) => {

//     const contest = await Contest.findOne({
//         contestCode
//     })
//     .populate("questions")
//     .populate("createdBy");

//     if(!contest) {
//         throw new Error("Contest not found.");
//     }

//     return contest;
// };

// export const getLeaderboardService = async (contestCode) => {

//     const contest = await Contest.findOne({
//         contestCode
//     }).populate({
//         path: "participants",
//         populate: {
//             path: "user",
//             select: "name username email"
//         }
//     });

//     if (!contest) {
//         throw new Error("Contest not found.");
//     }

//     console.log(
//         "🏆 LEADERBOARD PARTICIPANTS:",
//         JSON.stringify(contest.participants, null, 2)
//     );

//     return contest.participants;
// };


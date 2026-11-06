import {
    createContestService,
    joinContestService,
    startContestService,
    getContestService,
    getLeaderboardService,
    
} from "../services/contestService.js";

export const createContest = async (req, res) => {
    try {

        const userId =
            req.user?.id ||
            req.user?._id;

        const contest =
            await createContestService(
                userId,
                req.body
            );

        return res.status(201).json({

            success: true,

            message: "Contest created successfully",

            data: contest,
        });

    } catch (error) {

        console.error(
            "❌ CREATE CONTEST ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message,
        });
    }
};

// export const createContest = async (req, res) => {
//     try {
//         const contest = await createContestService(req.user, req.body);
//         return res.status(201).json({
//             success: true,
//             message: "Contest created successfully",
//             data: contest,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

export const joinContest = async (req, res) => {
    try {

        console.log(
            "📥 JOIN REQUEST BODY:",
            req.body
        );

        console.log(
            "👤 JOIN USER:",
            req.user
        );


        const userId =
            req.user?.id ||
            req.user?._id;


        const result =
            await joinContestService(
                req.body.contestCode,
                userId
            );


        console.log(
            "✅ JOIN SUCCESS:",
            req.body.contestCode
        );


        return res.status(200).json({

            success: true,

            message: "Joined contest successfully",

            data: result,
        });

    } catch (error) {

        console.error(
            "❌ JOIN CONTEST ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message: error.message,
        });
    }
};

// export const joinContest = async (req, res) => {
//     try {

//         console.log("📥 JOIN REQUEST BODY:", req.body);
//         console.log("👤 JOIN USER:", req.user);

//         const contest = await joinContestService(
//             req.user,
//             req.body
//         );

//         console.log(
//             "✅ JOIN SUCCESS:",
//             contest.contestCode
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Joined contest successfully",
//             data: contest,
//         });

//     } catch (error) {

//         console.error(
//             "❌ JOIN CONTEST ERROR:",
//             error
//         );

//         console.error(
//             "❌ ERROR MESSAGE:",
//             error.message
//         );

//         return res.status(400).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

export const startContest = async (req, res) => {
    try {

        const contestCode =
            req.body.contestCode ||
            req.params.contestCode;

        const userId =
            req.user?.id ||
            req.user?._id;

        console.log("🚀 START CONTEST REQUEST");
        console.log("Contest Code:", contestCode);
        console.log("User ID:", userId);

        if (!contestCode) {
            return res.status(400).json({
                success: false,
                message: "Contest code is required."
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required."
            });
        }

        const contest = await startContestService(
            contestCode,
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Contest started successfully",
            data: contest,
        });

    } catch (error) {

        console.error(
            "❌ START CONTEST ERROR:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// export const startContest = async (req, res) => {
//     try {
//         const contest = await startContestService(req.user, req.body);

//         return res.status(200).json({
//             success: true,
//             message: "Contest started successfully",
//             data: contest,
//         });

//     } catch (error){
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
        
// }

export const getContest = async (req, res) => {
    try {
        const contest = await getContestService(req.params.contestCode);

        return res.status(200).json({
            success: true,
            data: contest,
        });
    } catch (error){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await getLeaderboardService(req.params.contestCode);

        return res.status(200).json({
            success: true,
            data: leaderboard,
        
        });

    } catch (error){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
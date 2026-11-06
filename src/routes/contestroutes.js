import express from "express";

import verifyJWT from "../middlewares/verifyJWT.js";

import {
    createContest,
    joinContest,
    startContest,
    getContest,
    getLeaderboard,
} from "../controllers/contestController.js";

const router = express.Router();

router.post("/create", verifyJWT, createContest);

router.post("/join", verifyJWT, joinContest);

router.post(
    "/start/:contestCode",
    verifyJWT,
    startContest
);

router.get(
    "/leaderboard/:contestCode",
    verifyJWT,
    getLeaderboard
);

router.get(
    "/:contestCode",
    verifyJWT,
    getContest
);

export default router;


// import express from "express";
// import verifyJWT from "../middlewares/verifyJWT.js";


// import {
//     createContest, 
//     joinContest,
//     startContest,
//     getContest,
//     getLeaderboard,
// } from "../controllers/contestController.js";

// const router = express.Router();

// router.post("/create", verifyJWT, createContest);
// router.post("/join", verifyJWT, joinContest);
// router.post("/start/:contestCode", verifyJWT, startContest);
// router.get("/leaderboard/:contestCode", verifyJWT, getLeaderboard); 
// router.get("/:contestCode", verifyJWT, getContest); 

// export default router;
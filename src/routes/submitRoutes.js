import express from "express";

import verifyJWT from "../middlewares/verifyJWT.js";
import { submitCode } from "../controllers/submitController.js";

const router = express.Router();

router.post(
    "/",
    verifyJWT,
    submitCode
);

export default router;
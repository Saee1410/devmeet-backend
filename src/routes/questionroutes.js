import express from "express";
import { createQuestion } from "../controllers/questionController.js";

const router = express.Router();

router.post("/create", createQuestion);

export default router;
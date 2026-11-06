import express from "express";
import { compileCode} from "../controllers/compileControllers.js";

const router = express.Router();

router.post("/", compileCode);

export default router;
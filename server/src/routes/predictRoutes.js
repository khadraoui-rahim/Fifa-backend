import express from "express";
import { predictMatch } from "../controllers/predictController.js";

const router = express.Router();

router.post("/predict", predictMatch);

export default router;

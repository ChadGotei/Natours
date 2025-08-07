import express from "express";
import { createReview, getAllReviews } from "../controllers/review.controller.js";
import { protect, restrictTo } from "../controllers/auth.controller.js";

const router = express.Router({ mergeParams: true });
// mergeParams: true, can preserve the req.params from the parent router. Such as id, tourId, userId etc.

router.route("/")
    .get(getAllReviews)
    .post(protect, restrictTo("user", "admin"), createReview);

export default router
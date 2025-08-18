import catchAsync from "../utils/catchAsync.js";
import { Review } from "../models/review.model.js";
import handlerFactory from "./handlerFactory.js";

const deleteReview = handlerFactory.deleteOne(Review);
const updateReview = handlerFactory.updateOne(Review);
const getReview = handlerFactory.getOne(Review);

const getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
        filter = { tourId: req.params.tourId }
    }

    const reviews = await Review.find(filter);

    return res.status(200).json({
        success: true,
        reviews: reviews.length,
        data: reviews || [],
    })
})

const createReview = catchAsync(async (req, res, next) => {
    if (!req.body.tourId) req.body.tourId = req.params.tourId;
    if (!req.body.userId) req.body.userId = req.user.id;

    const newReview = await Review.create(req.body);

    return res.status(201).json({
        success: true,
        data: newReview
    })
})

export { createReview, getAllReviews, deleteReview, updateReview, getReview }
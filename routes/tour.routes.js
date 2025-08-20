import express from 'express';
import {
    getAllTours,
    createTour,
    deleteTour,
    getTour,
    updateTour,
    aliasTopTour,
    getTourStats,
    getMonthlyPlan
} from '../controllers/tours.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';
import reviewRoute from './review.routes.js'

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

// if we get something like tours/2312de/review then send that to reviewRoute
router.use("/:tourId/review", reviewRoute);

router
    .route('/tour-stats')
    .get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(protect, restrictTo('admin', 'lead-guide') ,deleteTour);

router
    .route('/')
    .get(getAllTours)
    .post(protect, restrictTo('admin', 'lead-guide') ,createTour);

export default router;

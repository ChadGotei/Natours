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

const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

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
    .get(protect, getAllTours)
    .post(createTour);

export default router;

import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/me', protect, userController.getMe, userController.getUser);
router.patch('/update-me', protect, userController.updateMe);
router.delete('/delete-me', protect, userController.deleteMe);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

router
    .route('/')
    .get(protect, restrictTo('admin'), userController.getAllUsers)
    .post(userController.createUser);


export default router;

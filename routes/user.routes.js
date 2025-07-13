import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../controllers/auth.controller.js';

const router = express.Router();

router.patch('/update-me', protect, userController.updateMe);
router.delete('/delete-me', protect, userController.deleteMe);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);


export default router;

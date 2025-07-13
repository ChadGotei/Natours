import express from "express";
import { forgetPassword, login, protect, resetPassword, signup, updatePassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/update-password', protect, updatePassword);

export default router;
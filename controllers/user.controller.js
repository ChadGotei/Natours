import { User } from "../models/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { filterObj } from '../utils/helper.js';
import factory from '../controllers/handlerFactory.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: "success",
        total: users.length,
        data: {
            users
        }
    })
})

export const updateMe = catchAsync(async (req, res, next) => {
    // Error if user tries to update the error
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for password updation, please use '/udpate-password' for that", 400));
    }

    // Filtered the fields so that only selected fields 
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    // it would run the validators on the filterObj fields

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

export const deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    // means deleted, also we dont send anything with response 204
    res.status(204).json({
        status: "success",
        data: null
    })
})

export const deleteUser = factory.deleteOne(User);

export const getUser = factory.getOne(User);


// this is for the administrator
export const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

export const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

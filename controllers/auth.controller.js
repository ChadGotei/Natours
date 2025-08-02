import { User } from '../models/user.model.js';
import { promisify } from 'util';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import jwt from "jsonwebtoken";
import sendEmail from '../utils/email.js';
import crypto from "crypto";

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const days = Number(process.env.JWT_EXPIRES_IN);
    const cookieOptions = {
        expiresIn: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};

export const signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
})


export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    };

    // checking if email even exists
    const user = await User.findOne({ email }).select("+password");   // since we actually hid the password

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError("Invalid email or password", 401));
    }

    user.password = undefined;
    createSendToken(user, 200, res);
})

//* Protected route
export const protect = catchAsync(async (req, res, next) => {
    // 1) Check the token
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }

    // console.log("Bearer token: ", token);

    if (!token) {
        return next(new AppError("You are not logged in please login to get access", 401));
    }

    // 2) Verification of the token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // apne aap catch se ho gyi verification

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user belonging to this user does no longer exists", 401));
    }

    // 4) Check if user changed password after the jwt token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed the password, please login again", 401));
    }

    req.user = currentUser;
    next();
})


//? Restrict the routes based on their roles
export const restrictTo = (...roles) => {
    // roles is an array, ['admin', 'user'] etc
    return (req, _, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permissions to perform this action", 403));
        }

        next();
    }
}


export const forgetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on their Posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("Please provide a valid email", 404));
    }

    // 2) Generate a random reset password
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // await user.save() :  we need to stop this or we will have to pass all the required fields with our req.body

    // 3) Send that resettoken to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Your password is only valid for 10 minutes`,
            message
        })

        res.status(200).json({
            status: "Success",
            message: "Token sent to the email successfully!",
        })
    } catch (error) {
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;

        await user.save({ validateBeforeSave: false });
        console.error(error);
        return next(new AppError("There was an error while sending the email, try again later", 500));
    }
})


export const resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get the user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    // console.log(user);

    // 2) If token has not expired, there is user, set the new password
    if (!user) {
        return next(new AppError("Token is invalid or has expired", 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) update changePasswrodAt property
    // done from mongodb document middleware

    // 4) log the user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        message: "Password changed successfully!",
        token,
        userId: user._id,
    })
});


export const updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.user.email }).select("+password");

    // 2) Check if POSTed password is correct
    const isEnteredPasswordCorrect = await user.checkPassword(req.body.oldPassword, user.password);
    if (!isEnteredPasswordCorrect) return next(new AppError("Invalid old password, please try again", 400));

    // 3) If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
})
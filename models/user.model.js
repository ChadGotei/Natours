import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
      minlength: [3, "Name must include at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is a required field"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must have at least 8 characters"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      minlength: [8, "Password must have at least 8 characters"],
      validate: {
        // this is only gonna work on SAVE!!
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords do not match",
      },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
      // this select == whether we should include this field in our database query or not.
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});


userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
})

userSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  // JWT Time Stamp: time the user generated the jwt token ig?
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimeStamp < changedTimestamp;
  }

  //? False means not changed ie jwt is valid
  return false;
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // hashed the random password
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;  // 10 minutes

  // but have to send the normal version to the email, hashed only to store in db
  return resetToken;
}

export const User = mongoose.model("User", userSchema);

import mongoose from "mongoose"

// review / rating / createdAt / ref to the Tour this review belongs to / ref to the user who wrote it

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review cannot be empty"],
        trim: true
    },
    rating: {
        type: Number,
        min: [1, "At least 1 star is required"],
        max: [5, "You cannot give more than 5 stars"],
        required: true,
    },
    tourId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a tour."]
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must have a writer."]
    }
},
    {
        timestamps: {
            createdAt: true
        },
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'userId',
        select: '-__v -updatedAt'
    });

    next();
})

export const Review = mongoose.model("Review", reviewSchema);
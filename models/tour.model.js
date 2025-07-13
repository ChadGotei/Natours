import mongoose from "mongoose";
import slugify from "slugify";

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have at most 40 characters'],
        minlength: [10, 'A tour name must have at least 10 characters'], 
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have some duration defined']
    },
    maxGroupSize: {
        type: Number,
        default: 10,
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Diffculty can be either \'easy\', \'medium\' or \'diffcult\''
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Ratings must be above or equal to 1'],
        max: [5, 'Ratings can\'t be greater than 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0        // no of reviews this tour has recived
    },
    price: {
        type: Number,
        required: [true, 'Tour must have price specified'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this 'this' keyword is only going to point to the current document when we are 'creating' one, it won't work for updating.
                return val < this.price;
            },
            message: `Discount price ({VALUE}) should be below the regular price`
        }

    },

    summary: {
        type: String,
        trim: true,
        required: [true, 'Summary is must have']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "Tour must have a cover image"]
    },
    images: [String],
    secretTour: {
        type: Boolean,
        default: false
    },
    startDates: [String]
    //? startDate: different dates a particular tour starts, instances of the tour starting at the different types
},
    {
        timestamps: true,
        toJSON: { virtuals: true },  // to display the virtuals in the response
        toObject: { virtuals: true }
    }
);

//! MONGOOSE MIDDLEWARES

// arrow fucntion doesnt return 'this' pointer thats why we used function
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// tourSchema.virtual('discountedPrice').get(function() {
//     return this.price - (this.priceDiscount ?? 0);
// })

//? Document middlewares
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//? Query Middlewares
tourSchema.pre(/^find/, function (next) {
    // to hide the documents that have their secret tour property set to 'true'
    this.find({ secretTour: { $ne: true } });

    this.start = new Date();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    // the docs here is used to access the current document
    console.log(`Query took ${new Date() - this.start} milliseconds!`);
    next();
});


//? Aggregation Middlewares
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

    console.log(this.pipeline());
    next();
});

export const Tour = mongoose.model("Tour", tourSchema);
import { Tour } from "../models/tour.model.js";
import { APIfeatures } from "../utils/APIfeatures.js";
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getAllTours = catchAsync(async (req, res, next) => {
    //? Adding api features meow
    const features = new APIfeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;

    //? Sending response
    return res.status(200).json(
        {
            message: "working",
            status: 200,
            size: tours.length,
            data: {
                tours
            }
        }
    )
});

export const getTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findById(id);

    if (!tour) {
        return next(new AppError(`No tour found with that ID`, 404));
    };

    return res.status(200).json(tour);
});

export const aliasTopTour = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

export const createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
})

export const updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
});

export const deleteTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id).select("name duration imageCover summary");

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    console.log(`Tour named ${tour.name} deleted successfully!`);
    return res.status(200).json({
        status: "Success",
        deleted_tour: {
            tour
        }
    });
});


export const getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: {
                    $gte: 4.5
                }
            }
        },
        {
            // allows us to group documents together using accumulaters
            $group: {
                _id: { $toUpper: '$difficulty' },  // what we want to group by
                // _id: null,
                num: { $sum: 1 },  // 1 for each document, 
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        },
        // { $match: { _id: { $ne: 'EASY' } } }   
    ]);

    return res.status(200).json({
        status: "Sucess",
        stats
    })
})


export const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $addFields: {
                parsedDate: {
                    $dateFromString: {
                        dateString: "$startDates",
                        format: "%Y-%m-%d,%H:%M"
                    }
                }
            }
        },
        {
            $match: {
                parsedDate: {
                    $gte: new Date(`${year}-01-01T00:00:00Z`),
                    $lte: new Date(`${year}-12-31T23:59:59Z`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$parsedDate' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    return res.status(200).json({
        status: "Success",
        total: plan.length,
        data: {
            plan
        }
    });
})
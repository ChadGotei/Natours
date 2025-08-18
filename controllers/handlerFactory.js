import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const deleteOne = Model => catchAsync(async (req, res, next) => {
    // giving it a generic name
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError("No document found with this ID", 404));
    }

    return res.status(204).json({
        status: 'success',
        data: null,
    })
});

const updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError("There is no doc with this ID", 404));
    }

    return res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
});

const createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
})

const getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    // popOptions: populate options
    let query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if(!doc) {
        return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
})

// const getAll = (Model, ) => {

// }

export default {
    deleteOne,
    updateOne,
    createOne,
    getOne
}
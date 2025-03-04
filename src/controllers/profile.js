const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, bio, specialties } = req.body;

        // Fields to update
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (bio) fieldsToUpdate.bio = bio;
        if (specialties) fieldsToUpdate.specialties = specialties;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get counselor profiles
// @route   GET /api/profile/counselors
// @access  Public
exports.getCounselors = async (req, res, next) => {
    try {
        const counselors = await User.find({ role: 'counselor' })
            .select('-email');

        res.status(200).json({
            success: true,
            count: counselors.length,
            data: counselors
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single counselor profile
// @route   GET /api/profile/counselors/:id
// @access  Public
exports.getCounselor = async (req, res, next) => {
    try {
        const counselor = await User.findOne({
            _id: req.params.id,
            role: 'counselor'
        }).select('-email');

        if (!counselor) {
            return res.status(404).json({
                success: false,
                message: 'Counselor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: counselor
        });
    } catch (err) {
        next(err);
    }
};
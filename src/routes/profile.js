const express = require('express');
const {
    getProfile,
    updateProfile,
    getCounselors,
    getCounselor
} = require('../controllers/profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/counselors', getCounselors);
router.get('/counselors/:id', getCounselor);

module.exports = router;
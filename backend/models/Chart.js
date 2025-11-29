const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name for this chart']
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    timeOfBirth: {
        type: String,
        required: true
    },
    placeOfBirth: {
        city: String,
        lat: Number,
        lng: Number
    },
    chartData: {
        type: Object, // Stores the calculated planetary positions
        required: true
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chart', chartSchema);

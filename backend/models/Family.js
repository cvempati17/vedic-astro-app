const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    members: [{
        chartId: {
            type: String, // Changed from ObjectId to support Local Charts
            required: true
        },
        relation: {
            type: String,
            required: true
        },
        role: {
            type: String // Optional: 'Father', 'Mother', 'Child', etc.
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Family', familySchema);

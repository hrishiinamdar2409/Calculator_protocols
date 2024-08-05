const mongoose = require('mongoose');

const CalculatorLogSchema = new mongoose.Schema({
    expression: {
        type: String,
        required: true
    },
    is_valid: {
        type: Boolean,
        required: true
    },
    output: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    created_on: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CalculatorLog', CalculatorLogSchema);

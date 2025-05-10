const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Load the Currency type from mongoose-currency
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

// Define the promotion schema
const promotionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create the model
const Promotion = mongoose.model('Promotion', promotionSchema);

// Export the model
module.exports = Promotion;

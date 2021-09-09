const mongoose = require('mongoose');
let Schema = require('mongoose').Schema;

const currencies = new mongoose.Schema({
    countryId: { type: Schema.Types.ObjectId, ref: 'countries', required: true },
    currency: { type: String },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Currencies = mongoose.model('currencies', currencies);
module.exports = {
    Currencies
}
const mongoose = require('mongoose');

const countries = new mongoose.Schema({
    countryName: { type: String },
    countryCode: { type: String },
    phoneCode: { type: String },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Countries = mongoose.model('countries', countries);
module.exports = {
    Countries
}
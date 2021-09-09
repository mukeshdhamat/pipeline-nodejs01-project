const mongoose = require('mongoose');
let Schema = require('mongoose').Schema;

const columnSettingsSchema = new mongoose.Schema({
    key: { type: String },
    columns: [{ key: { type: String }, status: { type: Boolean } }],
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    latestColumns: { type: Array }
}, {
    timestamps: true
});
let ColumnSettings = mongoose.model('columnSettings', columnSettingsSchema);

const templateSettings = new mongoose.Schema({
    key: { type: String },
    description: { type: String },
    color: { type: String },
    columns: [{ key: { type: String }, status: { type: Boolean } }],
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, {
    timestamps: true
});
let TemplateSettings = mongoose.model('templatesettings', templateSettings);


const filterSettingsSchema = new mongoose.Schema({
    key: { type: String },
    description: { type: String },
    color: { type: String },
    filter: { type: Array },
    condition: { type: String },
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, {
    timestamps: true
});

let FilterSettings = mongoose.model('filterSettings', filterSettingsSchema);

module.exports = {
    ColumnSettings,
    FilterSettings,
    TemplateSettings
}
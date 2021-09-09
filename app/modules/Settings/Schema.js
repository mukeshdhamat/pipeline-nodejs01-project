const mongoose = require('mongoose');
let Schema = require('mongoose').Schema;

const emailSettingsSchema = new mongoose.Schema({
    emailTemplateId: { type: Schema.Types.ObjectId, ref: 'emailTemplate', unique: true },
    fromEmail: { type: String },
    adminEmail: { type: String }
}, {
    timestamps: true
});

let EmailSettings = mongoose.model('emailSettings', emailSettingsSchema);

const settingsSchema = new mongoose.Schema({
    siteName: { type: String },
    siteFavicon: { type: String },
    siteLogoSmall: { type: String },
    siteLogoLarge: { type: String },
    onlineStatus: { type: Boolean, default: false },
    offlineMessage: { type: String },

    metaTitle: { type: String },
    metaKeyword: { type: String },
    metaDescription: { type: String },

    analyticsSnippet: { type: String },
    headerSnippet: { type: String },
    footerSnippet: { type: String },

    currency: { type: String },
    dateFormat: { type: String },
    timeZone: { type: String },

    defaultFromEmail: { type: String },
    defaultAdminEmail: { type: String },

    allCurrency: [{ code: { type: String, unique: true }, status: { type: Boolean, default: true } }],
    allDateFormat: [{ format: { type: String, unique: true }, status: { type: Boolean, default: true } }],

    smtp: { host: { type: String }, port: { type: Number }, username: { type: String }, password: { type: String } },
    sms: { accountSid: { type: String }, mobileNumber: { type: String }, authToken: { type: String } },

    socialMediaLinks: {
        fbUrl: { type: String },
        twitterUrl: { type: String },
        linkedInUrl: { type: String },
        instagramUrl: { type: String },
        pinterestUrl: { type: String },
    },

    socialMediaSDK: {
        facebook: { appId: { type: String } },
        google: { authToken: { type: String } }
    },

    stripe: {
        status: { type: Boolean, default: false },
        backendKey: { type: String },
        frontendKey: { type: String }
    },
    paypal: {
        status: { type: Boolean, default: false },
        mode: { type: String },
        clientId: { type: String },
        clientSecret: { type: String }
    }

}, {
    timestamps: true
});

let SettingsSchema = mongoose.model('settings', settingsSchema);

module.exports = {
    EmailSettings,
    SettingsSchema
}
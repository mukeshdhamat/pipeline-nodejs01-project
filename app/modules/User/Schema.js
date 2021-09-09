let mongoose = require('mongoose');
let schema = mongoose.Schema;
const _ = require("lodash");

let user = new schema({
    firstName: { type: String },
    lastName: { type: String },
    userName: { type: String },
    email: { type: String },
    status: { type: Boolean, default: true },
    photo: { type: String, required: false },
    company: { type: String, required: false },
    location: { type: String },
    //role: { type: String, default: 'user' },

    fbId: { type: String },
    googleId: { type: String },
    twitterId: { type: String },
    instagramId: { type: String },

    dob: { type: Date },
    country: { type: schema.Types.ObjectId, ref: 'countries' },
    mobileNumber: { type: String },
    gender: { type: String },
    address: { type: String },

    fbLink: { type: String },
    twitterLink: { type: String },
    instagramLink: { type: String },
    gitHubLink: { type: String },
    slack: { type: String },
    codePen: { type: String },

    website: { type: String },

    password: { type: Buffer },
    emailVerificationStatus: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    verificationToken: { type: String },
    verificationTokenCreationTime: { type: Date },
    forgotToken: { type: String },
    forgotTokenCreationTime: { type: Date },
    deviceToken: { type: String },
    device: { type: String },
    userRole: { type: String, enum: ['Customer', 'Agent'], default: 'Customer' },

    previouslyUsedPasswords: [{ type: Buffer }],
    passwordUpdatedAt: { type: Date },
    lastSeen: { type: Date },
    failedAttempts: [{ ip: { type: String }, attempts: { type: Number }, blockedDate: { type: Date }, isBlocked: { type: Boolean, default: false } }]
}, {
    timestamps: true
});


let Users = mongoose.model('Users', user);
module.exports = {
    Users,
}
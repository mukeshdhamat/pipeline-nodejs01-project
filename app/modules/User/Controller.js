const _ = require("lodash");
const i18n = require("i18n");
const Transaction = require('mongoose-transactions');

const Controller = require("../Base/Controller");
const Users = require('./Schema').Users;
const Email = require('../../services/Email');
const Model = require("../Base/Model");
const userProjection = require('../User/Projection')
const Globals = require("../../../configs/Globals");
const Config = require("../../../configs/configs");
const RequestBody = require("../../services/RequestBody");
const Authentication = require('../Authentication/Schema').Authtokens;
const CommonService = require("../../services/Common");
const Form = require("../../services/Form");
const File = require("../../services/File");

const exportLib = require('../../../lib/Exports');


class UsersController extends Controller {
    constructor() {
        super();
    }


    /********************************************************
   Purpose: user register
   Parameter:
      {
          "emailId":"john@doe.com",
          "password":"john",
          "mobile":"987654321",
          "firstName":"john",
          "lastName":"deo"
      }
   Return: JSON String
   ********************************************************/
    async register() {
        try {
            // check emailId is exist or not
            let filter = { "email": this.req.body.email.toLowerCase() }
            const user = await Users.findOne(filter);

            //if user exist give error
            if (!_.isEmpty(user) && (user.email)) {
                //return this.res.send({ status: 0, message: i18n.__("DUPLICATE_EMAIL_OR_userName") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'CONFLICT', message: exportLib.ResponseEn.DUPLICATE_EMAIL });
            } else {
                let data = this.req.body;
                let isPasswordValid = await (new CommonService()).validatePassword({ password: data['password'] });
                if (isPasswordValid && !isPasswordValid.status) {
                    //return this.res.send(isPasswordValid)
                    return exportLib.Error.handleError(this.res, { status: false, code: 'CONFLICT', message: isPasswordValid.message });
                }
                let password = await (new CommonService()).ecryptPassword({ password: data['password'] });

                data = {...data, password: password, role: 'user' };
                data['email'] = data['email'].toLowerCase();

                // save new user
                const newUserId = await new Model(Users).store(data);

                // if empty not save user details and give error message.
                if (_.isEmpty(newUserId)) {
                    return exportLib.Error.handleError(this.res, { status: false, code: 'CONFLICT', message: exportLib.ResponseEn.USER_NOT_SAVED });
                } else {
                    const token = await new Globals().generateToken(newUserId);

                    //sending mail to verify user
                    let emailData = {
                        emailId: data['email'],
                        emailKey: 'signup_mail',
                        replaceDataObj: { fullName: data.firstName + " " + data.lastName, verificationLink: "http://localhost:3000/?page=verifyEmail&token=" + token }
                    };
                    const sendingMail = await new Email().sendMail(emailData);
                    if (sendingMail && sendingMail.status == 0) {
                        //  transaction.rollback();
                        // return this.res.send(sendingMail);
                        return exportLib.Error.handleError(this.res, { status: false, code: 'CONFLICT', message: exportLib.ResponseEn.MAIL_NOT_SEND_SUCCESSFULLY });
                    } else if (sendingMail && !sendingMail.response) {
                        // transaction.rollback();
                        //return this.res.send({ status: 0, message: i18n.__('MAIL_NOT_SEND_SUCCESSFULLY') });
                        return exportLib.Error.handleError(this.res, { status: false, code: 'CONFLICT', message: exportLib.ResponseEn.MAIL_NOT_SEND_SUCCESSFULLY });

                    }
                    // transaction.update('User', newUserId, { verificationToken: token, verificationTokenCreationTime: new Date() });
                    await Users.findByIdAndUpdate(newUserId, { verificationToken: token, verificationTokenCreationTime: new Date() });
                    // await transaction.run();
                    //return this.res.send({ status: 1, message: i18n.__('REGISTRATION_SCUCCESS') });
                    return exportLib.Response.handleMessageResponse(this.res, { status: true, code: 'SUCCESS', message: exportLib.ResponseEn.REGISTRATION_SCUCCESS });

                }

            }
        } catch (error) {
            console.log(error, 'error in login')
            return exportLib.Error.handleError(this.res, { status: false, code: 'INTERNAL_SERVER_ERROR', message: error });
        }

    }

    /********************************************************
    Purpose: Forgot password mail
    Parameter:
        {
            "emailId":"john@doe.com"
        }
    Return: JSON String
   ********************************************************/
    async forgotPasswordMail() {
        try {
            let email = this.req.body.email;
            let user = await Users.findOne({ email: email });
            if (_.isEmpty(user)) {
                //return this.res.send({ status: 0, message: i18n.__("REGISTERED_EMAIL") })
                return exportLib.Error.handleError(this.res, { status: false, code: 'NOT_FOUND', message: exportLib.ResponseEn.REGISTERED_EMAIL });
            }
            let globalObj = new Globals();
            const token = await globalObj.generateToken(user._id);
            await Users.findByIdAndUpdate(user._id, { forgotToken: token, forgotTokenCreationTime: new Date() });

            let emailData = {
                emailId: email,
                emailKey: 'forgot_password_mail',
                replaceDataObj: { fullName: user.firstName + " " + user.lastName, resetPasswordLink: 'http://localhost:3000/?page=resetPassword' + '&token=' + token }
            };
            const sendingMail = await new Email().sendMail(emailData);
            if (sendingMail && sendingMail.status == 0) {
                //return _this.res.send(sendingMail);
                return exportLib.Error.handleError(this.res, { status: false, code: 'CONFLICT', message: exportLib.ResponseEn.MAIL_NOT_SEND_SUCCESSFULLY });
            }
            if (sendingMail && !sendingMail.response) {
                return this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
            }
            //return this.res.send({ status: 1, message: i18n.__("CHECK_EMAIL") });
            return exportLib.Response.handleMessageResponse(this.res, { status: true, code: 'SUCCESS', message: exportLib.ResponseEn.CHECK_EMAIL });

        } catch (error) {
            console.log(error, 'error in login')
            return exportLib.Error.handleError(this.res, { status: false, code: 'INTERNAL_SERVER_ERROR', message: error });
        }
    }

    /********************************************************
    Purpose: Reset password
    Parameter:
        {
            "password":"123456",
            "token": "errrrwqqqsssfdfvfgfdewwwww"
        }
    Return: JSON String
   ********************************************************/
    async resetPassword() {
        try {
            const decoded = await Globals.decodeUserForgotToken(this.req.body.token);
            if (!decoded) {
                //return this.res.send({ status: 0, message: i18n.__("LINK_EXPIRED") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'NOT_FOUND', message: exportLib.ResponseEn.LINK_EXPIRED });
            }

            let user = await Users.findOne({ forgotToken: this.req.body.token });
            if (_.isEmpty(user)) {
                //return this.res.send({ status: 0, message: i18n.__("INVALID_TOKEN") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'NOT_FOUND', message: exportLib.ResponseEn.INVALID_TOKEN });
            }

            let isPasswordValid = await (new CommonService()).validatePassword({ password: this.req.body.password });
            // console.log('isPasswordValid', isPasswordValid);
            if (isPasswordValid && !isPasswordValid.status) {
                //return this.res.send(isPasswordValid);
                return exportLib.Error.handleError(this.res, { status: false, code: 'CONFLICT', message: isPasswordValid.message });
            }
            let password = await (new CommonService()).ecryptPassword({ password: this.req.body.password });

            const updateUser = await Users.findByIdAndUpdate(user._id, { password: password, emailVerificationStatus: true }, { new: true });
            if (_.isEmpty(updateUser)) {
                //return this.res.send({ status: 0, message: i18n.__("PASSWORD_NOT_UPDATED") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'NOT_FOUND', message: exportLib.ResponseEn.PASSWORD_NOT_UPDATED });
            }
            // await Users.findByIdAndUpdate(user._id, { forgotToken: "", forgotTokenCreationTime: "" });
            //return this.res.send({ status: 1, message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY") });
            return exportLib.Response.handleMessageResponse(this.res, { status: true, code: 'SUCCESS', message: exportLib.ResponseEn.PASSWORD_UPDATED_SUCCESSFULLY });
        } catch (error) {
            console.log(error, 'error in login')
            return exportLib.Error.handleError(this.res, { status: false, code: 'INTERNAL_SERVER_ERROR', message: error });
        }
    }

    /********************************************************
    Purpose: Login
    Parameter:
        {
            "emailId":"john@doe.com"
            "password":"123456",
            "deviceToken": "errrrwqqqsssfdfvfgfdewwwww",
            "device": "ios"
        }
    Return: JSON String
   ********************************************************/
    async login() {
        try {
            let fieldsArray = ["email", "password"];
            let emptyFields = await (new RequestBody()).checkEmptyWithFields(this.req.body, fieldsArray);
            if (emptyFields && Array.isArray(emptyFields) && emptyFields.length) {
                //return this.res.send({ status: 0, message: i18n.__('SEND_PROPER_DATA') + " " + emptyFields.toString() + " fields required." });
                return exportLib.Error.handleError(this.res, { status: false, code: 'UNPROCESSABLE_ENTITY', message: exportLib.ResponseEn.SEND_PROPER_DATA + " " + emptyFields.toString() + " fields required." });
            }

            const user = await Users.findOne({ email: this.req.body.email.toString().toLowerCase(), isDeleted: false });

            if (_.isEmpty(user)) {
                //return this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST_OR_DELETED") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'NOT_FOUND', message: exportLib.ResponseEn.USER_NOT_EXIST_OR_DELETED });
            } else if (!user.emailVerificationStatus) {
                //return this.res.send({ status: 0, message: i18n.__("VERIFY_EMAIL") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'UNAUTHORIZED', message: exportLib.ResponseEn.VERIFY_EMAIL });
            } else if (!user.password) {
                // return this.res.send({ status: 0, message: i18n.__("SET_PASSWORD") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'NOT_ACCEPTABLE', message: exportLib.ResponseEn.SET_PASSWORD });
            }


            const status = await (new CommonService()).verifyPassword({ password: this.req.body.password, savedPassword: user.password });
            if (!status) {
                //return this.res.send({ status: 0, message: i18n.__("INVALID_PASSWORD") });
                return exportLib.Error.handleError(this.res, { status: false, code: 'NOT_ACCEPTABLE', message: exportLib.ResponseEn.INVALID_PASSWORD });
            }


            let updatedUser = await Users.findOne({}).select(userProjection.user);

            let token = await new Globals().getToken({ id: user._id });
            //return this.res.send({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, data: updatedUser });
            return exportLib.Response.handleResponse(this.res, { status: true, code: 'OK', message: exportLib.ResponseEn.LOGIN_SUCCESS, data: updatedUser }, token);

        } catch (error) {
            console.log(error, 'error in login')
            return exportLib.Error.handleError(this.res, { status: false, code: 'INTERNAL_SERVER_ERROR', message: error });
        }
    }

    /********************************************************
    Purpose: Change Password
    Parameter:
        {
            "oldPassword":"password",
            "newPassword":"newPassword"
        }
    Return: JSON String
   ********************************************************/
    async changePassword() {
        try {
            const user = this.req.currentUser;
            if (user.password == undefined) {
                return this.res.send({ status: 0, message: i18n.__('CANNOT_CHANGE_PASSWORD') });
            }
            let passwordObj = {
                oldPassword: this.req.body.oldPassword,
                newPassword: this.req.body.newPassword,
                savedPassword: user.password
            };
            let password = await (new CommonService()).changePasswordValidation({ passwordObj });
            if (typeof password.status !== 'undefined' && password.status == 0) {
                return this.res.send(password);
            }

            let updateData = { password: password, passwordUpdatedAt: new Date() };
            if (Config.storePreviouslyUsedPasswords && Config.storePreviouslyUsedPasswords == 'true') {
                updateData = { password: password, $push: { previouslyUsedPasswords: user.password }, passwordUpdatedAt: new Date() };
            }

            const updatedUser = await Users.findByIdAndUpdate(user._id, updateData, { new: true });
            return !updatedUser ? this.res.send({ status: 0, message: i18n.__("PASSWORD_NOT_UPDATED") }) : this.res.send({ status: 1, data: {}, message: i18n.__("PASSWORD_UPDATED_SUCCESSFULLY") });

        } catch (error) {
            console.log("error- ", error);
            return this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
    Purpose: Edit profile
    Parameter:
        {
            "firstName": "firstName",
            "lastName": "lastName",
            "userName": "userName",
            "photo": "photo"
        }
    Return: JSON String
   ********************************************************/
    async editUserProfile() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
            let fieldsArray = ["firstName", "lastName", "mobileNumber", "location", "dob"];
            let data = await (new RequestBody()).processRequestBody(this.req.body, fieldsArray);
            // if (data.photo) {
            //     data.photo = _.last(data.photo.split("/"));
            // }

            const updatedUser = await Users.findByIdAndUpdate(currentUser, data, { new: true }).select(userProjection.user);
            return this.res.send({ status: 1, message: i18n.__("USER_UPDATED_SUCCESSFULLY"), data: updatedUser });
        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
        }
    }

    /********************************************************
     Purpose: user details
     Parameter:
     {
        "uid": "5ad5d198f657ca54cfe39ba0"
     }
     Return: JSON String
     ********************************************************/
    async userProfile() {
        try {
            const currentUser = this.req.currentUser && this.req.currentUser._id ? this.req.currentUser._id : "";
            let user = await Users.findOne({ _id: currentUser }, userProjection.user);
            return _.isEmpty(user) ? this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") }) : this.res.send({ status: 1, data: user });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: verified user
     Parameter:
     {
        token:""
     }
     Return: JSON String
     ********************************************************/
    async verifyUser() {
        let _this = this;
        try {
            let user = await Users.findOne({ verificationToken: _this.req.query.token });
            console.log(user, 'user')
            if (_.isEmpty(user)) {
                return _this.res.send({ status: 0, message: i18n.__("INVALID_TOKEN") });
            }

            const decoded = await Globals.decodeUserVerificationToken(this.req.query.token);
            if (!decoded) {
                return _this.res.send({ status: 0, message: i18n.__("LINK_EXPIRED") });
            }

            const updateUser = await Users.findByIdAndUpdate(user._id, { emailVerificationStatus: true }, { new: true });
            if (_.isEmpty(updateUser)) {
                return _this.res.send({ status: 0, message: i18n.__("USER_NOT_UPDATED") });
            }
            return _this.res.send({ status: 1, message: i18n.__("USER_VERIFIED") });

        } catch (error) {
            console.log("error = ", error);
            return _this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
        }
    }

    /********************************************************
     Purpose: Logout User
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async logout() {
        try {
            const currentUser = this.req.currentUser ? this.req.currentUser : {};
            if (currentUser && currentUser._id) {
                let params = { token: null };
                let filter = { userId: currentUser._id };
                await Authentication.update(filter, { $set: params });
                this.res.send({ status: 1, message: i18n.__("LOGOUT_SUCCESS") });
            } else {
                return this.res.send({ status: 0, message: i18n.__("USER_NOT_EXIST") });
            }

        } catch (error) {
            console.log('error', error);
            this.res.send({ status: 0, message: error });
        }

    }

    /********************************************************
     Purpose: Refresh AccessToken
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    async refreshAccessToken() {
        try {
            if (!this.req.headers.refreshtoken) {
                return this.res.send({ status: 0, message: i18n.__("SEND_PROPER_DATA") });
            }
            let token = await (new Globals()).refreshAccessToken(this.req.headers.refreshtoken);
            return this.res.send(token);
        } catch (error) {
            console.log("error = ", error);
            this.res.send({ status: 0, message: i18n.__("SERVER_ERROR") });
        }
    }

    /********************************************************
    Purpose: Single File uploading
    Parameter:
    {
           "file":
    }
    Return: JSON String
    ********************************************************/
    async fileUpload() {
        try {
            let form = new Form(this.req);
            let formObject = await form.parse();
            if (_.isEmpty(formObject.files)) {
                return this.res.send({ status: 0, message: i18n.__("%s REQUIRED", 'File') });
            }
            const file = new File(formObject.files);
            let filePath = "";
            if (Config.s3upload && Config.s3upload == 'true') {
                filePath = file.uploadFileOnS3(formObject.files.file[0]);
            } else {
                let fileObject = await file.store();
                /***** uncommit this line to do manipulations in image like compression and resizing ****/
                // let fileObject = await file.saveImage();
                filePath = fileObject.filePath;
            }
            this.res.send({ status: 1, data: { filePath } });

        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
    Purpose: social Access (both signUp and signIn)
    Parameter:
        {
            "socialId":"12343434234",
            "socialKey":"fbId"
            "mobile":"987654321",
            "emailId":"john@grr.la"
            "firstName":"john",
            "lastName":"deo",
            "userName":"john123",
            "device":" ",
            "deviceToken":" "
        }
    Return: JSON String
    ********************************************************/
    async socialAccess() {
        let _this = this;
        try {
            /***** storing every details coming from request body ********/
            let details = _this.req.body;
            let socialKey = details.socialKey

            /****** dynamic socialKey (socialKey may be fbId, googleId, twitterId, instagramId) ********/
            details[socialKey] = details.socialId

            /***** checking whether we are getting proper socialKey or not ******/
            let checkingSocialKey = _.includes(['fbId', 'googleId', 'twitterId', 'instagramId'], details.socialKey);
            if (!checkingSocialKey) {
                return _this.res.send({ status: 0, message: i18n.__("PROPER_SOCIALKEY") })
            }
            /****** query for checking socialId is existing or not *********/
            let filter = {
                [socialKey]: _this.req.body.socialId
            }

            /**** checking user is existing or not *******/
            let user = await Users.findOne(filter, userProjection.user);

            /**** if user not exists with socialId *****/
            if (_.isEmpty(user)) {

                if (_this.req.body.emailId) {
                    /******** checking whether user is already exists with emailId or not *******/
                    let userDetails = await Users.findOne({ emailId: _this.req.body.emailId }, userProjection.user);

                    /****** If user not exists with above emailId *******/
                    if (_.isEmpty(userDetails)) {
                        /******** This is the signUp process for socialAccess with emailId *****/
                        let newUser = await this.createSocialUser(details);
                        return _this.res.send(newUser)
                    } else {
                        /**** social access code *****/
                        let updatedUser = await this.checkingSocialIdAndUpdate(userDetails, details);
                        return _this.res.send(updatedUser)
                    }
                } else {
                    /******** This is the signUp process for socialAccess without emailId *****/
                    let newUser = await this.createSocialUser(details);
                    return _this.res.send(newUser)
                }
            }
            /****** if user exists with socialId ******/
            else {
                if (_this.req.body.emailId) {
                    /******** to check whether is already exists with emailId or not *******/
                    let userDetails = await Users.findOne({ emailId: _this.req.body.emailId });
                    /****** If user not exists with above emailId *******/

                    if (_.isEmpty(userDetails)) {
                        /****** updating details in existing user with socialId details *****/
                        let updatedUser = await this.updateSocialUserDetails(details);
                        return _this.res.send(updatedUser)
                    } else {
                        /**** social access code *****/
                        let updatedUser = await this.checkingSocialIdAndUpdate(userDetails, details);
                        return _this.res.send(updatedUser)
                    }
                } else {
                    /****** updating details in existing user with emailId details ********/
                    let updatedUser = await this.updateSocialUserDetails(details);
                    return _this.res.send(updatedUser)
                }
            }
        } catch (error) {
            console.log(error)
            _this.res.send({ status: 0, message: error });
        }
    }

    /******** Create Users through socialIds ******/
    createSocialUser(details) {
        return new Promise(async(resolve, reject) => {
            try {
                let newUser = await new Model(Users).store(details);
                if (Config.useRefreshToken && Config.useRefreshToken == 'true') {
                    let { token, refreshToken } = await new Globals().getTokenWithRefreshToken({ id: newUser._id });
                    resolve({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, refreshToken: refreshToken, data: newUser });
                } else {
                    let token = await new Globals().getToken({ id: newUser._id });
                    resolve({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, data: newUser });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /******** Create Users through socialIds ******/
    updateSocialUserDetails(details) {
        return new Promise(async(resolve, reject) => {
            try {
                let updatedUser = await Users.findOneAndUpdate({
                    [details.socialKey]: details.socialId
                }, details, { upsert: true, new: true }).select(userProjection.user);
                if (Config.useRefreshToken && Config.useRefreshToken == 'true') {
                    let { token, refreshToken } = await new Globals().getTokenWithRefreshToken({ id: updatedUser._id });
                    resolve({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, refreshToken: refreshToken, data: updatedUser });
                } else {
                    let token = await new Globals().getToken({ id: updatedUser._id });
                    resolve({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, data: updatedUser });
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /******** Create Users through socialIds ******/
    checkingSocialIdAndUpdate(userDetails, details) {
        return new Promise(async(resolve, reject) => {
            try {
                if (userDetails[details.socialKey] && userDetails[details.socialKey] !== details.socialId) {
                    resolve({ status: 0, message: i18n.__("LINK_WITH_ANOTHER_SOCIAL_ACCOUNT") });
                }
                /****** updating details in existing user with emailId details ********/
                let updatedUser = await Users.findOneAndUpdate({ emailId: details.emailId }, details, { upsert: true, new: true }).select(userProjection.user);
                if (Config.useRefreshToken && Config.useRefreshToken == 'true') {
                    let { token, refreshToken } = await new Globals().getTokenWithRefreshToken({ id: updatedUser._id });
                    resolve({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, refreshToken: refreshToken, data: updatedUser });
                } else {
                    let token = await new Globals().getToken({ id: updatedUser._id });
                    resolve({ status: 1, message: i18n.__("LOGIN_SUCCESS"), access_token: token, data: updatedUser });
                };
            } catch (error) {
                reject(error);
            }
        });
    }

}
module.exports = UsersController;
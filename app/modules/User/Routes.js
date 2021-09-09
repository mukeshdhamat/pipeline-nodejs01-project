
module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const UsersController = require('../User/Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/users/register', Validators.userSignupValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.register();
    });

    router.post('/users/forgotPassword', Validators.emailValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.forgotPasswordMail();
    });

    router.post('/users/resetPassword', Validators.resetPasswordValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.resetPassword();
    });

    router.post('/users/login', Validators.loginValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.login();
    });

    router.post('/users/changePassword', Globals.isAuthorised, Validators.changePasswordValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.changePassword();
    });

    router.post('/users/updateUserProfile', Globals.isAuthorised, Validators.updateUserValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.editUserProfile();
    });

    router.get('/users/profile', Globals.isAuthorised, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.userProfile();
    });

    router.get('/users/verifyUser', Validators.verifyUserValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.verifyUser();
    });
    router.get('/users/logout', Globals.isAuthorised, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.logout();
    });
    router.get('/users/refreshAccessToken', Globals.isValid, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.refreshAccessToken();
    });
    router.post('/users/fileUpload', Globals.isAuthorised, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.fileUpload();
    });

    router.post('/users/socialAccess', Validators.socialAccessValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UsersController()).boot(req, res);
        return userObj.socialAccess();
    });

    app.use(config.baseApiUrl, router);
}
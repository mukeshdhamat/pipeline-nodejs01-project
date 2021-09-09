
module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const UserManagementController = require('../UserManagement/Controller');
    const config = require('../../../configs/configs');
    const Users = require('../User/Schema').Users;
    const CommonService = require("../../services/Common");
    const Validators = require("./Validator");

    let obj = { columnKey: "userListing", key: "userListing", model: Users };

    router.get('/user/userProfile/:userId', Globals.isAdminAuthorised(['user_view_list']), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        req.model = obj.model;
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.userProfile();
    });

    router.post('/user/deleteUsers', Globals.isAdminAuthorised(['user_delete']), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.deleteUsers();
    });

    router.post('/user/changeStatus', Globals.isAdminAuthorised(['user_status_update']), Validators.statusValidator({ key: 'userIds' }), Validators.validate, (req, res, next) => {
        req.body = { ...req.body, ...obj };
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.changeStatus();
    });

    router.post('/user/userListing', Globals.isAdminAuthorised(['user_view_list']), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.userListing();
    });

    router.post('/downloadUserFile', Globals.isAdminAuthorised(), Validators.downloadValidator({ key: 'userIds' }), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.downloadUserFile();
    });

    router.post('/user/addUserByAdmin', Globals.isAdminAuthorised(), Validators.addUserByAdmin(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.addUserByAdmin();
    });


    /****** common api's *******/
    router.post('/saveColumnSettings', Globals.isAdminAuthorised(), Validators.saveColumnValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.saveColumnSettings();
    });

    router.post('/saveTemplateSettings', Globals.isAdminAuthorised(), Validators.saveTemplateValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.saveTemplateSettings();
    });

    router.get('/getTemplateSettings/:key', Globals.isAdminAuthorised(), Validators.keyValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.getTemplateSettings();
    });

    router.delete('/deleteTemplateSettings/:templateId', Globals.isAdminAuthorised(), Validators.templateIdValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.deleteTemplateSettings();
    });

    router.post('/saveFilter', Globals.isAdminAuthorised(), Validators.saveFilterValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.saveFilter();
    });

    router.delete('/deleteFilter/:filterId', Globals.isAdminAuthorised(), Validators.filterIdValidator(), Validators.validate, (req, res, next) => {
        const userObj = (new UserManagementController()).boot(req, res);
        return userObj.deleteFilter();
    });

    app.use(config.baseApiUrl, router);
}
module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const Controller = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addEmailSettings', Globals.isAdminAuthorised(['email_settings_create', 'email_settings_edit']), Validators.emailSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addEmailSettings();
    });
    router.post('/addDefaultEmailSettings', Globals.isAdminAuthorised(['email_settings_edit_default_settings']), Validators.defaultEmailSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addDefaultEmailSettings();
    });
    router.post('/addGlobalSettings', Globals.isAdminAuthorised(), Validators.globalsSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addGlobalSettings();
    });

    router.post('/addAllCurrency', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addAllCurrency();
    });
    router.get('/getCurrency', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getCurrency();
    });
    router.post('/addAllDateFormat', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addAllDateFormat();
    });
    router.post('/changeCurrencyStatus', Validators.changeStatusValidator(), Validators.validate, Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.changeCurrencyStatus();
    });
    router.post('/changeDateFormatStatus', Validators.changeStatusValidator(), Validators.validate, Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.changeDateFormatStatus();
    });
    router.get('/getDateFormat', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getDateFormat();
    });
    router.get('/getEmailSettings', Globals.isAdminAuthorised(['email_settings_view_list']), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getEmailSettings();
    });

    router.post('/addSMTPAndSMSSettings', Globals.isAdminAuthorised(), Validators.smtpAndsmsSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addSMTPAndSMSSettings();
    });

    router.get('/getSMTPAndSMSSettings', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getSMTPAndSMSSettings();
    });

    router.post('/addSocialMediaLinks', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addSocialMediaLinks();
    });

    router.get('/getSocialMediaLinks', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getSocialMediaLinks();
    });

    router.post('/addSocialMediaSDK', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addSocialMediaSDK();
    });

    router.get('/getSocialMediaSDK', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getSocialMediaSDK();
    });

    router.post('/addPaymentDetails', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.addPaymentDetails();
    });

    router.get('/getPaymentDetails', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getPaymentDetails();
    });

    router.get('/getGlobalSettings', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getGlobalSettings();
    });
    router.get('/getEmailTitle', Globals.isAdminAuthorised(), (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.getEmailTitle();
    });
    router.delete('/deleteEmailSetting/:settingsId', Globals.isAdminAuthorised(['email_settings_delete']), Validators.deleteEmailSettingsValidator(), Validators.validate, (req, res, next) => {
        const emjObj = (new Controller()).boot(req, res);
        return emjObj.deleteEmailSetting();
    });


    app.use(config.baseApiUrl, router);
}
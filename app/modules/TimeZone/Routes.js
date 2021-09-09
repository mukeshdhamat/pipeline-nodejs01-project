module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const TimeZoneController = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addUpdateTimezone', Globals.isAdminAuthorised(), Validators.timezoneValidator(), Validators.validate, (req, res, next) => {
        const timezoneObj = (new TimeZoneController()).boot(req, res, next);
        return timezoneObj.addUpdateTimezone();
    });

    router.get('/getTimezoneDetails/:timezoneId', Globals.isAdminAuthorised(), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const timezoneObj = (new TimeZoneController()).boot(req, res, next);
        return timezoneObj.getTimezoneDetails();
    });


    router.post('/timezoneListing', Globals.isAdminAuthorised(), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const timezoneObj = (new TimeZoneController()).boot(req, res, next);
        return timezoneObj.timezoneListing();
    });

    router.post('/changeTimezoneStatus', Globals.isAdminAuthorised(), Validators.statusValidator({ key: 'timezoneIds' }), Validators.validate, (req, res, next) => {
        const timezoneObj = (new TimeZoneController()).boot(req, res);
        return timezoneObj.changeTimezoneStatus();
    });

    router.post('/deleteTimezones', Globals.isAdminAuthorised(), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const timezoneObj = (new TimeZoneController()).boot(req, res, next);
        return timezoneObj.deleteTimezones();
    });


    app.use(config.baseApiUrl, router);
}
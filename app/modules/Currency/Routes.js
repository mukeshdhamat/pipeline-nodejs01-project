module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const CurrencyController = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addUpdateCurrency', Globals.isAdminAuthorised(), Validators.currencyValidator(), Validators.validate, (req, res, next) => {
        const currencyObj = (new CurrencyController()).boot(req, res, next);
        return currencyObj.addUpdateCurrency();
    });

    router.get('/getCurrencyDetails/:currencyId', Globals.isAdminAuthorised(), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const currencyObj = (new CurrencyController()).boot(req, res, next);
        return currencyObj.getCurrencyDetails();
    });


    router.post('/currenciesListing', Globals.isAdminAuthorised(), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const currencyObj = (new CurrencyController()).boot(req, res, next);
        return currencyObj.currenciesListing();
    });

    router.post('/changeCurrenciesStatus', Globals.isAdminAuthorised(), Validators.statusValidator({ key: 'currenciesIds' }), Validators.validate, (req, res, next) => {
        const currencyObj = (new CurrencyController()).boot(req, res);
        return currencyObj.changeCurrenciesStatus();
    });

    router.post('/deleteCurrencies', Globals.isAdminAuthorised(), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const currencyObj = (new CurrencyController()).boot(req, res, next);
        return currencyObj.deleteCurrencies();
    });


    app.use(config.baseApiUrl, router);
}
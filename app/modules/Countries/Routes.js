module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const CountriesController = require('./Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addUpdateCountry', Globals.isAdminAuthorised(), Validators.countryValidator(), Validators.validate, (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res, next);
        return countryObj.addUpdateCountry();
    });

    router.get('/getCountryDetails/:countryId', Globals.isAdminAuthorised(), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res, next);
        return countryObj.getCountryDetails();
    });


    router.post('/countriesListing', Globals.isAdminAuthorised(), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res, next);
        return countryObj.countriesListing();
    });

    router.post('/changeCountriesStatus', Globals.isAdminAuthorised(), Validators.statusValidator({ key: 'countriesIds' }), Validators.validate, (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res);
        return countryObj.changeCountriesStatus();
    });

    router.post('/deleteCountries', Globals.isAdminAuthorised(), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res, next);
        return countryObj.deleteCountries();
    });

    router.post('/getCountriesList', Globals.isAdminAuthorised(), (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res, next);
        return countryObj.getCountriesList();
    });

    router.get('/downloadSampleCsvForCountries', Globals.isAdminAuthorised(), (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res, next);
        return countryObj.downloadSampleCsvForCountries();
    });

    router.post('/bulkUpload', Globals.isAdminAuthorised(), (req, res, next) => {
        const countryObj = (new CountriesController()).boot(req, res, next);
        return countryObj.bulkUpload();
    });



    app.use(config.baseApiUrl, router);
}
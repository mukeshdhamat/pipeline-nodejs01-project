module.exports = (app, express) => {

    const router = express.Router();

    const Globals = require("../../../configs/Globals");
    const CmsController = require('../Cms/Controller');
    const config = require('../../../configs/configs');
    const Validators = require("./Validator");

    router.post('/addUpdateCMS', Globals.isAdminAuthorised(['cms_pages_edit', 'cms_pages_create']), Validators.cmsValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.addUpdateCMS();
    });

    router.post('/cmsDelete', Globals.isAdminAuthorised(['cms_pages_delete']), Validators.deleteValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.deleteCMS();
    });

    router.post('/cmsList', Globals.isAdminAuthorised(['cms_pages_view_list']), Validators.listingValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.listCms();
    });

    router.get('/cmsDetail/:cmsId', Globals.isAdminAuthorised(['cms_pages_view_list']), Validators.detailValidator(), Validators.validate, (req, res, next) => {
        const cmsObj = (new CmsController()).boot(req, res);
        return cmsObj.detailCms();
    });

    app.use(config.baseApiUrl, router);
}
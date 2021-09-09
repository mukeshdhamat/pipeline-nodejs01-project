/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');

class Validators {

    /********************************************************
     Purpose:Function for email settings validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static emailSettingsValidator() {
        try {
            return [
                check('emailTemplateId').isAlphanumeric().withMessage(i18n.__("%s VALID", 'emailTemplateId')),
                check('fromEmail').isEmail().withMessage(i18n.__("VALID_EMAIL"))
                // check('adminEmail').isEmail().withMessage(i18n.__("VALID_EMAIL"))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for delete email settings validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static deleteEmailSettingsValidator() {
        try {
            return [
                param('settingsId').exists().withMessage(i18n.__("%s REQUIRED", 'settingsId')),
                param('settingsId').not().equals('undefined').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'settingsId')),
                param('settingsId').not().equals('null').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'settingsId')),
                param('settingsId').isAlphanumeric().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'settingsId')),
                param('settingsId').not().isEmpty().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'settingsId'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for email settings validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static defaultEmailSettingsValidator() {
        try {
            return [
                check('defaultFromEmail').isEmail().withMessage(i18n.__("VALID_EMAIL")),
                check('defaultAdminEmail').isEmail().withMessage(i18n.__("VALID_EMAIL"))
            ];
        } catch (error) {
            return error;
        }
    }
    // /********************************************************
    //  Purpose:Function for email settings validator
    //  Parameter:
    //  {}
    //  Return: JSON String
    //  ********************************************************/
    // static emailSettingsValidator() {
    //     try {
    //         return [
    //             check('defaultFromEmail').isEmail().withMessage(i18n.__("VALID_EMAIL")),
    //             check('defaultAdminEmail').isEmail().withMessage(i18n.__("VALID_EMAIL")),
    //             check('emailSettings').isArray().withMessage(i18n.__("%s ARRAY", 'Email settings')),
    //             check('emailSettings').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'Email settings'))
    //         ];
    //     } catch (error) {
    //         return error;
    //     }
    // }
    /********************************************************
     Purpose:Function for email settings validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static smtpAndsmsSettingsValidator() {
        try {
            return [
                check('host').exists().withMessage(i18n.__("%s REQUIRED", 'Host')),
                check('port').isNumeric().withMessage(i18n.__("VALID_PORT")),
                check('port').isLength({ min: 2, max: 4 }).withMessage(i18n.__("VALID_PORT")),
                check('username').exists().withMessage(i18n.__("%s REQUIRED", 'Username')),
                check('password').exists().withMessage(i18n.__("%s REQUIRED", 'Password')),
                check('mobileNumber').exists().withMessage(i18n.__("%s REQUIRED", 'mobileNumber')),
                check('accountSid').exists().withMessage(i18n.__("%s REQUIRED", 'accountSid')),
                check('authToken').exists().withMessage(i18n.__("%s REQUIRED", 'authToken')),
            ];
        } catch (error) {
            return error;
        }
    }

    /********************************************************
   Purpose:Function for email settings validator
   Parameter:
   {}
   Return: JSON String
   ********************************************************/
    static globalsSettingsValidator() {
        try {
            return [
                check('siteName').exists().withMessage(i18n.__("%s REQUIRED", 'siteName')),
                check('siteFavicon').exists().withMessage(i18n.__("%s REQUIRED", 'siteFavicon')),
                check('siteLogoSmall').exists().withMessage(i18n.__("%s REQUIRED", 'siteLogoSmall')),
                check('siteLogoLarge').exists().withMessage(i18n.__("%s REQUIRED", 'siteLogoLarge')),
                check('metaTitle').exists().withMessage(i18n.__("%s REQUIRED", 'metaTitle')),
                check('metaKeyword').exists().withMessage(i18n.__("%s REQUIRED", 'metaKeyword')),
                check('metaDescription').exists().withMessage(i18n.__("%s REQUIRED", 'metaDescription')),
                check('analyticsSnippet').exists().withMessage(i18n.__("%s REQUIRED", 'analyticsSnippet')),
                check('headerSnippet').exists().withMessage(i18n.__("%s REQUIRED", 'headerSnippet')),
                check('footerSnippet').exists().withMessage(i18n.__("%s REQUIRED", 'footerSnippet')),
                check('currency').exists().withMessage(i18n.__("%s REQUIRED", 'currency')),
                check('dateFormat').exists().withMessage(i18n.__("%s REQUIRED", 'dateFormat')),
                check('timeZone').exists().withMessage(i18n.__("%s REQUIRED", 'timeZone')),
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for change status validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static changeStatusValidator() {
        try {
            return [
                check('ids').isArray().withMessage(i18n.__("%s ARRAY", 'Ids')),
                check('status').isBoolean().withMessage(i18n.__("%s REQUIRED", 'Status')),
            ];
        } catch (error) {
            return error;
        }
    }
    static validate(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ status: 0, message: errors.array() });
            }
            next();
        } catch (error) {
            return res.send({ status: 0, message: error });
        }
    }
}

module.exports = Validators;
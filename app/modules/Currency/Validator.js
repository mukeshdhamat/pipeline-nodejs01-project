/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');

class Validators {

    /********************************************************
     Purpose:Function for currency validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static currencyValidator() {
        try {
            return [
                check('countryId').exists().withMessage(i18n.__("%s REQUIRED", 'countryId')),
                check('currency').exists().withMessage(i18n.__("%s REQUIRED", 'currency')),
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for listing validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static listingValidator() {
        try {
            return [
                check('page').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Page')),
                check('pagesize').isNumeric().withMessage(i18n.__("%s REQUIRED", 'Pagesize'))
            ];
        } catch (error) {
            return error;
        }
    }

    /********************************************************
     Purpose:Function for detail validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static detailValidator() {
        try {
            return [
                param('currencyId').exists().withMessage(i18n.__("%s REQUIRED", 'currencyId')),
                param('currencyId').not().equals('undefined').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'currencyId')),
                param('currencyId').not().equals('null').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'currencyId')),
                param('currencyId').isAlphanumeric().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'currencyId')),
                param('currencyId').not().isEmpty().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'currencyId'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
     Purpose:Function for delete validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static deleteValidator() {
        try {
            return [
                check('currenciesIds').isArray().withMessage(i18n.__("%s ARRAY", 'currenciesIds')),
                check('currenciesIds').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'currenciesIds'))
            ];
        } catch (error) {
            return error;
        }
    }
    /********************************************************
    Purpose:Function for status validator
    Parameter:
    {}
    Return: JSON String
    ********************************************************/
    static statusValidator() {
        try {
            return [
                check('currenciesIds').isArray().withMessage(i18n.__("%s ARRAY", 'currenciesIds')),
                check('currenciesIds').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'currenciesIds')),
                check('status').isBoolean().withMessage(i18n.__("%s REQUIRED", 'Status'))
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
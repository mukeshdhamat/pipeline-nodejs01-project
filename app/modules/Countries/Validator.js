/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');

class Validators {

    /********************************************************
     Purpose:Function for country validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static countryValidator() {
        try {
            return [
                check('countryName').exists().withMessage(i18n.__("%s REQUIRED", 'countryName')),
                check('countryCode').exists().withMessage(i18n.__("%s REQUIRED", 'countryCode')),
                check('phoneCode').exists().withMessage(i18n.__("%s REQUIRED", 'phoneCode'))
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
                param('countryId').exists().withMessage(i18n.__("%s REQUIRED", 'countryId')),
                param('countryId').not().equals('undefined').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'countryId')),
                param('countryId').not().equals('null').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'countryId')),
                param('countryId').isAlphanumeric().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'countryId')),
                param('countryId').not().isEmpty().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'countryId'))
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
                check('countriesIds').isArray().withMessage(i18n.__("%s ARRAY", 'countriesIds')),
                check('countriesIds').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'countriesIds'))
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
                check('countriesIds').isArray().withMessage(i18n.__("%s ARRAY", 'countriesIds')),
                check('countriesIds').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'countriesIds')),
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
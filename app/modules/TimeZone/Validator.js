/****************************
 Validators
 ****************************/
const _ = require("lodash");
let i18n = require("i18n");
const { validationResult } = require('express-validator');
const { body, check, query, header, param } = require('express-validator');

class Validators {

    /********************************************************
     Purpose:Function for timezone validator
     Parameter:
     {}
     Return: JSON String
     ********************************************************/
    static timezoneValidator() {
        try {
            return [
                check('countryId').exists().withMessage(i18n.__("%s REQUIRED", 'countryId')),
                check('timezone').exists().withMessage(i18n.__("%s REQUIRED", 'timezone')),
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
                param('timezoneId').exists().withMessage(i18n.__("%s REQUIRED", 'timezoneId')),
                param('timezoneId').not().equals('undefined').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'timezoneId')),
                param('timezoneId').not().equals('null').withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'timezoneId')),
                param('timezoneId').isAlphanumeric().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'timezoneId')),
                param('timezoneId').not().isEmpty().withMessage(i18n.__("%s REQUIRED", 'Valid ' + 'timezoneId'))
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
                check('timezoneIds').isArray().withMessage(i18n.__("%s ARRAY", 'timezoneIds')),
                check('timezoneIds').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'timezoneIds'))
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
                check('timezoneIds').isArray().withMessage(i18n.__("%s ARRAY", 'timezoneIds')),
                check('timezoneIds').isLength({ min: 1 }).withMessage(i18n.__("%s ARRAY_LENGTH", 'timezoneIds')),
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
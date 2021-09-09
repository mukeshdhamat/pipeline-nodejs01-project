const i18n = require("i18n");
const _ = require('lodash');

const Controller = require('../Base/Controller');
const Model = require("../Base/Model");
const Currencies = require('./Schema').Currencies;
const CommonService = require("../../services/Common");

class CurrenciesController extends Controller {
    constructor() {
        super();
    }

    /********************************************************
     Purpose:Currency insert and update
     Parameter:
     {
        "CurrencyId":"",
        "currency":"",
        "currencyId":""
     }
     Return: JSON String
     ********************************************************/
    async addUpdateCurrency() {
        try {
            let data = this.req.body;
            if (data.currencyId) {
                let checkingCurrency = await Currencies.findOne({ _id: { $ne: data.currencyId }, countryId: data.countryId, currency: data.currency });
                if (!_.isEmpty(checkingCurrency)) {
                    return this.res.send({ status: 0, message: i18n.__('CURRENCY_ALREADY_EXISTS_WITH_COUNTRY') })
                }
                const currencyData = await Currencies.findByIdAndUpdate(data.currencyId, data, { new: true });
                if (_.isEmpty(currencyData)) {
                    return this.res.send({ status: 0, message: i18n.__('NOT_UPDATED') })
                }
                return this.res.send({ status: 1, message: i18n.__('UPDATED_SUCCESSFULLY') })
            } else {
                let checkingCurrency = await Currencies.findOne({ countryId: data.countryId, currency: data.currency });
                if (!_.isEmpty(checkingCurrency)) {
                    return this.res.send({ status: 0, message: i18n.__('CURRENCY_ALREADY_EXISTS_WITH_COUNTRY') })
                }
                const currencyData = await (new Model(Currencies)).store(data);
                if (_.isEmpty(currencyData)) {
                    return this.res.send({ status: 0, message: i18n.__('NOT_SAVED') })
                }
                return this.res.send({ status: 1, message: i18n.__('SAVED_SUCCESSFULLY') });
            }
        } catch (error) {
            console.log("error- ", error);
            return this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:Currency description
     Parameter:
     {
           "CurrencyId":""
     }
     Return: JSON String
     ********************************************************/
    async getCurrencyDetails() {
        try {
            const currencyData = await Currencies.findOne({ _id: this.req.params.currencyId }, { currency: 1, countryId: 1 }).populate('countryId', { countryName: 1, phoneCode: 1 });
            return this.res.send(_.isEmpty(currencyData) ? { status: 0, message: i18n.__('NOT_FOUND') } : { status: 1, data: currencyData });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:Currency delete
     Parameter:
     {
           "currenciesIds":"1",
     }
     Return: JSON String
     ********************************************************/
    async deleteCurrencies() {
        try {
            let msg = i18n.__("NOT_DELETED");
            const updatedCurrency = await Currencies.updateMany({ _id: { $in: this.req.body.currenciesIds } }, { $set: { isDeleted: true } });
            if (updatedCurrency) {
                msg = updatedCurrency.nModified ? updatedCurrency.nModified + ' Currency deleted.' : updatedCurrency.n == 0 ? i18n.__("CURRENCY_NOT_FOUND") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:Currency list
     Parameter:
     {
            "page":1,
            "pagesize":10,
            "columnKey":"CurrencyListing",
     }
     Return: JSON String
     ********************************************************/
    async currenciesListing() {
        try {
            this.req.body['model'] = Currencies;
            this.req.body['adminId'] = this.req.currentUser._id;
            let data = { bodyData: this.req.body };
            data.query = { isDeleted: false };
            data.process = 'timezone';
            /**** if search is required ******/
            if (this.req.body.searchText) {
                data.fieldsArray = ['currency', 'country.countryName']
                data.searchText = this.req.body.searchText;
            }
            data.stages = [
                { $lookup: { from: "countries", localField: "countryId", foreignField: "_id", as: "country" } },
                { $unwind: "$country" },
            ]
            data.selectObj = { _id: 1, countryName: "$country.countryName", countryPhoneCode: "$country.phoneCode", currency: 1 }
            let result = await new CommonService().listing(data);
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: single and multiple currencies 's change status
     Parameter:
     {
        "currenciesIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"],
        "status":true
     }
     Return: JSON String
     ********************************************************/
    async changeCurrenciesStatus() {
        try {
            let model = this.req.model ? this.req.model : Currencies;
            let msg = 'Currency not updated.';
            const updatedCurrency = await model.updateMany({ _id: { $in: this.req.body.currenciesIds } }, { $set: { status: this.req.body.status } });
            if (updatedCurrency) {
                msg = updatedCurrency.nModified ? updatedCurrency.nModified + ' currencies updated.' : updatedCurrency.n == 0 ? i18n.__("NOT_FOUND") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }


}
module.exports = CurrenciesController;
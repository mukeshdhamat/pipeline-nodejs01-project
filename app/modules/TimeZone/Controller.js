const i18n = require("i18n");
const _ = require('lodash');

const Controller = require('../Base/Controller');
const Model = require("../Base/Model");
const Timezones = require('./Schema').Timezones;
const CommonService = require("../../services/Common");

class TimeZoneController extends Controller {
    constructor() {
        super();
    }

    /********************************************************
     Purpose:timezone insert and update
     Parameter:
     {
        "countryId":"",
        "timezone":"",
        "timezoneId":""
     }
     Return: JSON String
     ********************************************************/
    async addUpdateTimezone() {
        try {
            let data = this.req.body;
            if (data.timezoneId) {
                let checkingTimezone = await Timezones.findOne({ _id: { $ne: data.timezoneId }, countryId: data.countryId, timezone: data.timezone, isDeleted: false });
                if (!_.isEmpty(checkingTimezone)) {
                    return this.res.send({ status: 0, message: i18n.__('TIMEZONE_ALREADY_EXISTS_WITH_COUNTRY') })
                }
                const timezoneData = await Timezones.findByIdAndUpdate(data.timezoneId, data, { new: true });
                if (_.isEmpty(timezoneData)) {
                    return this.res.send({ status: 0, message: i18n.__('NOT_UPDATED') })
                }
                return this.res.send({ status: 1, message: i18n.__('UPDATED_SUCCESSFULLY') })
            } else {
                let checkingTimezone = await Timezones.findOne({ countryId: data.countryId, timezone: data.timezone, isDeleted: false });
                if (!_.isEmpty(checkingTimezone)) {
                    return this.res.send({ status: 0, message: i18n.__('TIMEZONE_ALREADY_EXISTS_WITH_COUNTRY') })
                }
                const timezoneData = await (new Model(Timezones)).store(data);
                if (_.isEmpty(timezoneData)) {
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
     Purpose:timezone description
     Parameter:
     {
           "timezoneId":""
     }
     Return: JSON String
     ********************************************************/
    async getTimezoneDetails() {
        try {
            const timezoneData = await Timezones.findOne({ _id: this.req.params.timezoneId, isDeleted: false }, { timezone: 1, countryId: 1 }).populate('countryId', { countryName: 1, phoneCode: 1 });
            return this.res.send(_.isEmpty(timezoneData) ? { status: 0, message: i18n.__('NOT_FOUND') } : { status: 1, data: timezoneData });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:timezone delete
     Parameter:
     {
           "timezoneIds":"1",
     }
     Return: JSON String
     ********************************************************/
    async deleteTimezones() {
        try {
            let msg = i18n.__("NOT_DELETED");
            const updatedTimezone = await Timezones.updateMany({ _id: { $in: this.req.body.timezoneIds } }, { $set: { isDeleted: true } });
            if (updatedTimezone) {
                msg = updatedTimezone.nModified ? updatedTimezone.nModified + ' timezone deleted.' : updatedTimezone.n == 0 ? i18n.__("timezone_NOT_FOUND") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:timezone list
     Parameter:
     {
            "page":1,
            "pagesize":10,
            "columnKey":"timezoneListing",
     }
     Return: JSON String
     ********************************************************/
    async timezoneListing() {
        try {
            this.req.body['model'] = Timezones;
            this.req.body['adminId'] = this.req.currentUser._id;
            let data = { bodyData: this.req.body };
            data.query = { isDeleted: false };
            data.process = 'currency';
            /**** if search is required ******/
            if (this.req.body.searchText) {
                data.fieldsArray = ['timezone', 'country.countryName']
                data.searchText = this.req.body.searchText;
            }
            data.stages = [
                { $lookup: { from: "countries", localField: "countryId", foreignField: "_id", as: "country" } },
                { $unwind: "$country" },
            ]
            data.selectObj = { _id: 1, countryName: "$country.countryName", countryPhoneCode: "$country.phoneCode", timezone: 1 }
            let result = await new CommonService().listing(data);
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: single and multiple timezone 's change status
     Parameter:
     {
        "timezoneIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"],
        "status":true
     }
     Return: JSON String
     ********************************************************/
    async changeTimezoneStatus() {
        try {
            let model = this.req.model ? this.req.model : Timezones;
            let msg = 'timezone not updated.';
            const updatedTimezone = await model.updateMany({ _id: { $in: this.req.body.timezoneIds } }, { $set: { status: this.req.body.status } });
            if (updatedTimezone) {
                msg = updatedTimezone.nModified ? updatedTimezone.nModified + ' timezones updated.' : updatedTimezone.n == 0 ? i18n.__("NOT_FOUND") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }


}
module.exports = TimeZoneController;
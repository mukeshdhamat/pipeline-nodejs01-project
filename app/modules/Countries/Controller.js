const i18n = require("i18n");
const _ = require('lodash');
const json2csv = require('json2csv').parse;
const path = require('path');
const fs = require('fs');

const Controller = require('../Base/Controller');
const Model = require("../Base/Model");
const Countries = require('./Schema').Countries;
const CommonService = require("../../services/Common");
const Form = require('../../services/Form');

class CountriesController extends Controller {
    constructor() {
        super();
    }

    /********************************************************
     Purpose:Country insert and update
     Parameter:
     {
        "countryName":"",
        "countryCode":"",
        "phoneCode":"",
        "countryId":""
     }
     Return: JSON String
     ********************************************************/
    async addUpdateCountry() {
        try {
            let data = this.req.body;
            if (data.countryId) {
                let checkingCountryName = await Countries.findOne({ countryName: data.countryName, _id: { $ne: data.countryId } });
                if (!_.isEmpty(checkingCountryName)) {
                    return this.res.send({ status: 0, message: i18n.__('COUNTRYNAME_ALREADY_EXISTS') })
                }
                const countryData = await Countries.findByIdAndUpdate(data.countryId, data, { new: true });
                if (_.isEmpty(countryData)) {
                    return this.res.send({ status: 0, message: i18n.__('NOT_UPDATED') })
                }
                return this.res.send({ status: 1, message: i18n.__('UPDATED_SUCCESSFULLY') })
            } else {
                let checkingCountryName = await Countries.findOne({ countryName: data.countryName });
                if (!_.isEmpty(checkingCountryName)) {
                    return this.res.send({ status: 0, message: i18n.__('COUNTRYNAME_ALREADY_EXISTS') })
                }
                const countryData = await (new Model(Countries)).store(data);
                if (_.isEmpty(countryData)) {
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
     Purpose:Country description
     Parameter:
     {
           "CountryId":""
     }
     Return: JSON String
     ********************************************************/
    async getCountryDetails() {
        try {
            const countryData = await Countries.findOne({ _id: this.req.params.countryId }, { __v: 0 });
            return this.res.send(_.isEmpty(countryData) ? { status: 0, message: i18n.__('NOT_FOUND') } : { status: 1, data: countryData });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:Country delete
     Parameter:
     {
           "countriesIds":"1",
     }
     Return: JSON String
     ********************************************************/
    async deleteCountries() {
        try {
            let msg = i18n.__("NOT_DELETED");
            const updatedCountry = await Countries.updateMany({ _id: { $in: this.req.body.countriesIds } }, { $set: { isDeleted: true } });
            if (updatedCountry) {
                msg = updatedCountry.nModified ? updatedCountry.nModified + ' Country deleted.' : updatedCountry.n == 0 ? i18n.__("Country_NOT_FOUND") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose:Country list
     Parameter:
     {
            "page":1,
            "pagesize":10,
            "columnKey":"countryListing",
     }
     Return: JSON String
     ********************************************************/
    async countriesListing() {
        try {
            this.req.body['model'] = Countries;
            this.req.body['adminId'] = this.req.currentUser._id;
            let data = { bodyData: this.req.body }
            /**** if search is required ******/
            if (this.req.body.searchText) {
                data.fieldsArray = ['countryName']
                data.searchText = this.req.body.searchText;
            }
            let result = await new CommonService().listing(data);
            return this.res.send(result);
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: single and multiple countries 's change status
     Parameter:
     {
        "countriesIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"],
        "status":true
     }
     Return: JSON String
     ********************************************************/
    async changeCountriesStatus() {
        try {
            let model = this.req.model ? this.req.model : Countries;
            let msg = 'Country not updated.';
            const updatedCountry = await model.updateMany({ _id: { $in: this.req.body.countriesIds } }, { $set: { status: this.req.body.status } });
            if (updatedCountry) {
                msg = updatedCountry.nModified ? updatedCountry.nModified + ' countries updated.' : updatedCountry.n == 0 ? i18n.__("NOT_FOUND") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
 Purpose:Getting Dropdowns For Filters In countryListing In Admin
 Method: Post
 Authorisation: true
 Parameter:
 {
     "filter":{
         "countryName":"India"
     }
  }
 Return: JSON String
 ********************************************************/
    async getCountriesList() {
        let _this = this;
        try {
            let andArray = [{ isDeleted: false, status: true }]
            if (this.req.body.searchText) {
                let regex = { $regex: `.*${this.req.body.searchText}.*`, $options: 'i' };
                andArray.push({ $or: [{ countryName: regex }] })
            }
            let result = await Countries.find({ $and: andArray }, { countryName: 1, phoneCode: 1 }).limit(20)
            return this.res.send({ status: 1, message: i18n.__('DETAILS'), data: result });
        } catch (error) {
            console.log("error", error)
            return _this.res.send({ status: 0, message: i18n.__('INTERNAL_SERVER_ERROR') });
        }
    }

    /********************************************************
   Purpose: download sample csv for Countries bulkUpload
   Method: get
   Authorisation: true
   ********************************************************/
    async downloadSampleCsvForCountries() {
        try {
            let project = ['countryName', 'countryCode', 'phoneCode', 'status'];
            let tempData = [{ countryName: "India", countryCode: "IN", phoneCode: "91", status: true }]
            const csv = json2csv(tempData, project);

            /****** creating fileName using timestamps *****/
            const filePathAndName = "sampleCountries" + Date.now() + ".csv";
            const filePath = path.join(__dirname, "../../../", "public/csv/", filePathAndName);
            fs.writeFile(filePath, csv, (err) => {
                if (err) { return this.res.send({ status: 0, message: i18n.__('INTERNAL_SERVER_ERROR') }); }
                else { return this.res.send({ status: 1, message: i18n.__('CSV_DOWNLOAD'), data: filePathAndName }); }
            })
        } catch (error) {
            console.log("error", error)
            return this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: bulkUpload
     Parameter:
     {
        "file":"",
        "type":"csv"
     }
     Return: JSON String
     ********************************************************/
    async bulkUpload() {
        try {
            let form = new Form(this.req);
            let formObject = await form.parse();
            if (_.isEmpty(formObject.files) || _.isEmpty(formObject.fields))
                return this.res.send({ status: 0, message: i18n.__('SEND_FILE_WITH_TYPE') });
            /**** getting jsonData from csv or excel based on type *******/
            let jsonData = (formObject.fields.type[0] == 'csv') ? await new CommonService().convertCsvToJson(formObject.files) :
                ((formObject.fields.type[0] == 'excel') ? await new CommonService().convertExcelToJson(formObject.files) : [])
            let requiredArr = []; let insertCountryArr = []; let existingCountryArr = []

            if (jsonData.length > 0) {
                /**** checking required fields ******/
                for (let s = 0; s < jsonData.length; s++) {
                    if (!jsonData[s].countryName || !jsonData[s].countryCode || !jsonData[s].phoneCode || !jsonData[s].status) {
                        requiredArr.push(s + 2)
                    }
                }
                if (!_.isEmpty(requiredArr))
                    return this.res.send({ status: 0, message: i18n.__('REQUIRED'), data: requiredArr });

                for (let x = 0; x < jsonData.length; x++) {
                    let requestData = {
                        countryName: jsonData[x].countryName,
                        countryCode: jsonData[x].countryCode,
                        phoneCode: jsonData[x].phoneCode,
                        // image: jsonData[x].image,
                        status: (jsonData[x].status) ? JSON.parse(jsonData[x].status.toLowerCase()) : false,
                        createdAt: new Date()
                    }
                    let country = await Countries.findOne({ "countryName": requestData.countryName });
                    if (_.isEmpty(country)) { insertCountryArr.push(requestData) }
                    else { existingCountryArr.push(requestData) }
                }
                /***** bulk insert of the data *****/
                if (insertCountryArr.length > 0) {
                    insertCountryArr = insertCountryArr.filter((ele, ind) => ind === insertCountryArr.findIndex(elem => elem.countryName === ele.countryName))
                    await new Model(Countries).bulkInsert(insertCountryArr)
                }
                /***** updating the existing country details *****/
                if (existingCountryArr.length > 0) {
                    existingCountryArr = existingCountryArr.filter((ele, ind) => ind === existingCountryArr.findIndex(elem => elem.countryName === ele.countryName))
                    let countryDetails = existingCountryArr
                    for (let x = 0; x < countryDetails.length; x++) {
                        await Countries.findOneAndUpdate({ countryName: countryDetails[x].countryName }, { $set: countryDetails[x] }, { upsert: true, new: true })
                    }
                }
                return this.res.send({ status: 1, message: i18n.__('UPDATED_SUCCESSFULLY') });
            }
            return this.res.send({ status: 0, message: i18n.__('NOT_UPDATED') });

        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }


}
module.exports = CountriesController;
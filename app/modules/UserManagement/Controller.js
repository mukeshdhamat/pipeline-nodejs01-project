const _ = require("lodash");
const i18n = require("i18n");
const Transaction = require('mongoose-transactions');
const moment = require('moment');

const Controller = require("../Base/Controller");
const Users = require('../User/Schema').Users;
const CommonService = require("../../services/Common");
const Globals = require('../../../configs/Globals');
const userProjection = require('./Projection');
const Email = require('../../services/Email');
const config = require('../../../configs/configs');
const { TemplateSettings, FilterSettings } = require("./Schema");

class UserManagementController extends Controller {

    constructor() {
        super();
    }

    /********************************************************
    Purpose: user listing
    Parameter:
    {
        "page":1,
        "pagesize":10,
        "columnKey":"userListing",
        "filter": [{"firstName": ["Neha","Madhuri"]},{"lastName":["Bhavsar","Dodla"]}]
        OR 
        "filter": [{"role": ["5d5a8746d9a42e120e2d9700"]}]
    }
    Return: JSON String
    ********************************************************/
    async userListing() {
        try {
            this.req.body['model'] = Users;
            this.req.body['adminId'] = this.req.currentUser._id;
            let data = {
                bodyData: this.req.body,
                selectObj: userProjection.user,
            };
            /**** if search is required ******/
            if (this.req.body.searchText) {
                data.fieldsArray = ['firstName', 'lastName', 'emailId', 'mobile', 'userName']
                data.searchText = this.req.body.searchText;
            }
            let result = await new CommonService().listing(data);
            return this.res.send(result);
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: single and multiple user delete
     Parameter:
     {
        "userIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"]
     }
     Return: JSON String
     ********************************************************/
    async deleteUsers() {
        try {
            let model = this.req.body.model ? this.req.body.model : Users;
            let msg = 'User not deleted.';
            const updatedUser = await model.updateMany({ _id: { $in: this.req.body.userIds }, isDeleted: false }, { $set: { isDeleted: true } });
            if (updatedUser) {
                msg = updatedUser.nModified ? updatedUser.nModified + ' user deleted.' : updatedUser.n == 0 ? i18n.__("USER_NOT_EXIST") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: single and multiple user 's change status
     Parameter:
     {
        "userIds":["5ad5d198f657ca54cfe39ba0","5ad5da8ff657ca54cfe39ba3"],
        "status":true
     }
     Return: JSON String
     ********************************************************/
    async changeStatus() {
        try {
            let model = this.req.model ? this.req.model : Users;
            let msg = 'User not updated.';
            const updatedUser = await model.updateMany({ _id: { $in: this.req.body.userIds } }, { $set: { status: this.req.body.status } });
            if (updatedUser) {
                msg = updatedUser.nModified ? updatedUser.nModified + ' user updated.' : updatedUser.n == 0 ? i18n.__("USER_NOT_EXIST") : msg;
            }
            return this.res.send({ status: 1, message: msg });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: user details
     Parameter:
     {
        "uid": "5ad5d198f657ca54cfe39ba0"
     }
     Return: JSON String
     ********************************************************/
    async userProfile() {
        try {
            let model = this.req.model ? this.req.model : Users;
            let user = await model.findOne({ _id: this.req.params.userId }, userProjection.user).populate('country', { countryName: 1, phoneCode: 1, countryCode: 1 });
            return this.res.send(_.isEmpty(user) ? { status: 0, message: i18n.__("USER_NOT_EXIST") } : { status: 1, data: user });
        } catch (error) {
            console.log("error- ", error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
   Purpose: Download CSV Of User Details Based On Filter In Admin
   Method: Post
   Authorisation: true
   Parameter:
   {
       "filteredFields":["userId","firstName","lastName","emailId","mobileNo","emailVerify","status"],
       "type":"csv",
         "filter": [
       { "firstName": ["mercado","test"]},
       {"lastName":["mayorista","user"]},
       {"status":[true]},
       {"userId":["usr-4","usr-3"]},
       {"emailId":["merca@grr.la","user@grr.la"]},
       {"mobileNo":[12314235225]}
       {"idsArray":["5d5644764953e52f6edb61d1","5c875814e915390720f51a1b"]}
       ]
   }
   Return: JSON String
   ********************************************************/
    async downloadUserFile() {
        try {
            this.req.body['model'] = Users;
            this.req.body['fileName'] = 'users';
            let query = { isDeleted: false };
            let selectObj = {};
            this.req.body.filteredFields.map(data => { selectObj[data] = 1 });
            let result = await new CommonService().downloadFiles({ bodyData: this.req.body, selectObj, query });
            if (result.filePathAndName) {
                return this.res.send({ status: 1, message: i18n.__(`${this.req.body.type.toUpperCase()}_DOWNLOAD`), data: result });
            } else {
                this.res.send(result)
            }
        } catch (error) {
            console.log("error", error)
            this.res.send({ status: 0, message: error })
        }
    }

    /********************************************************
    Purpose: Add user by admin
    Parameter:
    {
         "email":"john@doe.com",
         "password":"john",
         "mobile":"987654321",
         "firstName":"john",
         "lastName":"deo",
         "role": "manager"
     }
    Return: JSON String
    ********************************************************/
    async addUserByAdmin() {
        const transaction = new Transaction();
        try {
            let data = this.req.body;
            data['emailId'] = data['emailId'].toLowerCase();
            data['role'] = 'user';
            if (data.dob) {
                let date = new Date(data.dob);
                data['dob'] = new Date(moment(date).add(5, 'hours').add(30, 'minutes'));
            }
            // check emailId is exist or not
            let filter = { "emailId": data.emailId, _id: { $ne: this.req.body.userId } }
            const user = await Users.findOne(filter);
            console.log("userId", filter)

            //if user exist give error
            if (!_.isEmpty(user) && (user.emailId)) {
                return this.res.send({ status: 0, message: i18n.__("DUPLICATE_EMAIL_OR_USERNAME") });
            }

            if (this.req.body.userId) {
                await Users.findOneAndUpdate({ _id: data.userId }, data, { new: true, upsert: true });
                return this.res.send({ status: 1, message: i18n.__('UPDATED_SUCCESSFULLY') });
            } else {
                // save new user
                let newUser = new Users(data);
                newUser.validate(async(err) => {
                    if (err) {
                        return this.res.send({ status: 0, message: err })
                    } else {
                        const newUserId = transaction.insert('Users', data);
                        // if empty not save user details and give error message.
                        if (_.isEmpty(newUserId)) {
                            return this.res.send({ status: 0, message: i18n.__('USER_NOT_SAVED') })
                        } else {
                            const token = await new Globals().generateToken(newUserId);
                            transaction.update('Users', newUserId, { forgotToken: token, forgotTokenCreationTime: new Date() });
                            //sending mail to verify user
                            let emailData = {
                                emailId: data['emailId'],
                                emailKey: 'user_invite_mail',
                                replaceDataObj: { role: data['role'], fullName: data.firstName + " " + data.lastName, verificationLink: config.frontUrl + '/setPassword?token=' + token, verificationLinkAngular: config.frontUrlAngular + '/set-password?token=' + token }
                            };
                            const sendingMail = await new Email().sendMail(emailData);
                            if (sendingMail && sendingMail.status == 0) {
                                transaction.rollback();
                                return this.res.send(sendingMail);
                            } else if (sendingMail && !sendingMail.response) {
                                transaction.rollback();
                                return this.res.send({ status: 0, message: i18n.__('MAIL_NOT_SEND_SUCCESSFULLY') });
                            }
                            await transaction.run();
                            return this.res.send({ status: 1, message: i18n.__('USER_ADDED_SUCCESSFULLY') });
                        }
                    }
                });
            }
        } catch (error) {
            console.log("error = ", error);
            transaction.rollback();
            this.res.send({ status: 0, message: error });
        }
    }



    /********* common api's for all modules *********/
    /********************************************************
    Purpose: common Save column settings
    Parameter:
    {
        key: 'userListing',
        columns: [{key : 'firstName', status: false}, {key : 'lastName', status: false},{key : 'emailId', status: true}],
        "latestColumns":[]
    }
    Return: JSON String
  ********************************************************/
    async saveColumnSettings() {
        try {
            this.req.body.adminId = this.req.currentUser._id
            let result = await (new CommonService()).saveColumnSettings({ bodyData: this.req.body });
            return this.res.send(result);
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
      Purpose: common Save column settings
      Parameter:
      {
          "key": 'userListing',
          "description":"Testing",
          "color":"#eee"
          "columns": [{key : 'firstName', status: false}, {key : 'lastName', status: false},{key : 'emailId', status: true}]
      }
      Return: JSON String
    ********************************************************/
    async saveTemplateSettings() {
        try {
            this.req.body.adminId = this.req.currentUser._id;
            let result = await (new CommonService()).saveTemplateSettings({ bodyData: this.req.body });
            return this.res.send(result);
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
    Purpose: common Save column settings
    Method:GET
    Return: JSON String
  ********************************************************/
    async getTemplateSettings() {
        try {
            let adminId = this.req.currentUser._id;
            let result = await TemplateSettings.find({ adminId, key: this.req.params.key })
            return this.res.send({ status: 1, message: i18n.__("DETAILS"), data: result });
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
      Purpose: Get Filters
      Parameter:
      {
         "key": "userListing",
         ""
      }
      Return: JSON String
      ********************************************************/
    async deleteTemplateSettings() {
        try {
            let result = await TemplateSettings.deleteOne({ _id: this.req.params.templateId });
            if (result.ok && result.deletedCount) {
                return this.res.send({ status: 1, data: result, message: i18n.__("DELETED_SUCCESSFULLY"), });
            } else if (result.ok && result.n == 0) {
                return this.res.send({ status: 0, message: i18n.__("NOT_FOUND"), });
            } else {
                return this.res.send({ status: 0, message: i18n.__("NOT_DELETED"), });
            };
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: Save filter
     Parameter:
     {
        "condition": "$and",
        "filter": [{
                        "method": "include",
                        "key": "emailId",
                        "type": "contains",
                        "value": "gmail.com"
                    }],
        "description":"",
        "color":"#eee",
        "key":"userListing"
     }
     Return: JSON String
     ********************************************************/
    async saveFilter() {
        try {
            this.req.body.adminId = this.req.currentUser._id;
            let result = await new CommonService().saveFilter({ bodyData: this.req.body });
            return this.res.send(result);
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }

    /********************************************************
     Purpose: Get Filters
     Parameter:Delete
     Return: JSON String
     ********************************************************/
    async deleteFilter() {
        try {
            let result = await FilterSettings.deleteOne({ _id: this.req.params.filterId });
            if (result.ok && result.deletedCount) {
                return this.res.send({ status: 1, data: result, message: i18n.__("DELETED_SUCCESSFULLY"), });
            } else if (result.ok && result.n == 0) {
                return this.res.send({ status: 0, message: i18n.__("NOT_FOUND"), });
            } else {
                return this.res.send({ status: 0, message: i18n.__("NOT_DELETED"), });
            };
        } catch (error) {
            console.log(error);
            this.res.send({ status: 0, message: error });
        }
    }

}
module.exports = UserManagementController;
#Node Project

## Perquisites (Development):

| Module | Version |
| --- | --- |
| Node | 14.17.5 |
| Npm | 6.14.14 |
| Mongodb | 4.0.2 |


##### Take Clone of project
> git clone -b git_url  folder_name


##### Rename configSample.js to configs.js
> cd configs
> mv configSample.js configs.js

##### Change the url of database and set credential if applicable
> vi configs.js

##### Install node modules

> npm install

##### Deployment

>pm2 start server.js --name="ProjectName"


// external packages
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({
    extended: true
}));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const AT = require('../helper-function/airtable-database');

const INTENT_LIST = {
    'User Provides Name': 'name',
    'User Provides Reference Number': 'ref_num',
    'User Provides DOB': 'dob',
    'User Provides Mobile': 'mobile',
    'User Provides Email': 'email',
    'User Provides Q1 - Yes': 'working',
    'User Provides Q1 - No': 'working',
    'User Provides Q2': 'wages_benifits',
    'User Provides Q3': 'p_wages',
    'User Provides Q3 - Yes': 'other_people_ans',
    'User Provides Q3 - No': 'other_people',
    'User Provides Q3 - No - Yes': 'other_source_ans',
    'User Provides Q3 - No - No': 'other_source',
    'User Provides Q4': 'rent_mortgage',
    'User Provides Q5': 'b_insurance',
    'User Provides Q6': 'l_insurance',
    'User Provides Q7': 'c_tax',
    'User Provides Q8': 'gas',
    'User Provides Q9': 'electricity',
    'User Provides Q10': 'water',
    'User Provides Q11': 'food',
    'User Provides Q12': 'travel',
    'User Provides Q13': 'phone',
    'User Provides Q14': 'tv_license',
    'User Provides Q15': 'clothing',
    'User Provides Q16': 'prescription',
    'User Provides Q17': 'other_item',
};

// Webhook route for Google Dialogflow
webApp.post('/webhook', async (req, res) => {

    let body = req.body.queryResult;

    // Get session id
    let session = req.body.session;
    let values = session.split('/');
    let sessionId = values[values.length - 1];

    // Fulfillment Text
    let fulfillmentText = body.fulfillmentText;

    // Get the query
    let query = body.queryText;

    // Intent name
    let intentName = body.intent.displayName;

    if (intentName === 'User Provides Email') {

        let outputContexts = req['body']['queryResult']['outputContexts'];
        let mobile, email, ref_numb;

        outputContexts.forEach(outputContext => {
            let ses = outputContext['name'];
            if (ses.includes('/contexts/session-vars')) {
                mobile = outputContext.parameters.mobile;
                email = outputContext.parameters.email;
                if (outputContext.parameters.hasOwnProperty('ref_numb')) {
                    ref_numb = outputContext.parameters.ref_numb;
                } else {
                    ref_numb = 0;
                }
            }
        });

        let flag = await AT.checkUserStatus(String(mobile), email, ref_numb);

        if (!flag) {
            fulfillmentText = `We are unable to confirm your information, please call 01473372210 or email customerservice@unitedkash.com.`

            let awaitQ1 = `${session}/contexts/await-q1`;
            let sessionVars = `${session}/contexts/session-vars`;

            res.send({
                fulfillmentText,
                outputContexts: [{
                    name: awaitQ1,
                    lifespanCount: 0
                }, {
                    name: sessionVars,
                    lifespanCount: 0,
                }]
            });
        } else {

            let prop = INTENT_LIST[intentName];
            let id = await AT.getRecordIdBySession(sessionId);
            let fields = {};

            fields[prop] = query;

            if (id != 0) {
                await AT.updateSurveyRecord(id, fields);
            }

            res.send({
                fulfillmentText
            });
        }
    } else {

        if (intentName === 'User Provides Name') {

            await AT.createSurveyRecord(sessionId, query);

        } else {
            let prop = INTENT_LIST[intentName];
            let id = await AT.getRecordIdBySession(sessionId);
            let fields = {};

            fields[prop] = query;

            if (id != 0) {
                await AT.updateSurveyRecord(id, fields);
            }
        }

        res.send({
            fulfillmentText
        });
    }
});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});
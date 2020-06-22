const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const APP_ID = process.env.APP_ID;

// Get the user by mobile and email
const checkUserStatus = async (mobile, email, ref_numb) => {

    if (ref_numb == 0) {
        url = `https://api.airtable.com/v0/${APP_ID}/UserDetails?view=Grid%20view&filterByFormula=(AND({mobile}="${mobile}", {email}="${email}"))`;   
    } else {
        url = `https://api.airtable.com/v0/${APP_ID}/UserDetails?view=Grid%20view&filterByFormula=(OR(AND({mobile}="${mobile}", {email}="${email}"), AND({mobile}="${mobile}", {ref_numb}="${ref_numb}"), AND({ref_numb}="${ref_numb}", {email}="${email}")))`;
    }
    
    headers = {
        Authorization: 'Bearer ' + API_KEY
    }

    try {

        let response = await axios.get(url, { headers });
        let records = response.data.records;
        if (records.length == 0) {
            return 0;
        } else {
            return 1;
        }

    } catch (error) {
        console.log(`Error at  checkUserStatus --> ${error}`);
        return 0;
    }
};

// Get the user by session
const getRecordIdBySession = async (session) => {

    url = `https://api.airtable.com/v0/${APP_ID}/SurveyData?view=Grid%20view&filterByFormula=(AND({session}="${session}"))&maxRecords=1`;
    headers = {
        Authorization: 'Bearer ' + API_KEY
    }

    try {

        let response = await axios.get(url, { headers });
        let records = response.data.records;
        if (records.length == 1) {
            return records[0].id;
        } else {
            return 0;
        }

    } catch (error) {
        console.log(`Error at  getRecordIdBySession --> ${error}`);
        return 2;
    }
};

// Create Survey Record
const createSurveyRecord = async (session, name) => {

    url = `https://api.airtable.com/v0/${APP_ID}/SurveyData`;
    headers = {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
    }

    let fields = {
        session: session,
        name: name
    }

    try {
        let response = await axios.post(url, { fields }, { headers });
        if (response.status == 200) {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        console.log(`Error at createSurveyRecord --> ${error}`);
        return 2;
    }
};


// Update the survey record to add value
const updateSurveyRecord = async (id, fields) => {

    url = `https://api.airtable.com/v0/${APP_ID}/SurveyData/${id}`;
    headers = {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
    }

    let response = await axios.patch(url, { fields }, { headers });

    if (response.status == 200) {
        return 1;
    } else {
        return 0;
    }
};

module.exports = {
    checkUserStatus,
    getRecordIdBySession,
    createSurveyRecord,
    updateSurveyRecord
};
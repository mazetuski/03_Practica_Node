'use strict';

// Dependencies
require('dotenv').config();
const connectMongoose = require('./connectMongoose');
const data = require('../advertisement');
const Advertisement = require('../models/Advertisement');
const readline = require('readline');

// Wait for open connection
connectMongoose.once('open', async () => {
    try {
        // wait for user response
        const response = await askUser(`Estás seguro de borrar la base de datos ${connectMongoose.name} s/n: `);
        // check if user accept
        if (response !== 's') {
            console.log('Aborted!');
            process.exit();
        }
        // Drop database
        await removeDatabase();
        // insert all data
        await insertFromData(data.anuncios);
        connectMongoose.close();
        console.log(`Close connection with ${connectMongoose.name}`);
    } catch (err) {
        console.error('Script Error:', err);
        process.exit(1);
    }
});

/**
 * Function that remove the database
 * @returns {Promise<any>}
 */
function removeDatabase() {
    return new Promise((resolve, rejected) => {
        // remove database
        connectMongoose.dropDatabase(function (err) {
            // if error then exit
            if (err) {
                rejected('Error on drop database:' + err);
            }
            // all good then resolve
            console.log('Database ' + connectMongoose.name + ' removed');
            resolve();
        });
    })
}

/**
 * Function that ask user if he wants to run the script
 * @param question
 * @returns {Promise<any>}
 */
function askUser(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    })
}

/**
 * Function for insert new ads from data
 * @param data
 * @returns {Promise<void>}
 */
async function insertFromData(data) {
    try {
        // loop all advertisements and create advertisements Models
        for (const ad in data) {
            const newAd = new Advertisement(data[ad]);
            // save on database
            const adResponse = await newAd.save();
            console.log("Added: " + adResponse.id)
        }
        console.log('initialized database succesfully!');
    } catch (err) {
        console.log("Error insert data:", err);
        process.exit(1);
    }
}


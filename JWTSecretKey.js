/******************************************************************************
 * 
 * 
 * 
 * ITE5315 – Project
 * 
 * I declare that this assignment is my own work in accordance with Humber AcademicPolicy.
 * No part of this assignment has been copied manually or electronically from any othersource(including web sites) 
 * or distributed to other students.
 * 
 * 
 * 
 * Name: Dhvani Barot  Student ID: N01584917   Date:04/17/2024
 * 
 * 
 * 
 * ******************************************************************************/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to generate a random string
const generateRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};

// Generate JWT secret key
const jwtSecret = generateRandomString(32);

// Write JWT secret key to .env file
fs.writeFileSync(path.join(__dirname, '.env'), `JWT_SECRET=${jwtSecret}\n`, { flag: 'a' });

console.log('Generated JWT secret key:', jwtSecret);

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
 * Name: Dhvani Barot  Student ID: N01584917   Date:04/09/2024
 * 
 * 
 * 
 * ******************************************************************************/


const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  rating: Number,
  borough: String,
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;

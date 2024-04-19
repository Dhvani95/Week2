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

module.exports = {
  url : process.env.DB_CONNECTION_STRING
};

const mongoose = require('mongoose');
require('dotenv').config();

// Define restaurant schema
const RestaurantSchema = new mongoose.Schema({
  // Define schema fields here
  name: String,
  cuisine: String,
  rating: Number,
  borough: String,
});

// Create Restaurant model
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

const initializeDB = async () => {
  const connectionString = process.env.DB_CONNECTION_STRING;

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
};

const db = {
  initialize: initializeDB,

  addNewRestaurant: async (data) => {
    try {
      const newRestaurant = new Restaurant(data);
      await newRestaurant.save();
      return newRestaurant;
    } catch (error) {
      console.error('Error adding new restaurant:', error);
      throw error;
    }
  },

  getAllRestaurants: async (page, perPage, borough) => {
    try {
      const skip = (page - 1) * perPage;
      let query = Restaurant.find().sort('restaurant_id').skip(skip).limit(perPage);
      if (borough) {
        query = query.where('borough').equals(borough);
      }
      const restaurants = await query.exec();
      return restaurants;
    } catch (error) {
      console.error('Error getting all restaurants:', error);
      throw error;
    }
  },


 getRestaurantById: async (Id) => {
    try {
      const restaurant = await Restaurant.findById(Id);
      return restaurant;
    } catch (error) {
      console.error('Error getting restaurant by Id:', error);
      throw error;
    }
  },

updateRestaurantById: async (data, Id) => {
    try {
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(Id, data, { new: true });
      return updatedRestaurant;
    } catch (error) {
      console.error('Error updating restaurant by Id:', error);
      throw error;
    }
  },

  deleteRestaurantById: async (Id) => {
    try {
      const deletedRestaurant = await Restaurant.findByIdAndDelete(Id);
      return deletedRestaurant;
    } catch (error) {
      console.error('Error deleting restaurant by Id:', error);
      throw error;
    }
  },
};


module.exports = db;

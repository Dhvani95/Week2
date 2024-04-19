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

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const helpers = require('handlebars-helpers')();
const { body, param, query, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const randomBytes = require('random-bytes');
require('dotenv').config();
const db = require('./config/dbModule'); 

const app = express();
const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, './public/views'));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// User model
const User = mongoose.model('User', {
  username: String,
  password: String,
  role: { type: String, default: 'user' }, 
  token: String,
});

app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
  },
}));
app.set('view engine', '.hbs');

// Initialize MongoDB connection before starting the server
db.initialize(process.env.DB_CONNECTION_STRING)
  .then(() => {
    //ALL ROUTES 
    // User registration
   app.post('/register', async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ username, role }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
    const user = new User({ username, password: hashedPassword, role, token });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
    });
   // User login
  app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Received username:', username);
  console.log('Received password:', password);
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  res.json({ token: user.token, role: user.role });
});


const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};

    // Middleware to check if the user is an admin
    const isAdmin = (req, res, next) => {
    if (req.userRole === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  };
    // Define the /restaurants endpoint
    app.get('/api/restaurants', async (req, res) => {
      try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
        const borough = req.query.borough;

        const restaurants = await db.getAllRestaurants(page, perPage, borough);
        res.json(restaurants);
      } catch (error) {
        console.error('Error getting restaurants:', error);
        res.status(500).json({ error: error.message });
      }
    });

      //Get all restaurants
      app.get('/api/restaurants', async (req, res) => {
        try {
          const restaurants = await db.getAllRestaurants();
          res.json(restaurants);
        } catch (error) {
          console.error('Error getting all restaurants:', error);
          res.status(500).json({ error: 'Failed to get restaurants' });
        }
      });

      app.post('/api/restaurants', verifyToken, isAdmin,
        [
          body('name').notEmpty(),
          body('borough').notEmpty(),
          body('cuisine').notEmpty(),
          body('address.building').notEmpty(),
          body('address.street').notEmpty(),
          body('address.zipcode').notEmpty()
        ],
        async (req, res) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
      
          try {
            const newRestaurant = await db.addNewRestaurant(req.body);
            res.status(201).json(newRestaurant);
          } catch (error) {
            console.error('Error adding new restaurant:', error);
            res.status(500).json({ error: 'Error adding new restaurant' });
          }
        }
      );

      //Get restaurant by ID
      app.get('/api/restaurants/:id', async (req, res) => {
        const { id } = req.params;
        try {
          const restaurant = await db.getRestaurantById(id);
          if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
          }
          res.json(restaurant);
        } catch (error) {
          console.error('Error getting restaurant by Id:', error);
          res.status(500).json({ error: 'Failed to get restaurant' });
        }
      });

      //Update restaurant by ID
      app.put('/api/restaurants/:id', verifyToken, isAdmin, [
        body('name').notEmpty(),
        body('cuisine').notEmpty(),
        body('rating').isNumeric(),
        body('borough').notEmpty(),
      ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        try {
          const updatedRestaurant = await db.updateRestaurantById(req.body, id);
          if (!updatedRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
          }
          res.json(updatedRestaurant);
        } catch (error) {
          console.error('Error updating restaurant by Id:', error);
          res.status(500).json({ error: 'Failed to update restaurant' });
        }
      });

      //Delete restaurant by ID
      app.delete('/api/restaurants/:id', verifyToken, isAdmin, async (req, res) => {
        const { id } = req.params;
        try {
          const deletedRestaurant = await db.deleteRestaurantById(id);
          if (!deletedRestaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
          }
          res.json({ message: 'Restaurant deleted successfully' });
        } catch (error) {
          console.error('Error deleting restaurant by Id:', error);
          res.status(500).json({ error: 'Failed to delete restaurant' });
        }
      });

      //Display form to submit parameters
      app.get('/restaurants/form', (req, res) => {
        res.render('resform', { pageTitle: 'Restaurants Form' });
      });

      //Process form submission and display results
      app.post('/restaurants/form', async (req, res) => {
        const { page, perPage, borough } = req.body;
        try {
          const results = await db.getAllRestaurants(page, perPage, borough);
          const results1 = JSON.parse(JSON.stringify(results))
          res.render('resres', { pageTitle: 'Restaurant Results', results1 });

        } catch (error) {
          console.error('Error getting restaurant results:', error);
          res.status(500).json({ error: 'Failed to get restaurant results' });
        }
      });


   //New functionality Search restaurants
   app.get('/restaurants/search-form', (req, res) => {
    res.render('searchform', { pageTitle: 'Restaurants Search' });
  });

  // Route to handle search request
  app.get('/restaurants/search', async (req, res) => {
    const searchTerm = req.query.searchTerm;

    try {
      
      const restaurants = await db.getAllRestaurants(searchTerm);
      res.render('resres', { pageTitle: 'Search Results', restaurants });
    } catch (error) {
      console.error('Error searching restaurants:', error);
      res.status(500).json({ error: 'Failed to search restaurants' });
    }
  });

      // Start your Express server
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
  .catch((error) => {
    console.error('Error initializing MongoDB:', error);
  });


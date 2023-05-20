const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchuser  = require('../middleware/fetchuser')

// This is created code do not show to anyone this is put in .env.local file
const JWT_SECRET = process.env.JWT_SECRET;

// create a user using post "/api/auth/signin" no signin required
router.post('/signin',
  [
    // email and password validation 
    body('name', "Invalid Name").isLength({ min: 3 }),
    body('email', "Invalid Email or Used Email").isEmail(),
    body('password', "Password lenght should be 5").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // checking validation and throwing errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // check whether the email already exists
      let user = await User.findOne({ email: req.body.email });
      console.log("Error: ");
      if (user) {
        return res.status(400).json({ error: "Email is already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secured_password = await bcrypt.hash(req.body.password, salt);
      // save the data in database
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secured_password,
      })

      // creating authontification using id
      const data = {
        user: {
          id: user.id,
        }
      }
      // generating authontification token using authtoken
      const authToken = jwt.sign(data, JWT_SECRET);
      res.send({ success: "true", authToken: authToken });

    } catch (error) {
      console.log(error.message);
      res.status(500).send({ error: "server error" });
    }
  })

// login of a user '/api/auth/login'
router.post('/login', [
  // email validation 
  body('email', "Invalid Email or Used Email").isEmail(),
  body('password', "password cannot be blanked").exists(),
],
  async (req, res) => {
    // check whether the email already exists
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.status(400).json({ error: "Something went wrong try again" });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        res.status(404).send({ error: "Something went wrong try again" });
      }
      const passwor_compare = await bcrypt.compare(password, user.password);
      if (!passwor_compare) {
        res.status(404).send({ error: "Something went wrong try again" });
      }
      const payload = {
        user: {
          id: user.id,
        }
      }
      // generating authontification token using authtoken
      const authToken = jwt.sign(payload, JWT_SECRET);

      res.send({ success: "true", authToken: authToken });

    } catch (error) {
      console.log(error.message);
      res.status(500).send({ error: "server error" });
    }
  })

// get login user '/api/auth/userindetails' : login required
router.get('/userindetails',fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select(["-password", "-_id"]);
        res.send({user});
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ error: "server error" });
    }
})
// get login user '/api/auth/userindetails' : login required
router.get('/userindetails',fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select(["-password", "-_id"]);
        res.send({success: true,user : user});
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ error: "server error" });
    }
})

// delete account '/api/auth/deleteaccount' : login required
router.delete('/deleteaccount',fetchuser, async (req, res) => {
  try {
      let userId = req.user.id;
      const user = await User.findByIdAndDelete(userId);
      res.send({success: true});
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: "server error" });
  }
})


module.exports = router;
const express = require("express");
//import the check package, because express-validator is made of more packages
const { check, body } = require("express-validator/check");

const authController = require("../controllers/auth.js");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLoginPage);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
    body("password", 'Password has to be valid').isLength({min: 5}).isAlphanumeric().trim()
],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

//use the "check" method to check the email field on the incoming request,
//(and it looks for that field in the body, query parameters, headers, cookies and it finds that field)
//and then it checks if that is an valid email address. The "body" looks just in the request body.
//withMessage() will always refer to the method right in front of it, in our case isEmail() and it will "customize" the error message,
//because otherwise the default error message was "Invalid value".
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden.");
        // }
        // //if the validation succeeded, return true
        // return true;

        //the express validator package will check for the custom validator to return true/false/thrown Error/ Promise.
        //If it's a Promise (and this is our case, because every "then" block implicitly returns a promise), then express-validator
        //will wait for this Promise to be fulfilled. If it fulfills with nothing (so not any Promise.reject()), then it treats the validation
        //as successfull. If the Promise resolves with a rejection, which will happen in the "if" block, then the express-validatior will detect
        //the rejection and it will store it as an error.

        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email exists already. Please pick another one"
            );
          }
        });
      }).normalizeEmail(),

    //if you have an error message that applies for all the validations, put it as an argument in body()
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),

    body("confirmPassword").trim().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getResetPage);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPasswordPage);

router.post("/new-password", authController.postNewPassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const { body } = require("express-validator/check");

const adminController = require("../controllers/admin.js");
const isAuth = require("../middleware/is-auth.js");

//we dont't execute the getAddProductPage function, that's why we didn't write it like adminController.getAddProductPage().
//We just pass a reference to the function, so we are just telling express that it should take this function and store it
//and whenever a request is made to /admin/add-product route, then it should execute it

router.get("/add-product", isAuth, adminController.getAddProductPage);

router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 300 }),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/products", isAuth, adminController.getProductsPage);

router.get(
  "/edit-product/:productId",
  isAuth,
  adminController.getEditProductPage
);

router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 300 }),
  ],
  isAuth,
  adminController.postEditProduct
);

router.delete(
  "/product/:productId",
  isAuth,
  adminController.deleteProduct
);

module.exports = router;

const fileHelper = require('../util/file')
const { validationResult } = require("express-validator/check");

const Product = require("../models/product.js");

exports.getAddProductPage = (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: 'Attached file is not an image, please try again',
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: [],
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user._id,
  });
  product
    .save()
    .then(() => {
      console.log("Created product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProductPage = (req, res) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit product",
        path: "/admin/edit-product",
        editing: editMode,
        hasError: false,
        errorMessage: null,
        product: product,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId,
      },
      validationErrors: errors.array(),
    });
  }
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() != req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      if(image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = updatedDescription;
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    if(!product) {
      return next(new Error('Product not found'))
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({ _id: prodId, userId: req.user._id });
  }).then((result) => {
    console.log("DESTROYED PRODUCT");
    res.status(200).json({message: 'Success!'});
  })
  .catch((err) => {
    res.status(500).json({message: 'Deleting product failed!'});
  });

  

};

exports.getProductsPage = (req, res) => {
  Product.find({ userId: req.user._id })
    //populate() allows us to get all the detail information about a user, not just the id
    // .populate('userId')
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        path: "/admin/products",
        prods: products,
        pageTitle: "Admin products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

const fs = require('fs');
const path = require('path')

const PDFDocument = require('pdfkit')

const Product = require("../models/product.js");
const Order = require("../models/order.js");

const ITEMS_PER_PAGE = 1;

exports.getListOfProductsPage = (req, res) => {
  //the "+" is for converting from String to a Number
  const page = +req.query.page || 1;
  let totalItems;

  //with mongoose, find() will return an array of products, but the best practice in case of big data
  //would be to write find().cursor().next()
  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return  Product.find().skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then((products) => {
      res.render("shop/product-list", {
        pageTitle: "Products",
        path: "/products",
        prods: products,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product Details",
        path: "/productDetails",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndexPage = (req, res) => {
  //the "+" is for converting from String to a Number
  const page = +req.query.page || 1;
  let totalItems;

  //with mongoose, find() will return an array of products, but the best practice in case of big data
  //would be to write find().cursor().next()
  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return  Product.find().skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then((products) => {
      res.render("shop/index", {
        pageTitle: "Products",
        path: "/",
        prods: products,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCartPage = (req, res) => {
  //populate does not return a promise, that's why we used execPopulate
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log(user.cart.items);
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: user.cart.items,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addProductToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .removeProductFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.getOrdersPage = (req, res) => {
  Order.find({ "user.userId" : req.user._id}).then(orders => {

      res.render("shop/orders", {
        pageTitle: "Your orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));

};

exports.postOrderNow = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
        console.log("User cart", user.cart.items)
      const products = user.cart.items.map((item) => {
        return { quantity: item.quantity, product: { ...item.productId._doc} };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id,
        },
        products: products,
      });
      order.save();
    })
    .then((result) =>{
            return req.user.clearCart()})
            .then(result => {
                res.redirect("/orders")
            })
            .catch(err => {
                console.log(err)
            })
    .catch((err) => {
      console.log(err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if(!order){
      return next(new Error('No order found'))
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('Unauthorized'))
    }

    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    //.pipe() is connecting a readable stream to an writable stream

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {
      underline: true
    })

    pdfDoc.text('-------------------');
    let totalPrice = 0
    order.products.forEach(element => {
      pdfDoc.fontSize(14).text(element.product.title + ' - ' + element.quantity + ' x ' + ' $ ' + element.product.price) 
      totalPrice = totalPrice + ( element.quantity * element.product.price )
    });
    pdfDoc.text('--------')
    pdfDoc.fontSize(18).text('Total price: $' + totalPrice)

    pdfDoc.end();
    // fs.readFile(invoicePath, (err, data) => {
    //   if(err){
    //    return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
    //   res.send(data);
    // })
    
    //read the file step by step, in different chunks
    //const file = fs.createReadStream(invoicePath);

    //by using pipe(), we forward the data that is red with that stream to the response.
    //The response object is a writtable stream apparently and you can use readable streams to pipe it into the
    //writable stream
  }).catch(err => next(new Error(err)))

}

exports.getForumPage = (req, res) => {
  const userEmail = req.session.user.email
  res.render('shop/forum', {
    pageTitle:'Forum',
    path:'/forum',
    userEmail: userEmail
  })
}

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Product = require("../models/product.js")

const userSchema = new Schema({

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true
  },

  resetToken: String,
  resetTokenExpiration: Date,
  
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: { type: Number, required: true },
      },
    ],
  }


});

userSchema.methods.addProductToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
      return cartProduct.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
      });
    }

    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.removeProductFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []}
    return this.save();
}

module.exports = mongoose.model("User", userSchema);

// const mongodb = require("mongodb");

// const getDb = require("../util/database.js").getDb;

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .find({ _id: mongodb.ObjectId(userId) })
//       .next();
//   }

//   getCartPage() {
//     const db = getDb();
//     const productsId = this.cart.items.map((item) => {
//       return item.productId;
//     });
//     return db
//       .collection("products")
//       .find({ _id: { $in: productsId } })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find((cartItem) => {
//               return cartItem.productId.toString() === product._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   addProductToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
//       return cartProduct.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];
//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = { items: updatedCartItems };
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   deleteItemFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter((item) => {
//       return item.productId.toString() !== productId.toString();
//     });
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCartPage()
//       .then((cartProducts) => {
//         const order = {
//           items: cartProducts,
//           user: {
//             _id: new mongodb.ObjectId(this._id),
//             name: this.name,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection("orders").find( {'user._id': new mongodb.ObjectId(this._id)}).toArray();
//   }
// }

// module.exports = User;

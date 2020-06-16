const mongoose = require('mongoose')

//use the Schema constructor
const Schema = mongoose.Schema;

//create new Schema to which I pass an object. In that project I define the model for product
const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    //the reference for foreign key
    ref: 'User',
    required: true
  }
})

module.exports = mongoose.model('Product', productSchema)







// const mongodb = require('mongodb')

// //import getDb which allows us to get the connection to the database
// const getDb = require('../util/database.js').getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId){
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save(){
//     const db = getDb();
//     //database operation
//     let dbOp;
//     if(this._id) {
//       dbOp = db.collection('products').updateOne({ _id: this._id}, {$set: this})
//     }
//     else {
//       dbOp = db.collection('products').insertOne(this)
//     }

//     //collection() is used to tell mongodb which collection/table we want to work with
//     //insertOne() gets a javascript object, converts it into a json object and adds is to the database
//     return dbOp
//     .then(result => {
//       console.log(result)
//     })
//     .catch(err => console.log(err));
//   }

//   static fetchAll(){
//     const db = getDb();
//     //find() does not immediately return a promise, instead it returns a "cursor". 
//     //A cursor is an object provided by mongodb which allows us to go thorough our documents step by step, because teoretically,
//     //find() could of course return millions of documents and you don't want to transfer them over the wire all at once.
//     //Instead, find() gives us a handle which we can use to tell mongodb "ok, give me the next document. Ok, give me the next document, etc". 
//     //There is the method toArray() which tells mongodb to get all the documents and convert them into a javascript array, but you should
//     //only use that if you know that you don't have that many documents. Otherwise, implement pagination
//     return db
//     .collection('products')
//     .find()
//     .toArray()
//     .then(products => {
//       console.log(products);
//       return products;
//     })
//     .catch(err => {
//       console.log(err)
//     })
//   };

//   static findById(prodId) {
//     const db = getDb();
//     //mongodb stores the id like "_id" and it uses the special type ObjectId()
//     return db.collection('products').find({ _id: mongodb.ObjectId(prodId) }).next()
//     .then(product => {
//       console.log(product)
//       return product;
//     })
//     .catch(err => {console.log(err)})
//   };

//   static deleteById(prodId) {
//     const db = getDb();
//     return db.collection('products').deleteOne({ _id : mongodb.ObjectId(prodId)})
//     .then(result => {
//       console.log('Deleted!')
//     })
//     .catch(err => {
//       console.log(err)
//     })
//   } 
// }


// module.exports = Product
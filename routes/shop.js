const express = require("express")
const router = express.Router()

const shopController = require('../controllers/shop.js')
const isAuth = require('../middleware/is-auth.js')


router.get('/', shopController.getIndexPage)

router.get('/products', shopController.getListOfProductsPage);

router.get('/products/:productId', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCartPage);

router.post('/cart', isAuth, shopController.postCart)

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct)


router.get('/orders', isAuth, shopController.getOrdersPage)

router.get('/orders/:orderId', isAuth, shopController.getInvoice)

router.post('/create-order', isAuth, shopController.postOrderNow)

router.get("/forum", isAuth, shopController.getForumPage)

module.exports = router
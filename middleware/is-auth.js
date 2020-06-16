module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn) {
        return res.redirect('/login')
    }
    //if the user is logged in, call next() with allows the flow to continue
    next();
}
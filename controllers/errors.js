exports.getPageNotFound = (req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page not found!', path:'pageNotFound', isAuthenticated: req.session.isLoggedIn})
}

exports.get500 = (req, res, next) => {
    res.status(404).render('500', {pageTitle: 'Error', path:'/500', isAuthenticated: req.session.isLoggedIn})
}
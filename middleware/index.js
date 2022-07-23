var Product = require("../models/product");
var Comment = require("../models/comment");
var User = require("../models/user");
var middlewareObj = {};

middlewareObj.checkProductOwnership = function(req, res, next) {
  Product.findById(req.params.id, function(err, foundProduct) {
    if (err || !foundProduct) {
      req.flash("error", "Sorry, that product does not exist!");
      res.redirect("/product");
    } else if (
      foundProduct.author.id.equals(req.user._id) ||
      req.user.isAdmin
    ) {
      req.product = foundProduct;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/product/" + req.params.id);
    }
  });
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err || !foundComment) {
      req.flash("error", "Sorry, that comment does not exist!");
      res.redirect("/product");
    } else if (
      foundComment.author.id.equals(req.user._id) ||
      req.user.isAdmin
    ) {
      req.comment = foundComment;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/product/" + req.params.id);
    }
  });
};

middlewareObj.checkProfileOwnership = function(req, res, next) {
  User.findById(req.params.user_id, function(err, foundUser) {
    if (err || !foundUser) {
      req.flash("error", "Sorry, that user doesn't exist");
      res.redirect("/product");
    } else if (foundUser._id.equals(req.user._id) || req.user.isAdmin) {
      req.user = foundUser;
      next();
    } else {
      req.flash("error", "You don't have permission to do that!");
      res.redirect("/product/" + req.params.user_id);
    }
  });
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that!");
  res.redirect("/login");
};

module.exports = middlewareObj;

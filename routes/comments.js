var express = require("express");
var router = express.Router({ mergeParams: true });
var Product = require("../models/product");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Comments new
router.get("/new", middleware.isLoggedIn, function(req, res) {
  Product.findById(req.params.id, function(err, product) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { product: product });
    }
  });
});

// Comments create
router.post("/", middleware.isLoggedIn, function(req, res) {
  Product.findById(req.params.id, function(err, found) {
    if (err) {
      console.log(err);
    }
    var ratedArray = [];
    found.hasRated.forEach(function(rated) {
      ratedArray.push(String(rated));
    });
    if (ratedArray.includes(String(req.user._id))) {
      req.flash(
        "error",
        "You've already reviewed this product, please edit your review instead."
      );
      res.redirect("/product/" + req.params.id);
    } else {
      Product.findById(req.params.id, function(err, product) {
        if (err) {
          console.log(err);
          res.redirect("/product");
        } else {
          var newComment = req.body.comment;
          Comment.create(newComment, function(err, comment) {
            if (err) {
              req.flash("error", "Something went wrong.");
              res.render("error");
            } else {
              // add username and id to comment
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              product.hasRated.push(req.user._id);
              product.rateCount = product.comments.length;
              // save comment
              comment.save();
              product.comments.push(comment);
              product.save();
              req.flash("success", "Successfully added review!");
              res.redirect("/product/" + product._id);
            }
          });
        }
      });
    }
  });
});

// COMMENT EDIT ROUTE
router.get(
  "/:comment_id/edit",
  middleware.isLoggedIn,
  middleware.checkCommentOwnership,
  function(req, res) {
    res.render("comments/edit", {
      product_id: req.params.id,
      comment: req.comment
    });
  }
);

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Review updated!");
      res.redirect("/product/" + req.params.id);
    }
  });
});

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      res.redirect("back");
    } else {
      Product.findByIdAndUpdate(
        req.params.id,
        { $pull: { comments: { $in: [req.params.comment_id] } } },
        function(err) {
          if (err) {
            console.log(err);
          }
        }
      );
      Product.findByIdAndUpdate(
        req.params.id,
        { $pull: { hasRated: { $in: [req.user._id] } } },
        function(err) {
          if (err) {
            console.log(er);
          }
        }
      );
      req.flash("success", "Review deleted!");
      res.redirect("/product/" + req.params.id);
    }
  });
});

module.exports = router;

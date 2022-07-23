var express = require("express");
var router = express.Router();
var Product = require("../models/product");
var middleware = require("../middleware");
var options = {
  provider: "google",
  httpAdapter: "https",
  formatter: null
};
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

let cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dgiiiwpvi",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

var Fuse = require("fuse.js");

// INDEX - show all product
router.get("/", function(req, res) {
  var noMatch = null;
  if (req.query.search) {
    Product.find({}, function(err, allProduct) {
      if (err) {
        console.log(err);
      } else {        
        var options = {
          keys: ["name", "tags"],
          threshold: 0.1,
          isCaseSensitive: false,
        };
        var fuse = new Fuse(allProduct, options);
        var result = fuse.search(req.query.search);
        if (result.length < 1) {
          noMatch = req.query.search;
        }
        res.render("product/index", {
          product: result,
          noMatch: noMatch
        });
      }
    });
  } else if (req.query.sortby) {
    if (req.query.sortby === "rateAvg") {
      Product.find({})
        .sort({
          rateCount: -1,
          rateAvg: -1
        })
        .exec(function(err, allProduct) {
          if (err) {
            console.log(err);
          } else {
            res.render("product/index", {
              product: allProduct,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else if (req.query.sortby === "rateCount") {
      Product.find({})
        .sort({
          rateCount: -1
        })
        .exec(function(err, allProduct) {
          if (err) {
            console.log(err);
          } else {
            res.render("product/index", {
              product: allProduct,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else if (req.query.sortby === "priceLow") {
      Product.find({})
        .sort({
          price: 1,
          rateAvg: -1
        })
        .exec(function(err, allProduct) {
          if (err) {
            console.log(err);
          } else {
            res.render("product/index", {
              product: allProduct,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    } else {
      Product.find({})
        .sort({
          price: -1,
          rateAvg: -1
        })
        .exec(function(err, allProduct) {
          if (err) {
            console.log(err);
          } else {
            res.render("product/index", {
              product: allProduct,
              currentUser: req.user,
              noMatch: noMatch
            });
          }
        });
    }
  } else {
    Product.find({}, function(err, allProduct) {
      if (err) {
        console.log(err);
      } else {
        res.render("product/index", {
          product: allProduct,
          currentUser: req.user,
          noMatch: noMatch
        });
      }
    });
  }
});

// CREATE - add new product to db
router.post("/", middleware.isLoggedIn, upload.single("image"), function(
  req,
  res
) {
  cloudinary.v2.uploader.upload(
    req.file.path,
    {
      width: 1500,
      height: 1000,
      crop: "scale"
    },
    function(err, result) {
      if (err) {
        req.flash("error", err.message);
        return res.render("error");
      }
      req.body.product.image = result.secure_url;
      req.body.product.imageId = result.public_id;
      req.body.product.source = req.body.product.source;
      req.body.product.tags = req.body.product.tags.split(",");
      req.body.product.author = {
        id: req.user._id,
        username: req.user.username
      };
      Product.create(req.body.product, function (err, product) {
        if (err) {
          req.flash("error", err.message);
          return res.render("error");
        }
        res.redirect("/product");
      });
    },
    {
      moderation: "webpurify"
    }
  );
});

// NEW - show form to create new product
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("product/new");
});

// SHOW - shows more information about one product
router.get("/:id", function(req, res) {
  Product.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundProduct) {
      if (err || !foundProduct) {
        console.log(err);
        req.flash("error", "Sorry, that product does not exist!");
        return res.render("error");
      }
      var ratingsArray = [];

      foundProduct.comments.forEach(function(rating) {
        ratingsArray.push(rating.rating);
      });
      if (ratingsArray.length === 0) {
        foundProduct.rateAvg = 0;
      } else {
        var ratings = ratingsArray.reduce(function(total, rating) {
          return total + rating;
        });
        foundProduct.rateAvg = ratings / foundProduct.comments.length;
        foundProduct.rateCount = foundProduct.comments.length;
      }
      foundProduct.save();
      res.render("product/show", {
        product: foundProduct
      });
    });
});

// EDIT PRODUCT ROUTE
router.get(
  "/:id/edit",
  middleware.isLoggedIn,
  middleware.checkProductOwnership,
  function(req, res) {
    res.render("product/edit", {
      product: req.product
    });
  }
);

// UPDATE PRODUCT ROUTE
router.put(
  "/:id",
  upload.single("image"),
  middleware.checkProductOwnership,
  function (req, res) {
    
      req.body.product.source = req.body.product.source
      req.body.product.tags = req.body.product.tags.split(",");
      Product.findByIdAndUpdate(
        req.params.id,
        req.body.product,
        async function (err, product) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("back");
          } else {
            if (req.file) {
              try {
                await cloudinary.v2.uploader.destroy(product.imageId);
                var result = await cloudinary.v2.uploader.upload(
                  req.file.path,
                  {
                    width: 1500,
                    height: 1000,
                    crop: "scale",
                  },
                  {
                    moderation: "webpurify",
                  }
                );
                product.imageId = result.public_id;
                product.image = result.secure_url;
              } catch (err) {
                req.flash("error", err.message);
                return res.render("error");
              }
            }
            product.save();
            req.flash("success", "Successfully updated your product!");
            res.redirect("/product/" + req.params.id);
          }
        }
      );
    });

// DESTROY PRODUCT ROUTE
router.delete("/:id", middleware.checkProductOwnership, function(req, res) {
  Product.findById(req.params.id, async function(err, product) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(product.imageId);
      product.remove();
      res.redirect("/product");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.render("error");
      }
    }
  });
});

module.exports = router;

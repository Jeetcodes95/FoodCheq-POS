var express = require("express");
var router = express.Router();
const passport = require("passport");
const userModel = require("./users");
const productModel = require("./product");
const nodemailer = require("../nodemailer");
const localStrategy = require("passport-local");
const crypto = require("crypto");
const product = require("./product");
const multer = require("multer");
const path = require("path");
const cloudinary = require("./cloudinarySetup.js");
const dotenv = require("dotenv");
dotenv.config();

router.use(express.json());
passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(13, function (err, buff) {
      const fn = buff.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
    });
  },
});

const upload = multer({ storage: storage });

router.post(
  "/uploadLogo",
  isLoggedIn,
  upload.single("image"),
  function (req, res, next) {
    userModel
      .findOne({ username: req.session.passport.user })
      .then(async function (user) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${user._id}_logo`,
          });
          req.file.filename = result.url;
          user.logo = req.file.filename;
          user.save().then(function () {
            res.redirect("back");
          });
        } catch (error) {
          console.log(error);
        }
      });
  }
);



/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { message: req.flash("message") });
});

router.get("/signup", function (req, res, next) {
  res.render("register", { message: req.flash("message") });
});

router.get("/profile", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "product",
    })
    .then(function (user) {
      productModel
        .find()
        .populate("userid")
        .then(function () {
          res.render("profile", { products: user.product, user });
        });
    });
});

router.get("/cartMobile", isLoggedIn, (req, res, next) => {
  userModel.findOne({ username: req.session.passport.user }).then((user) => {
    res.render("cartMobile", { user });
  });
});

router.get("/dashboard", isLoggedIn, (req, res, next) => {
  userModel.findOne({ username: req.session.passport.user }).then((user) => {
    res.render("dashboard", { user });
  });
});

router.get("/menu", isLoggedIn, (req, res, next) => {
  userModel.findOne({ username: req.session.passport.user }).then((user) => {
    res.render("menu", { message: req.flash("message"), user });
  });
});

router.post("/register", function (req, res, next) {
  let data = new userModel({
    shopname: req.body.shopname,
    username: req.body.username,
    email: req.body.email,
  });
  userModel
    .register(data, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function () {
      req.flash("message", "E-mail is already taken.");
      res.redirect("/signup");
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/cart",
    failureFlash: "Invalid Credentials, please enter correct email & password.",
    failureRedirect: "/",
  }),
  (req, res) => {}
);

router.get("/logout", (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}

router.get("/forgetPg", (req, res, next) => {
  res.render("forget", { message: req.flash("message") });
});
router.get("/sent", function (req, res, next) {
  res.render("sent");
});

router.get("/reset", function (req, res, next) {
  res.render("reset");
});

router.post("/forgot", async function (req, res, next) {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) {
    crypto.randomBytes(16, async (err, buff) => {
      var rnstr = buff.toString("hex");
      user.token = rnstr;
      await user.save();
      nodemailer(req.body.email, user._id, rnstr);
      res.redirect("/sent");
    });
  } else {
    req.flash(
      "message",
      "Account does not exists, please enter correct email."
    );
    res.redirect("/forgetPg");
  }
});

router.get("/reset/:userid/:token", async (req, res) => {
  let user = await userModel.findOne({ _id: req.params.userid });
  if (user.token === req.params.token) {
    res.render("reset", { id: user._id });
  } else {
    req.flash("message", "Failed! invalid request!");
    res.redirect("/");
  }
});

router.post("/reset/:id", async (req, res) => {
  let user = await userModel.findOne({ _id: req.params.id });
  user.setPassword(req.body.newpassword, async (err) => {
    await user.save();
    req.flash("message", "Password changed successfully!");
    res.redirect("/");
  });
});

router.post("/change", isLoggedIn, async function (req, res, next) {
  var user = await userModel.findOne({ username: req.session.passport.user });
  user.shopname = req.body.shopname;
  user.mobile = req.body.mobile;
  user.city = req.body.city;
  user.country = req.body.country;
  user.address = req.body.address;
  await user.save();
  res.redirect("back");
});

//Product section

router.post(
  "/create",
  isLoggedIn,
  upload.single("image"),
  function (req, res, next) {
    userModel
      .findOne({ username: req.session.passport.user })
      .then(async function (user) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          public_id: `${user._id}_logo`,
        });
        req.file.filename = result.url;

        productModel
          .create({
            userid: user._id,
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            photo: req.file.filename,
          })
          .then(async function (cr) {
            product.photo = req.file.filename;
            user.product.push(cr._id);
            await user.save().then(function () {
              req.flash("message", "Product created successfully!");
              res.redirect("back");
            });
          });
      });
  }
);

//GET: Update Product
router.get("/updateProduct/:id", isLoggedIn, (req, res, next) => {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "product",
    })
    .then((user) => {
      productModel
        .findOne()
        .populate("userid")
        .then(function (products) {
          res.render("updateproduct", {
            message: req.flash("message"),
            user,
            products,
          });
        });
    });
});

//POST: Update Product
router.post(
  "/updateProd",
  isLoggedIn,
  upload.single("image"),
  function (req, res, next) {
    userModel
      .findOne({ username: req.session.passport.user })
      .populate({
        path: "product",
      })
      .then(async function (user) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          public_id: `${product._id}_image`,
        });
        req.file.filename = result.url;

        productModel
          .findOneAndUpdate({
            userid: user._id,
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            photo: req.file.filename,
          })
          .then(async function (cr) {
            product.photo = req.file.filename;
            await user.save().then(function () {
              req.flash("message", "Product updated successfully!");
              res.redirect("back");
            });
          });
      });
  }
);

router.get("/home", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      productModel
        .find()
        .populate("userid")
        .then(function (products) {
          res.render("cart", { products, user });
        });
    });
});

router.get("/products", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "product",
    })
    .then(function (user) {
      productModel
        .find()
        .populate("userid")
        .then(function () {
          res.render("products", { products: user.product, user });
        });
    });
});


router.post("/add-to-cart", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(async function (user) {
      const item = await productModel.findOne({ _id: req.body.id });
      if (item) {
        const cart = user.cart;
        const isExisting = cart.items.findIndex(
          (objInItems) => objInItems.productId.toString() === req.body.id
        );
        if (isExisting >= 0) {
          cart.items[isExisting].qty += 1;
        } else {
          cart.items.push({
            productId: item._id,
            qty: 1,
            price: new Number(item.price),
          });
        }
        if (!cart.totalPrice) {
          cart.totalPrice = 0;
        }
        cart.totalPrice += new Number(item.price);
        user.save().then(function () {
          res.redirect("/cart");
        });
      }
    });
});

router.get("/cart", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "cart.items.productId",
      populate: {
        path: "userid",
      },
    })
    .populate({
      path: "product",
    })
    .then(function (user) {
      // console.log(user.product)
      // console.log(user.cart.items)
      res.render("cart", { products: user.product, user });
    });
});

router.get("/mobileCart", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "cart.items.productId",
      populate: {
        path: "userid",
      },
    })
    .populate({
      path: "product",
    })
    .then(function (user) {
      // console.log(user.product)
      // console.log(user.cart.items)
      res.render("cartMobile", { products: user.product, user });
    });
});

router.post("/deleteInCart", isLoggedIn, async function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(async function (user) {
      const cart = user.cart;
      const isExisting = cart.items.findIndex(
        (objInItems) => objInItems.productId.toString() === req.body.prodId
      );
      const item = await productModel.findById(req.body.prodId);
      if (isExisting >= 0) {
        cart.totalPrice -= item.price * cart.items[isExisting].qty;
        cart.items.splice(isExisting, 1);
        await user.save();
      }
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
});

router.post("/removeAllCart", isLoggedIn, async function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      let index = user.cart.items.length;
      user.cart.items.splice(0, index);
      user.cart.totalPrice = 0;
      user.save().then(function () {
        res.redirect("back");
      });
    });
});

//deleting product
router.get("/deleteProduct/:id", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then(function (user) {
      productModel.findOneAndDelete({ _id: req.params.id }).then(function () {
        res.redirect("back");
      });
    })
    .catch((err) => console.log(err));
});

// deleting user
router.get("/delete", isLoggedIn, function (req, res, next) {
  userModel
    .findOneAndDelete({ username: req.session.passport.user })
    .then(function () {
      res.redirect("back");
    });
});

// code to search items
router.get("/search/:key", isLoggedIn, function (req, res, next) {
  userModel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "cart.items.productId",
      populate: {
        path: "userid",
      },
    })
    .then(function (user) {
      productModel
        .find({
          $or: [
            { category: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { name: { $regex: req.params.key } },
          ],
        })
        .populate("userid")
        .then(function (products) {
          res.render("cart", { products: products, user });
        });
    });
});

router.get("/deleteAllUser", function (req, res, next) {
  userModel.deleteMany().then(function (deleted) {
    res.send(deleted);
  });
});

router.get("/deleteAllProd", function (req, res, next) {
  productModel.deleteMany().then(function (deleted) {
    res.send(deleted);
  });
});

module.exports = router;

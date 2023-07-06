const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const dotenv = require("dotenv");
dotenv.config();

const DB = async function connectDatabase() {
  try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database Successfully Connected!`);
} catch(error) {
    console.log(error.message);
} 
}();

// connectDatabase();

const userSchema = mongoose.Schema({
  shopname: String,
  username: String,
  password: String,
  email: String,
  mobile: String,
  logo: String,
  city: String,
  country: String,
  address: String,
  token: {
    type: String,
    default: ""
    },
  cart: {
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      qty: {
        type: Number,
      },
      price: {
        type: Number,
      }
    }],
  totalPrice: Number
  },
  orders: {
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      qty: {
        type: Number,
      },
      price: {
        type: Number,
      }
    }],
  totalPrice: Number
  },
  product: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }]
}, {timestamps: true}
);




userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
const mongoose = require('mongoose');

const productSchema=mongoose.Schema({
    userid:[{type:mongoose.Schema.Types.ObjectId, ref:"user"}],
    name: String,
    category: String,
    photo: String,
    price: String,
}, {timestamps: true}
);



module.exports = mongoose.model("product", productSchema);

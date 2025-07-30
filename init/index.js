const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/tripnest');
}

main().then((res) => {
    console.log("Connection Successful... ");
}).catch((err) => {
    console.log("ERROR", err);
});


const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj, 
        owner: "687d316959371b597c786d27",
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();
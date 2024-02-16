var express = require('express');
const mongoose= require('mongoose');

const connectDB = async() => {
    const url = process.env.DB_CONNECT;
    await mongoose.connect(url)
        .then(() => {
            console.log(`Connected to DB: ${url}`);
        })
        .catch((err) => {
            console.error(`Error connecting to DB: ${err.message}`);
            process.exit(1);
        });

    const dbConnection = mongoose.connection;

    await dbConnection.on("error", (err) => {
        console.error(`Error connecting to DB: ${err}`);
    });

    dbConnection.once("open", () => {
        console.log(`Connected to DB: ${url}`);
    });
};
//connectDB();
module.exports = connectDB;


 

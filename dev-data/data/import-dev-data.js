import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../../db/index.js";
import { Tour } from "../../models/tour.model.js";
import { User } from "../../models/user.model.js";
import { Review } from "../../models/review.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to DB
await connectDB();

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//? Import Data to DB
const importData = async () => {
    try {
        if(process.argv.includes("--users")) {
            await User.create(users, {
                validateBeforeSave: false 
            });
        }

        if(process.argv.includes('--tours')) {
            await Tour.create(tours);
        }

        if(process.argv.includes('--review')) {
            await Review.create(reviews);
        } 

        console.log("📅 Data inserted successfully!!");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

//? Delete data from DB
const deleteData = async () => {
    try {
        await User.deleteMany();   // this deletes all the data if nothing is passed
        console.log("Data deleted successfully!");
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

if (process.argv[2] === "--import") {
    importData();
} else if (process.argv[2] === "--delete") {
    deleteData();
}
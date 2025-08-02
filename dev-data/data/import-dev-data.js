import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../../db/index.js";
import { Tour } from "../../models/tour.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to DB
await connectDB();

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//? Import Data to DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("📅 Data inserted successfully!!");
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

//? Delete data from DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();   // this deletes all the data if nothing is passed
        console.log("Data deleted successfully!");
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

if(process.argv[2] === "--import") {
    importData();
} else if(process.argv[2] === "--delete") {
    deleteData();
}
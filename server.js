import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';

dotenv.config({ path: '.config.env' });

// const DB = process.env.DATABASE;
const port = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV;

connectDB()
    .then(() => {
        app.listen(port);
        console.log(`🪛 Server is running at: ${port} -- ${NODE_ENV}`);
    })
    .catch((err) => {
        console.log("MONGODB Connection Error", err);
    })

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled Exception. Terminating program...');
    
    process.exit(1);
})
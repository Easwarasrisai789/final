const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const fileupload = require('express-fileupload');

const app = express();
app.use(express.json());
app.use(cors());
app.use(fileupload());

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    try {
      await connectToMongoDB();
      console.log(`Server running on port ${PORT}`);
    } catch (error) {
      console.error('Error starting server:', error);
    }
});

// MongoDB Configuration
const url = 'mongodb://localhost:27017';
const dbName = 'MSWD';
let client; // Define client outside the connectToMongoDB function

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    client = new MongoClient(url, { useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Define routes

// API endpoint to insert booking details into the database
app.post('/api/bookings', async (req, res) => {
    try {
      const db = client.db(dbName);
      const collection = db.collection('booking');
      const { departurePlace, destinationPlace, name, email, flight } = req.body;
      const result = await collection.insertOne({ departurePlace, destinationPlace, name, email, flight });
      console.log('Booking inserted:', result.ops[0]);
      res.status(201).json({ message: 'Booking inserted successfully' });
    } catch (error) {
      console.error('Error inserting booking:', error);
      res.status(500).json({ message: 'Error inserting booking' });
    }
  });

//REGISTRATION MODULE
app.post('/registration/signup', async function(req, res){
    try
    {
        const db = client.db(dbName);
        const users = db.collection('users');
        const data = await users.insertOne(req.body);
        res.json("Registered successfully...");
    } catch(err) {
        res.json(err).status(404);
    }
});

//LOGIN MODULE
app.post('/login/signin', async function(req, res){
    try {
        const db = client.db(dbName);
        const users = db.collection('users');
        const data = await users.count(req.body);
        res.json(data);
    } catch(err) {
        res.json(err).status(404);
    }
});

//HOME MODULE
app.post('/home/uname', async function(req, res){
    try {
        const db = client.db(dbName);
        const users = db.collection('users');
        const data = await users.find(req.body, {projection:{firstname: true, lastname: true}}).toArray();
        res.json(data);
    } catch(err) {
        res.json(err).status(404);
    }
});

app.post('/home/menu', async function(req, res){
    try {
        const db = client.db(dbName);
        const menu = db.collection('menu');
        const data = await menu.find({}).sort({mid:1}).toArray();
        res.json(data);
    } catch(err) {
        res.json(err).status(404);
    }
});

app.post('/home/menus', async function(req, res){
    try {
        const db = client.db(dbName);
        const menus = db.collection('menus');
        const data = await menus.find(req.body).sort({smid:1}).toArray();
        res.json(data);
    } catch(err) {
        res.json(err).status(404);
    }
});

//CHANGE PASSWORD
app.post('/cp/updatepwd', async function(req, res){
    try {
        const db = client.db(dbName);
        const users = db.collection('users');
        const data = await users.updateOne({emailid : req.body.emailid}, {$set : {pwd : req.body.pwd}});
        res.json("Password has been updated")
    } catch(err) {
        res.json(err).status(404);
    }
});

//MY PROFILE
app.post('/myprofile/info', async function(req, res){
    try {
        const db = client.db(dbName);
        const users = db.collection('users');
        const data = await users.find(req.body).toArray();
        res.json(data);
    } catch(err) {
        res.json(err).status(404);
    }
});

//FILE UPLOAD
app.post('/uploaddp', async function(req, res){
    try {
        if (!req.files)
            return res.json("File not found");

        const myfile = req.files.myfile;
        const fname = req.body.fname;
        myfile.mv('../src/images/photo/' + fname + '.jpg', async function(err) {
            if (err)
                return res.json("File upload operation failed!");

            const db = client.db(dbName);
            const users = db.collection('users');
            const data = await users.updateOne({emailid: fname},{$set : {imgurl: fname + '.jpg'}});
            res.json("File uploaded successfully...");
        });
    } catch(err) {
        res.json(err).status(404);
    }
});

// Endpoint to handle flight booking form submissions
app.post('/bookflight', (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.flight) {
            throw new Error('Incomplete booking details');
        }
        const db = client.db(dbName);
        const collection = db.collection('bookings');
        const { name, email, flight } = req.body;
        const result = collection.insertOne({ name, email, flight });
        console.log('Booking inserted:', result.ops[0]);
        res.status(201).json({ message: 'Booking inserted successfully' });
    } catch (error) {
        console.error('Error inserting booking:', error);
        res.status(500).json({ message: 'Error inserting booking' });
    }
});


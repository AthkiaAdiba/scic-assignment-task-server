const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ui1n29x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const database = client.db("payLio");
        const userCollection = database.collection("users");



        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        });

        // Protected route to get user info
        // app.get('/api/auth/me', async (req, res) => {
        //     try {
        //         const user = await db.collection('users').findOne({ _id: new ObjectId(req.decoded.id) });
        //         res.send(user);
        //     } catch (err) {
        //         res.status(500).send({ message: 'Error fetching user info' });
        //     }
        // });


        app.post('/users', async (req, res) => {
            const { name, pin, mobileNumber, email } = req.body;

            const query = { email: email }
            const existing = await userCollection.findOne(query);
            if (existing) {
                return res.send({ message: 'User already exist', insertedId: null })
            }


            if (!name || !pin || !mobileNumber || !email) {
                return res.status(400).send({ message: 'All fields are required' });
            }
            if (!/^\d{5}$/.test(pin)) {
                return res.status(400).send({ message: 'PIN must be a 5-digit number' });
            }

            const hashedPin = bcrypt.hashSync(pin, 10);

            const newUser = {
                name,
                pin: hashedPin,
                mobileNumber,
                email,
                status: 'pending',
                balance: 0,
            };

            // console.log(req.headers)
            // const user = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('SCIC Assignment Task Project')
});

app.listen(port, () => {
    console.log(`SCIC Assignment Task Project on port: ${port}`)
});
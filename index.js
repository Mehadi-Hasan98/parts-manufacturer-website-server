const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.siws8wa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run(){
    try{

        await client.connect();
        const productsCollection = client.db("parts_manufacturer").collection("products");

        const reviewsCollection = client.db("parts_manufacturer").collection("reviews");

        const orderCollection = client.db("parts_manufacturer").collection("order");

        const usersCollection = client.db("parts_manufacturer").collection("users");

        const informationCollection = client.db("parts_manufacturer").collection("information");




        // GET API

        app.get('/product', async (req, res) =>{
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const productId = await productsCollection.findOne(query);
            res.send(productId);
        });


        app.get('/user', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
          });


          app.get('/admin/:email', async(req, res) =>{
            const email = req.params.email;
            const user = await usersCollection.findOne({email: email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin})
          });

          app.get("/information", async (req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const cursor = await informationCollection.find(query).toArray();
            res.send(cursor);
          });


        // Review GET API
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // Order GET API
        app.get('/order', async(req, res) =>{
            const query = req.body;
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        });

        app.get('/order/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const order = await orderCollection.findOne(query);
            res.send(order);
          });



        app.get("/myitems", async (req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const cursor = await orderCollection.find(query).toArray();
            res.send(cursor);
          });


         //   POST 

         app.post('/product', async(req, res) =>{
            const newItem = req.body;
            const result = await productsCollection.insertOne(newItem);
            res.send(result);
        });


        app.post('/review', async(req, res) =>{
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        });

        app.post('/order', async(req, res) =>{
            const query = req.body;
            const order = await orderCollection.insertOne(query);
            res.send(order);
        });

        app.post('/information', async(req, res) => {
            const query = req.body;
            const information = await informationCollection.insertOne(query);
            res.send(information);
        });



        // PUT Method

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
              $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            
            res.send(result);
          });


          app.put('/user/:email', async(req, res) =>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updateDoc = {
               $set: user,
             };
             const result = await usersCollection.updateOne(filter, updateDoc, options);
             const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
             res.send({result, token});
        });


        app.patch('/order/:id', async(req, res) =>{
            const id  = req.params.id;
            const payment = req.body;
            const filter = {_id: ObjectId(id)};
            const updatedDoc = {
              $set: {
                paid: true,
                transactionId: payment.transactionId
              }
            }
      
            const result = await paymentCollection.insertOne(payment);
            const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedOrder);
          })


            //  DELETE Method
        app.delete('/product/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });


        app.delete('/order/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });












        // update stock  quantity
    app.put("/product/:id", async (req, res) => {
    const id = req.params.id;
    const newQuantity = req.body;

    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        quantity: newQuantity.quantity,
      },
    };
    const result = await productsCollection.updateOne(
      filter,
      updatedDoc,
      options
    );
    res.send(result);
  });



    }finally{

    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello From Parts Manufacturer shop")
});

app.listen(port, () => {
    console.log(`Manufacturer app listening on port ${port}`);
});
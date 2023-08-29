const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewear
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xw5a4us.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
   
    const usersCollection = client.db("bistroDb").collection("users");
    const menuCollection = client.db("bistroDb").collection("menu");
    const reviewCollection = client.db("bistroDb").collection("reviews")
    const cartCollection = client.db("bistroDb").collection("carts")

  app.post('/jwt', (req, res) =>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res.send({token})
  })


// users Apis

app.get('/users', async (res, req) =>{
  const result = await usersCollection.find().toArray()
  res.send(result);
})


app.post('/users', async(req, res) =>{
  const user = req.body;
  console.log(user)
  const query = {email:user.email}
  const exitingUser = await usersCollection.findOne(query);
  if(exitingUser){
    console.log('exiting user', exitingUser)
return res.send({message: 'user already exists'})
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
})

app.patch('/users/admin/:id', async (req, res) =>{
  const id = req.params.id;
  const filter = { _id : new ObjectId(id)}
  const updateDoc = {
    $set: {
      role: 'admin'
    },
  };
const result = await usersCollection.updateOne(filter, updateDoc);
res.send(result);
})


// Menu Collection apis
    app.get('/menu', async(req, res) =>{
      const result = await menuCollection.find().toArray();
      res.send(result);
    })
    
// review Collection apis

    app.get('/reviews', async(req, res)=>{
      const result = await reviewCollection.find().toArray()
      res.send(result);
    })

// cart Collection apis

app.get('/carts', async(req, res)=>{
  const email  = req.query.email;
  console.log(email);
  if(!email){
   res.send([]);
  }
  const query = {email : email};
  const result = await cartCollection.  find(query).toArray();
  res.send(result);
});

app.post('/carts', async (req, res) =>{
  const item = req.body;
  console.log(item);
  const result = await cartCollection.insertOne(item);
  res.send(result);
})

app.delete('/carts/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id) };
  const result = await cartCollection.deleteOne(query);
  res.send(result);
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("bistro boss is sitting");
});
app.listen(port, () => {
  console.log(`bistro boss is sitting on port ${port}`);
});



/***
 * .........................
 * Namming Convention 
 * .........................
 * user =  UserCollection
 * app.get('/user')
 * app.get('/user/:id')
 * app.post('/user')
 * app.patch('/user/:id')
 * app.put('/user/:id')
 * app.delete('user/:id')
 * 
 * */ 
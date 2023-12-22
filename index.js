const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_KEY}@cluster0.ltwp59m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //change menuCollection with database name and collection.
    const taskCollection = client.db('mtasks').collection('task');

    app.get('/api/v1/task/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/api/v1/task', async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.delete('/api/v1/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.put('/api/v1/task/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTask = req.body;
      updatedTask.update = new Date();
      const task = {
        $set: {
          priority: updatedTask.priority,
          Title: updatedTask.Title,
          Description: updatedTask.Description,
          Deadline: updatedTask.Deadline,
          status: updatedTask.status,
          update: updatedTask.update,
        },
      };
      const result = await taskCollection.updateOne(filter, task, options);
      res.send(result);
    });

    app.patch('/api/v1/task', async (req, res) => {
      const id = req.query.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await taskCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// testing
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

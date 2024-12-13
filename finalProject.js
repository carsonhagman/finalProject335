const path = require("path"); //was require
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) //was require
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */
const http = require('https');
const axios = require('axios');



const bodyParser = require("body-parser");
const portNumber = 3000;

const { MongoClient, ServerApiVersion } = require('mongodb');
const { name } = require("ejs");


const uri = process.env.MONGO_CONNECTION_STRING;

let db;

/* Our database and collection */
const databaseAndCollection = {db: "CMSC335DB", collection:"jokes"};

const httpSuccessStatus = 200;
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + '/templates'));

/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));

/* view/templating engine */
app.set("view engine", "ejs");





const client = new MongoClient(uri, {  serverApi: ServerApiVersion.v1 });

client.connect()
    .then(client => {
        db = client.db(databaseAndCollection.db);
    })
    .catch(err => {
        console.error(e);
    });






    
    


app.get('/', (req, res) => {

    res.render("home");  
    
});

app.get('/api', async (req, res) => {


    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      
        
        const filteredData = {
        setup: response.data.setup,      
        punchline: response.data.punchline 
      };
  
      
      res.json(filteredData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching data');
    }
});


app.get("/sendInAJoke", (request, response) => {

    response.render("jokeForm");
    
});


app.get("/deleteMyJokes", (request, response) => {

    response.render("deleteMyJokes");
    
});


app.get("/seeAllJokes", async (request, response) => {

    let filter = {};

    try {
        
        const cursor = client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find(filter);
        
        const resultArray = await cursor.toArray();
        let result = resultArray;

        const jokes = {
            result
        };
        response.render("seeAllJokes", jokes);
    } catch (e) {
        console.error(e);
    }

    
    
});


app.post("/submission", async (request, response) => {

    let {namey, jokey} =  request.body;

   let name = namey;
   let joke = jokey;


  // Create a new user object
  const newJoke = {
    name,
    joke
  };

  

  try {
   
    const usersCollection = db.collection('jokes');
    await usersCollection.insertOne(newJoke);
    response.render("submission", newJoke);
  } catch (err) {
    console.error('Error saving to MongoDB:', err);
    response.status(500).send('Failed to save form data');
  }

    

});


app.post("/deleteSubmission", async (request, response) => {

    let {namey} =  request.body;

    let name = namey; 
    const person = {
        name
    };


   let filter = {name: namey};

    try {
        
        await client.db(databaseAndCollection.db)
                .collection(databaseAndCollection.collection)
               .deleteOne(filter);
        response.render("deleteSubmission", person)
    } catch (e) {
        console.error(e);
    }
});












app.listen(portNumber); 
console.log(`Web server started and running at http://localhost:${portNumber}`);
console.log("Stop to shutdown the server: ");
process.stdin.setEncoding("utf8"); /* encoding */
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
		const command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  /* exiting */
        } else {
			/* After invalid command, we cannot type anything else */
			console.log(`Invalid command: ${command}`);
		}
    }
});
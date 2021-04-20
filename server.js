/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable require-jsdoc */
'use strict';
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended: true}));
// Specify a directory for static resources
app.use(express.static('./public/'));
// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine', 'ejs');
// Use app cors
app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
function homePage(req, res) {
  const url = 'thesimpsonsquoteapi.glitch.me/quotes?count=10';
  //   superagent.get(url).then(data=>{
  //       res.render('pages/index', {array: data.body});
  //   }).catch(err => console.log(err.message));
  superagent.get(url).set('User-Agent', '1.0').then((data) =>{
    const array = data.body.map((el)=>{
      return new Simpson(el);
    });
    res.render('pages/index', {array: array});
  }).catch((err) => console.log(err.message));
}
const addToFavorite = (req, res) =>{
const {quote, character, image} = req.body;
const value = [quote, character, image];
const insertInto = 'insert into characters(quote , character ,image) values($1,$2,$3);';
client.query(insertInto, value).then(()=>{
    res.redirect('/favorite-quotes');
});
};

const renderFavorite = (req, res) =>{
const selectQuery = 'select * from characters ';
client.query(selectQuery).then((data)=>{
    res.render('pages/favorite-list', {array: data.rows});
});
};

const renderDetails = (req, res) => {
    const id = req.params.id;
    const sql = 'select * from characters where id =$1';
    const values = [id];
    client.query(sql, values).then((data) =>{
res.render('pages/details', {array: data.rows});
    });
};

const deleteCharacter = (req, res)=>{
    const id = req.params.id;
    const values = [id];
    const sql = 'delete from characters where id =$1';
    client.query(sql, values).then(() =>{
        res.redirect('/favorite-quotes');
});
};

const updateCharacter = (req, res) =>{
    const id = req.params.id;
    const {quote, character, image} = req.body;
    const values = [quote, character, image, id];
    const sql = 'update characters set quote=$1 , character=$2 ,image=$3  where id =$4';
    client.query(sql, values).then(() =>{
res.redirect(`/favorite-quotes/${id}`);
});
};

app.get('/', homePage);
app.post('/favorite-quotes', addToFavorite);
app.get('/favorite-quotes', renderFavorite);
app.get('/favorite-quotes/:id', renderDetails);
app.delete('/favorite-quotes/:id', deleteCharacter);
app.put('/favorite-quotes/:id', updateCharacter);
// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --

// helper functions

const errorHandler = (err) =>{

};

function Simpson(data) {
  this.quote = data.quote,
  this.character = data.character,
  this.image = data.image;
};


// app start point
client.connect().then(() =>
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`)),
);

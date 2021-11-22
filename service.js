const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const connection = mysql.createConnection(credentials);

const service = express();
service.use(express.json());

service.use((request, response, next) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  response.set("Access-Control-Allow-Headers", "Content-Type");

  next();
});

service.options('*', (request, response) => {
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  response.sendStatus(200);
});

connection.connect(error => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});

function rowFormat(row) {
  return {
    id: row.id,
    amount: row.amount,
    year: row.year,
    month: row.month,
    day: row.day,
    description: row.description,
    created: row.created_at,
    updated: row.updated_at,
  };
}


// Select with no wildcards
function selectAll(query, response) {

  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
        results: rows.map(rowFormat),
      });
    }
  });

}


// Select with wildcards
function select(query, params, response) {

  connection.query(query, params, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
        results: rows.map(rowFormat),
      });
    }
  });

}


// Insert Function
function insert(query, params, response) {

  connection.query(query, params, (error, result) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
        results: result.insertId,
      });
    }
  });

}

/********************* ENDPOINTS BELOW *********************/

/**************** SELECTS ****************/


// Query for all expenses
service.get('/all', (request, response) => {

  const query = 'SELECT * FROM expenses ORDER BY year DESC, month DESC, day DESC';
  selectAll(query, response);

});


// Returns the net amount of money spent (Sum of all amounts in DB).
service.get("/net", (request, response) => {

  const query = 'SELECT SUM(amount) as total from expenses';

  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {

      response.json({
        ok: true,
        results: {
          total: rows[0].total,
        },
      });
    }
  });

});

// Query for expense by Keyword
service.get('/keyword/:key', (request, response) => {
  const params = [
    request.params.key,
  ];

  const query = "SELECT * FROM expenses WHERE description LIKE '%?%'";

  select(query, params, response);

});


// Query for expense by ID
service.get('/id/:id', (request, response) => {
  const params = [
    parseInt(request.params.id),
  ];

  const query = 'SELECT * FROM expenses WHERE id = ?';

  select(query, params, response);

});

// Query for expenses from a certain year
service.get('/expenses/:year', (request, response) => {

  const params = [
    request.params.year
  ];
  const query = 'SELECT * FROM expenses WHERE year = ? ORDER BY year DESC, month DESC, day DESC';

  select(query, params, response);

});

// Query for expenses from a certain month
service.get('/expenses/:year/:month', (request, response) => {

  const params = [
    request.params.year,
    request.params.month
  ];
  const query = 'SELECT * FROM expenses WHERE year = ? AND month = ? ORDER BY year DESC, month DESC, day DESC';

  select(query, params, response);

});

// Query for expenses from a certain day
service.get('/expenses/:year/:month/:day', (request, response) => {

  const params = [
    request.params.year,
    request.params.month,
    request.params.day
  ];
  const query = 'SELECT * FROM expenses WHERE year = ? AND month = ? AND day = ? ORDER BY year DESC, month DESC, day DESC';

  select(query, params, response);

});


/**************** INSERTS ****************/


// Query for inserting a new row into database (Date Given)
service.post('/expenses', (request, response) => {

  if (request.body.hasOwnProperty('amount') &&
    request.body.hasOwnProperty('year') &&
    request.body.hasOwnProperty('month') &&
    request.body.hasOwnProperty('day') &&
    request.body.hasOwnProperty('description')) {

    const params = [
      parseFloat(request.body.amount).toFixed(2),
      parseInt(request.body.year),
      parseInt(request.body.month),
      parseInt(request.body.day),
      request.body.description,
    ];

    const query = 'INSERT INTO expenses(amount, year, month, day, description) VALUES (?, ?, ?, ?, ?)';

    insert(query, params, response);

  } else {

    response.status(400);
    response.json({
      ok: false,
      results: 'Incomplete expenses data.',
    });
  }

});

/**************** UPDATE ****************/


// Update a specific expense found by ID
service.patch('/expenses/:id', (request, response) => {

  const params = [
    parseFloat(request.body.amount).toFixed(2),
    parseInt(request.body.year),
    parseInt(request.body.month),
    parseInt(request.body.day),
    request.body.description,
    parseInt(request.params.id),
  ];

  const query = 'UPDATE expenses SET amount = ?, year = ?, month = ?, day = ?, description = ? WHERE id = ?';
  connection.query(query, params, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});


/**************** DELETE ****************/

// Query Delete an entry form the DB.
service.delete('/expenses/:id', (request, response) => {
  const parameters = [parseInt(request.params.id)];

  const query = 'DELETE FROM expenses WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});


service.get("/report.html", (request, response) => {
  var options = {
    root: path.join(__dirname)
  };

  var fileName = 'report.html';
  response.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});


const port = 5001;
service.listen(port, () => {
  console.log(`We're live in port ${port}!`);
});


// curl http://localhost:5001/all

// curl http://localhost:5001/net

// curl http://localhost:5001/id/4

// curl http://localhost:5001/year/2015

// curl http://localhost:5001/month/4/2015

// curl http://localhost:5001/day/4/10/2015

// curl --header 'Content-Type: application/json' \
// --data '{"amount": 49.99, "year": 2013, "month": 2, "day": 3, "description": "Got my first bike!"}' \
// http://localhost:5001/expenses

// curl --header 'Content-Type: application/json' \
// --request PATCH \
// --data '{"amount": 49.59, "year": 2013, "month": 2, "day": 3, "description": "Got my first bike!"}' \
// http://localhost:5001/expenses/4

// curl --request DELETE http://localhost:5001/expenses/6
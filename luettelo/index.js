require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const app = express();
const Person = require("./models/person");

app.use(express.json());
app.use(express.static("dist"));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:", request.path);
  console.log("Body:", request.body);
  console.log("---");
  next();
};

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// let persons = [
//     {
//         id: "1",
//         name: "Arto Hellas",
//         number: "040-123456"
//     },
//     {
//         id: "2",
//         name: "Ada Lovelace",
//         number: "39-44-5323523"
//     },
//     {
//         id: "3",
//         name: "Dan Abramov",
//         number: "12-43-234345"
//     },
//     {
//         id: "4",
//         name: "Mary Poppendieck",
//         number: "39-23-6423122"
//     },
// ]

app.use(requestLogger);

app.get("/api/persons", (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

app.get("/info", (request, response) => {
  Person.countDocuments({})
    .then(count => {
        const date = new Date()
        response.send(
            `<p>Phonebook has info for ${count} people</p><p>${date}</p>`
        )
    })
    .catch(error => next(error))
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const generateId = () => {
  const min = persons.length;
  const max = 100;
  const rng = Math.floor(Math.random() * (max - min) + min);
  return String(rng);
};

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: "name missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  })
  .catch(error => next(error))
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }
      person.name = name;
      person.number = number;

      return person.save().then((updatedNumber) => {
        response.json(updatedNumber);
      });
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if(error.name === "ValidationError"){
    return response.status(400).json({ error: error.message })
  }

  return response.status(500).json({ error: "An unexpected error occurred" })

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

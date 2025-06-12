const express = require("express");
const morgan = require("morgan");
const app = express()

app.use(express.json())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method)
    console.log("Path:", request.path)
    console.log("Body:", request.body)
    console.log("---")
    next()
}

morgan.token("body", (req) => JSON.stringify(req.body))

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))


let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    },
]

app.use(requestLogger)

app.get("/api/persons", (request, response) => {
    response.json(persons)
})

app.get("/info", (request, response) => {
    const newDate = new Date();
    response.send(`<p>Phonebook has info for ${persons.length} people</p><br>${newDate}`)
})

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id) 
    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end
})

const generateId = () => {
    const min = persons.length
    const max = 100
    const rng = Math.floor(Math.random() * (max - min) + min)
    return String(rng)
}

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if(!body.name || !body.number){
        return response.status(400).json({
            error: "name or phone number missing"
        })
    }

    if(persons.find((p) => p.name === body.name)){
        return response.status(400).json({
            error: "trying to create duplicate entry with existing name"
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

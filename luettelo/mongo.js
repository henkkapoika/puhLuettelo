const mongoose = require("mongoose")

if(process.argv.length < 3){
    console.log("give password")
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.ufhuqhv.mongodb.net/catalogApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const catalogSchema = new mongoose.Schema({
    name: String,
    number: Number,
})

const Person = mongoose.model("Person", catalogSchema)

if(process.argv.length === 3){
    Person.find({}).then(result => {
        console.log("Phonebook:")
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length === 5){
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({ name, number })

    person.save().then(() => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    console.log("Usage:")
    console.log("  node mongo.js <password>")
    console.log("  node mongo.js <password> <name> <number>")
    mongoose.connection.close()
}
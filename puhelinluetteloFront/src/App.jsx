import { useState, useEffect } from "react";
import personService from "./services/persons";

const Notification = ({message, type}) => {
  if(!message){
    return null
  }

  return (
    <div className={type === "error" ? "notification error" : "notification success"}>
      {message}
    </div>
  )
}

const Number = ({ personsToShow, handleDelete }) => {
  return (
    <>
      {personsToShow.map((person) => (
        <p key={person.name}>
          {person.name} {person.number}
          <button onClick={() => handleDelete(person.id, person.name)}>
            Delete
          </button>
        </p>
      ))}
    </>
  );
};

const AddNewPerson = ({
  addNewPerson,
  newName,
  handleInput,
  newNumber,
  handleNumber,
}) => {
  return (
    <form onSubmit={addNewPerson}>
      <div>
        name: <input value={newName} onChange={handleInput} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumber} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Filter = ({ filter, handleFilter }) => {
  return (
    <div>
      filter shown with <input value={filter} onChange={handleFilter} />
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");

  const [newNumber, setnewNumber] = useState("");

  const [filter, setFilter] = useState("");

  const [errorMessage, setErrorMessage] = useState("")
  const [notificationType, setNotificationType] = useState("success")

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const handleDelete = (id, name) => {
    if(window.confirm(`Are you sure you want to delete ${name}?`)){
      personService.deletePerson(id).then(() => {
        setPersons(persons.filter(person => person.id !== id))
        setErrorMessage(`Deleted ${name} successfully!`)
        setNotificationType("success");
        setTimeout(() => setErrorMessage(null), 3000)
      })
      .catch(error => {
        setErrorMessage(`Failed to delete ${name}`)
        setNotificationType("error")
        setTimeout(() => setErrorMessage(null), 3000)
      })
    }
  }

  const handleFilter = (event) => {
    setFilter(event.target.value);
  };

  const personsToShow = filter
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons;

  const handleInput = (e) => {
    setNewName(e.target.value);
    console.log(e.target.value);
  };

  const handleNumber = (e) => {
    setnewNumber(e.target.value);
    console.log(e.target.value);
  };

  const addNewPerson = (event) => {
    event.preventDefault();
    const existingPerson = persons.find((p) => p.name === newName)
    const person = {
      name: newName,
      number: newNumber,
    };
    if (existingPerson) {
      if(window.confirm(`${newName} is already added to phonebook, do you want to replace the old number with new one?`)){
        personService.update(existingPerson.id, {...existingPerson, number: newNumber}).then((returnedPerson) => {
          setPersons(persons.map((p) => (p.id !== existingPerson.id ? p : returnedPerson)))
          setErrorMessage(`Updated ${returnedPerson.name} number successfully!`)
          setNotificationType("success");
          setTimeout(() => setErrorMessage(null), 3000)
          setNewName("");
          setnewNumber("")
        })
        .catch(error => {
          setErrorMessage(`Failed to change ${existingPerson.name} number`)
          setNotificationType("error")
          setTimeout(() => setErrorMessage(null), 3000)
        })
      }
    } else {
      personService.post(person).then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setErrorMessage(`Added ${returnedPerson.name} successfully!`)
        setNotificationType("success");
        setTimeout(() => setErrorMessage(null), 3000)
        setNewName("");
        setnewNumber("")
      })
      .catch(error => {
        setErrorMessage(error.response.data.error)
        setNotificationType("error")
        setTimeout(() => setErrorMessage(null), 3000)
      })
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} type={notificationType} />
      <Filter filter={filter} handleFilter={handleFilter} />
      <h2>add a new</h2>
      <AddNewPerson
        addNewPerson={addNewPerson}
        newName={newName}
        handleInput={handleInput}
        newNumber={newNumber}
        handleNumber={handleNumber}
      />
      <h2>numbers</h2>
      <Number personsToShow={personsToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;

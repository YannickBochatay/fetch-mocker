# fetch-mocker
mocker for fetch requests in browser

### Installation
```shell
npm install fetch-mocker
```

### Example
```javascript
import Mocker from "fetch-mocker"

const mocker = new Mocker()

mocker.requestDelay = 1000

let persons = [
  { id : "1", civility : "mister", firstName : "Jean", lastName : "Dupont" },
  { id : "2", civility : "madame", firstName : "Catherine", lastName : "Durand" },
  { id : "3", civility : "mister", firstName : "Jean-Pierre", lastName : "Martin" }]

mocker.get("/api/persons", () => persons)

const findPerson = id => persons.find(item => item.id === id)

mocker.get("/api/persons/:id", request => {

  const id = request.params.id
  const person = findPerson(id)

  return person ? person : mocker.makeResponse("Unknown person", 404)

})

mocker.delete("/bcu/persons/:id", request => {

  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

})

mocker.put("/api/persons/:id", request => {

  const id = request.params.id
  const fields = JSON.parse(request.body)
  const person = findPerson(id)

  if (!person) return mocker.makeResponse("Unknown person", 404)

  for (const n in fields) {
    if (person.hasOwnProperty(n)) person[n] = fields[n]
  }

  return person

})

mocker.post("/api/persons/", request => {

  const newPerson = JSON.parse(request.body)

  const id = Number(persons[persons.length - 1].id) + 1

  newPerson.id = String(id)

  persons.push(newPerson)

  return { id }

})

mocker.enable()
```

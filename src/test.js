/* eslint no-unused-expressions:0*/
import "babel-polyfill"
import Mocker from "./"

const log = console.log.bind(console)

describe("Mocker", () => {

  const mocker = new Mocker()

  mocker.requestDelay = 50

  it("should add routes", () => {

    mocker.get("/toto", () => "toto")
    mocker.post("/toto", () => {})
    mocker.put("/toto", () => {})
    mocker.delete("/toto", () => {})

    expect(mocker.routes.GET["/toto"]).to.be.a("function")
    expect(mocker.routes.POST["/toto"]).to.be.a("function")
    expect(mocker.routes.PUT["/toto"]).to.be.a("function")
    expect(mocker.routes.DELETE["/toto"]).to.be.a("function")

  })

  it("should return handlers", () => {

    const handlers = mocker._getHandlers("get")

    expect(handlers).to.have.property("/toto")

  })

  it("should return route", () => {

    const route = mocker._getRoute("get", "/toto")

    expect(route).to.be.a("string")

  })

  it("should add routes with params", () => {

    mocker.get("/toto/:type/:id", () => {})
    mocker.post("/toto/:type/:id", () => {})
    mocker.put("/toto/:type/:id", () => {})
    mocker.delete("/toto/:type/:id", () => {})

    expect(mocker.routes.GET["/toto/:type/:id"]).to.be.a("function")
    expect(mocker.routes.POST["/toto/:type/:id"]).to.be.a("function")
    expect(mocker.routes.PUT["/toto/:type/:id"]).to.be.a("function")
    expect(mocker.routes.DELETE["/toto/:type/:id"]).to.be.a("function")

  })

  it("should return route with param", () => {

    const route = mocker._getRoute("get", "/toto/ww/3")

    expect(route).to.be.a("string")

  })

  it("should wait for 10ms", done => {

    mocker
    .wait(20)
    .then(done)
    .catch(log)

  })

  it("should simulate a fetch request", done => {

    const delay = new Promise(resolve => setTimeout(resolve, 50))

    mocker.fetch("/toto")
    .then(delay)
    .then(() => {

      expect(true).to.be.true
      done()

    })
    .catch(() => {

      expect(true).to.be.true
      done()

    })

  })

  it("should be able to use parameters for responses", done => {

    mocker.get("/toto/:id", request => {

      return "the id is " + request.params.id

    })

    mocker
    .fetch("/toto/3")
    .then(res => res.text())
    .then(text => {

      expect(text).to.equal("the id is 3")
      done()

    })
    .catch(log)

  })

  it("should be able to use query parameters for responses", done => {

    mocker.get("/toto/:id", request => {

      return "the param is " + request.query.param

    })

    mocker
    .fetch("/toto/3?param=ww")
    .then(res => res.text())
    .then(text => {

      expect(text).to.equal("the param is ww")
      done()

    })
    .catch(log)

  })

  it("should return status", () => {

    mocker.get("/toto/:id", request => {

      const id = request.params.id

      if (id > 10) {

        return new Response("id should be <= 10", { status : 400 })

      } else {

        return "ok"

      }

    })

    mocker.fetch("/toto/9")
    .then(res => expect(res.status).to.equal(200))

    mocker.fetch("/toto/15")
    .then(res => expect(res.status).to.equal(400))

  })

})

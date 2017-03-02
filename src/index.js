import pathMatch from "path-match"
import nodeUrl from "url"
import "whatwg-fetch"

const nativeFetch = window.fetch

export default class Mocker {

  constructor(baseUrl = "") {

    this.baseUrl = baseUrl

    this.requestDelay = 0

    this.mockAllRequests = false

    this.response404 = "Not found"

    this.routes = {
      GET : {},
      POST : {},
      PUT : {},
      DELETE : {}
    }

    this.fetch = this.fetch.bind(this)

  }

  get(path, handler) {

    this._register("GET", path, handler)

  }

  post(path, handler) {

    this._register("POST", path, handler)

  }

  put(path, handler) {

    this._register("PUT", path, handler)

  }

  delete(path, handler) {

    this._register("DELETE", path, handler)

  }

  _register(method, path, handler) {

    this.routes[method][this.baseUrl + path] = handler

  }

  wait(ms) {

    return new Promise(resolve => setTimeout(resolve, ms))

  }

  _getHandlers(method) {

    return this.routes[method.toUpperCase()]

  }

  _getHandler(method, route) {

    const handlers = this._getHandlers(method)

    return handlers && handlers[route]

  }

  _getRoute(method, pathname) {

    const handlers = this._getHandlers(method)

    return handlers && Object.keys(handlers).find(path => pathMatch()(path)(pathname))

  }

  makeResponse(content, status = 200) {

    const strContent = (typeof content == "string") ? content : JSON.stringify(content)

    return new Response(strContent, { status })

  }

  fetch(url, options = {}) {

    const strUrl = (typeof url === "string") ? url : url.toString()
    const objUrl = nodeUrl.parse(strUrl, true)
    const pathname = objUrl.pathname
    const method = options.method || "GET"
    const route = this._getRoute(method, pathname)
    const handler = this._getHandler(method, route)
    const params = route && pathMatch()(route)(pathname)
    const delay = this.requestDelay

    let response

    if (handler) {

      response = handler({
        params,
        query : objUrl.query,
        body : options.body || "",
        headers : options.headers || {}
      })

    } else if (this.mockAllRequests) {

      response = this.makeResponse(this.response404, 404)

    } else {

      return nativeFetch(url, options)

    }


    return this
      .wait(delay)
      .then(() => response)
      .then(res => {

        return (res instanceof Response) ? res : this.makeResponse(res)

      })

  }

  enable() {

    window.fetch = this.fetch

  }

  disable() {

    window.fetch = nativeFetch

  }

}

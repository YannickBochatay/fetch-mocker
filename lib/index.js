"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathMatch = require("path-match");

var _pathMatch2 = _interopRequireDefault(_pathMatch);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

require("whatwg-fetch");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nativeFetch = window.fetch;

var Mocker = function () {
  function Mocker() {
    var baseUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    _classCallCheck(this, Mocker);

    this.baseUrl = baseUrl;

    this.requestDelay = 0;

    this.mockAllRequests = false;

    this.response404 = "Not found";

    this.routes = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {}
    };

    this.fetch = this.fetch.bind(this);
  }

  _createClass(Mocker, [{
    key: "get",
    value: function get(path, handler) {

      this._register("GET", path, handler);
    }
  }, {
    key: "post",
    value: function post(path, handler) {

      this._register("POST", path, handler);
    }
  }, {
    key: "put",
    value: function put(path, handler) {

      this._register("PUT", path, handler);
    }
  }, {
    key: "delete",
    value: function _delete(path, handler) {

      this._register("DELETE", path, handler);
    }
  }, {
    key: "_register",
    value: function _register(method, path, handler) {

      this.routes[method][this.baseUrl + path] = handler;
    }
  }, {
    key: "wait",
    value: function wait(ms) {

      return new Promise(function (resolve) {
        return setTimeout(resolve, ms);
      });
    }
  }, {
    key: "_getHandlers",
    value: function _getHandlers(method) {

      return this.routes[method.toUpperCase()];
    }
  }, {
    key: "_getHandler",
    value: function _getHandler(method, route) {

      var handlers = this._getHandlers(method);

      return handlers && handlers[route];
    }
  }, {
    key: "_getRoute",
    value: function _getRoute(method, pathname) {

      var handlers = this._getHandlers(method);

      return handlers && Object.keys(handlers).find(function (path) {
        return (0, _pathMatch2.default)()(path)(pathname);
      });
    }
  }, {
    key: "makeResponse",
    value: function makeResponse(content) {
      var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;


      var strContent = typeof content == "string" ? content : JSON.stringify(content);

      return new Response(strContent, { status: status });
    }
  }, {
    key: "fetch",
    value: function fetch(url) {
      var _this = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


      var strUrl = typeof url === "string" ? url : url.toString();
      var objUrl = _url2.default.parse(strUrl, true);
      var pathname = objUrl.pathname;
      var method = options.method || "GET";
      var route = this._getRoute(method, pathname);
      var handler = this._getHandler(method, route);
      var params = route && (0, _pathMatch2.default)()(route)(pathname);
      var delay = this.requestDelay;

      var response = void 0;

      if (handler) {

        response = handler({
          params: params,
          query: objUrl.query,
          body: options.body || "",
          headers: options.headers || {}
        });
      } else if (this.mockAllRequests) {

        response = this.makeResponse(this.response404, 404);
      } else {

        return nativeFetch(url, options);
      }

      return this.wait(delay).then(function () {
        return response;
      }).then(function (res) {

        return res instanceof Response ? res : _this.makeResponse(res);
      });
    }
  }, {
    key: "enable",
    value: function enable() {

      window.fetch = this.fetch;
    }
  }, {
    key: "disable",
    value: function disable() {

      window.fetch = nativeFetch;
    }
  }]);

  return Mocker;
}();

exports.default = Mocker;
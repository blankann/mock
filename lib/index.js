"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mock = void 0;
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.regexp.test.js");
require("core-js/modules/es.regexp.constructor.js");
require("core-js/modules/es.regexp.to-string.js");
require("core-js/modules/es.string.search.js");
require("core-js/modules/web.dom-collections.iterator.js");
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/es.array.reduce.js");
const _excluded = ["isProd", "data"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
const urlReg = /^(?:http[s]?:\/\/\S+?)?\/\S+$/;
const isUndefined = x => typeof x === 'undefined';
const isBool = x => typeof x === 'boolean';
const isString = x => typeof x === 'string';
const isFunc = x => typeof x === 'function';
const isObject = x => Object.prototype.toString.call(x) === '[object Object]';
const isThenable = x => x && isFunc(x.then);
const getDefaultMock = flag => {
  if (window && window.location) {
    return new RegExp("[?&]".concat(flag)).test(window.location.search);
  }
  ;
  return false;
};
const shouldMock = function shouldMock() {
  const {
    isProd,
    isMock,
    flag
  } = config;
  // 生产环境强制关闭mock
  if (isProd) {
    return false;
  }
  // 自定义mock
  if (isBool(isMock)) {
    return isMock;
  }
  // 支持单个请求，用户自定义mock
  if (isFunc(isMock)) {
    return isMock(...arguments);
  }
  return getDefaultMock(flag);
};
const logMockResponse = (url, fn) => function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  const output = fn(...args);
  const handle = data => {
    console.table({
      '请求地址': url,
      '请求参数': JSON.stringify(args),
      '返回数据(MOCK)': JSON.stringify(data)
    });
    return data;
  };
  if (isThenable(output)) {
    return output.then(handle);
  }
  return handle(output);
};
const getLogMockResponse = data => Object.keys(data || {}).reduce((prev, key) => {
  prev[key] = logMockResponse(key, data[key]);
  return prev;
}, {});
const handleLogMockResponse = data => {
  if (isFunc(data)) {
    const res = data();
    if (isThenable(res)) {
      return res.then(getLogMockResponse);
    }
    return getLogMockResponse(res);
  }
  return getLogMockResponse(data);
};
let config = {
  isProd: false,
  flag: '__MOCK__',
  key: 'url',
  data: {}
};
const mock = (fn, param) => {
  isObject(param) && mock.config(param);
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    const {
      key,
      data,
      setPath
    } = config;
    if (shouldMock(...args)) {
      let path = isFunc(setPath) ? setPath(...args) : void 0;
      if (isUndefined(path)) {
        const [url] = args;
        if (isObject(url) && url[key]) {
          path = url[key];
        }
        if (isString(url) && urlReg.test(url)) {
          path = url;
        }
      }
      const handle = data => (isFunc(data[path]) ? data[path] : fn)(...args);
      if (isThenable(data)) {
        return data.then(handle);
      }
      return handle(data);
    }
    return fn(...args);
  };
};
exports.mock = mock;
mock.config = function () {
  let _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    {
      isProd = config.isProd,
      data
    } = _ref,
    tail = _objectWithoutProperties(_ref, _excluded);
  config = _objectSpread(_objectSpread({}, config), tail);
  config.isProd = isFunc(isProd) ? isProd() : !!isProd;
  if (data) {
    config.data = handleLogMockResponse(data);
  }
};
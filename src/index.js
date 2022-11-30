const urlReg = /^(?:http[s]?:\/\/\S+?)?\/\S+$/;
const isUndefined = (x) => typeof x === 'undefined';
const isBool = (x) => typeof x === 'boolean';
const isString = (x) => typeof x === 'string';
const isFunc = (x) => typeof x === 'function';
const isObject = (x) => Object.prototype.toString.call(x) === '[object Object]';
const isThenable = x => x && isFunc(x.then);

const getDefaultMock = (flag) => {
  try {
    if (window && window.location) {
      return new RegExp(`[?&]${flag}`).test(window.location.search);
    };
  } catch(e) {
  }
  return false;
};

const shouldMock = (...args) => {
  const { isProd, isMock, flag } = config;
  // force close the mock in production mode
  if (isProd) {
    return false;
  }
  // customize mock
  if (isBool(isMock)) {
    return isMock;
  }
  // mock the single request
  if (isFunc(isMock)) {
    return isMock(...args);
  }
  return getDefaultMock(flag);
};

const logMockResponse = (url, fn) => (...args) => {
  const output = fn(...args);
  const handle = data => {
    console.table({
      url,
      body: JSON.stringify(args),
      'response(MOCK)': JSON.stringify(data),
    });
    return data;
  };
  if (isThenable(output)) {
    return output.then(handle);
  }
  return handle(output);
};

const getLogMockResponse = (data) => Object.keys(data || {}).reduce((prev, key) => {
  prev[key] = logMockResponse(key, data[key]);
  return prev;
}, {});

const handleLogMockResponse = (data) => {
  if (isFunc(data)) {
    const res = data();
    if (isThenable(res)) {
      return res.then(getLogMockResponse);
    }
    return getLogMockResponse(res);
  }
  return getLogMockResponse(data);
}

let config = {
  isProd: false,
  flag: '__MOCK__',
  key: 'url',
  data: {},
};

const mock = (fn, param) => {
  isObject(param) && mock.config(param);
  return (...args) => {
    const { key, data, setPath } = config;
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
  }
}

mock.config = ({ isProd = config.isProd, data, ...tail } = {}) => {
  config = {
    ...config,
    ...tail,
  };
  config.isProd = isFunc(isProd) ? isProd() : !!isProd;
  if (data) {
    config.data = handleLogMockResponse(data);
  }
};

export {
  mock,
};

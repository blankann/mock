### 使用案例(Usage)
```javascript
import axios from 'axios';
import { mock } from 'bmock';
// import mockdata from './xxx';

const delay = (data, time = 500) => new Promise((resolve) => {
  setTimeout(resolve, time, data);
});

const mockData = {
  '/api/verifyCode': () => {
    return delay({
      status: 0,
      data: {
        verifyCode: 999 + Math.ceil(Math.random() * 9000),
      },
    });
  },
  '/api/login': () => {
    count++;
    return delay({
      status: [0, -1][count % 2],
      msg: 'error, try again',
      data: {
        token: Math.random().toString(36).slice(2),
      },
    });
  },
  '/api/list': (param) => {
    const { page } = param;
    const { pageNo = 1, pageSize = 15 } = page || {};
    const totalSize = 101;
    const totalData = Array.from({length: totalSize}, (_, index) => ({
      code: `shopCode${index + 1}`,
      address: 'xxxx',
      title: `xxx${index + 1}`,
    }));
    return delay({
      "status": 0,
      "msg": "",
      "data": {
        "page": {
          curPage: pageNo,
          pageSize,
          totalSize,
        },
        data: totalData.slice((pageNo - 1) * pageSize, pageNo * pageSize),
      }
    });
  },
};

// default
const axios1 = mock(axios, {
  data: mockData, //必需(required)
});
axios1({ url: 'xxx'});

// 自定义配置参数
// Custom configuration parameters
const axios2 = mock(axios, {

  // 必需
  // 支持函数: data: () => mockData；支持异步thenable: data: () => Promise.resolve(mockData)

  // required
  // suport function: data: () => mockData; support async thenable function: data: () => Promise.resolve(mockData)
  data: mockdata,

  // 非必需，默认值：__MOCK__
  // 通过在url中添加__MOCK__参数，开启mock模式，当前url页面所发起的所有请求都使用mock数据（isProd为false且未配置isMock）

  // not required, default value: __MOCK__
  // By adding the __MOCK__ parameter to the url, the mock mode is enabled,
  // and all requests initiated by the current url page use mock data (isProd is false and isMock is not configured)
  // https://xx.com/xx/xxxx?__MOCK__
  flag: '__MOCK__',

  // 非必需，默认值：false
  // 支持boolean或者函数，当传入boolean值时，控制所有请求是否使用mock数据，true： 使用，false：不使用
  // 当传入函数: isMock: ({ __mock } = {}) => __mock 时，针对单独请求进行mock

  // not required, default value: false
  // support boolean or function, when the boolean value is passed in, control whether to use mock data for all requests, true: use, false: not use
  // when passing in the function: isMock: ({ __mock } = {}) => __mock, it can be mocked for individual requests

  // const axios1 = mock(axios, {data: mockData, isMock: ({ __mock } = {}) => __mock})
  // axios1({url: '/user/1', __mock: true })
  // axios1({url: '/user/2', __mock: false })
  isMock : true,

  // 非必需，默认值：false
  // 支持函数方式:
  // isProd: () => true; 返回值为true时，不支持mock;返回值为false时，支持mock

  // not required, default value: false
  // the function method is supported:
  // isProd: () => true; when the return value is true, mocking is not supported; when the return value is false, mocking is supported
  isProd: false,

  // 非必需, 默认值为："url"
  // 通过该值去匹配mockData中的数据, 匹配失败，则不进行mock

  // not required, default value: "url"
  // which is used to match the data in mockData, If the match fails, mocking will not be performed.

  // const mockData = {'/user/1', () => {}};
  // const axios1 = mock(axios, { data: mockData, key: 'url' });
  // axios1({url: '/user/1' });
  key: 'url',

  // 非必需
  // 与字段“key”作用一致，优先级高于字段“key”,
  // 该函数参数为被mock函数的参数

  // not required
  // It has the same function as the field "key", and has a higher priority than the field "key".
  // The function parameter is the parameter of the mocked function

  // const mockData = {'/user/1', () => {}};
  // const axios1 = mock(axios, { data: mockData, setPath: ({ url }) => url });
  // axios1({ url: '/user/1' });
  setPath: ({ url } = {}) => url,

});

// 注意：mock权重 isProd > isMock > flag
// warn: mock's priority: isProd > isMock > flag

axios2({ url, __mock: true });

// usage 3
// mock axios get|post
const axiosGet = mock(axios.get, { data: mockData });
const axiosPost = mock(axios.post, { data: mockData });
axiosGet('/user/1', {});

// usage 4
// async function
const asyncFn = ({ path, __isMock, data } = {}) => Promise.resolve({});

const mockAsyncFn1 = mock(asyncFn, { key: 'path', data: mockData, isMock: true });
mockAsyncFn1({ path: '/user/1', data: {} }).then((data) => {}); // mock all

const mockAsyncFn2 = mock(asyncFn, { data: mockData, setPath:({ path }) => path, /*or key: 'path'*/ isMock: ({ __isMock }) => __isMock);
mockAsyncFn2({ path: '/user/1', __isMock: true, data: {} });  // only mock path '/user/1'
mockAsyncFn2({ path: '/user/2', __isMock: false, data: {} });

// usage 5
// sync function
const fn = (param) => ({});
const mockFn = mock(fn, { data: mockData });
mockFn(param);

```


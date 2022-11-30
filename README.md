### usage
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

// usage 1
// default
const axios1 = mock(axios, {
  data: mockData, //required
});
axios1({ url: 'xxx'});

// usage 2
//custom
const axios2 = mock(axios, {
  data: mockdata, // required
  // data: () => mockData, // sync mock data
  // data: () => Promise.resolve(mockData), // async mock data
  flag: '__MOCK__', // https://xx.com/xx/xxxx?__MOCK__ open the mock mode
  isMock : true, // mock all request, same effect as "flag", with higher than it
  // isMock: ({ __mock } = {}) => __mock, // mock the single request, param: the parameters of proxy request
  isProd: false, // close the mock when in production mode
  // isProd: () => true,
  key: 'url', // mockData key, axios({method: 'post', url: '/user/123' })
  // key: 'path', // asyncFn({method: 'get', path: '/user/123'})
  setPath: ({ url } = {}) => url, // mockData key, param: the parameters of proxy request. same effect as "key", with higher than it
});

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


### usage
### example
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
      msg: '模拟错误提示，再点击一次登录按钮，可登录成功',
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

const axiosXXX = mock(axios, {
  data: mockdata, // require
  // data: () => mockdata,
  // data: () => Promise.resolve(mockdata),
  isMock: (param) => true, // mock the single request, param: request body
  // isMock : false,
  isProd: false, // close the mock when in production mode
  // isProd: () => true,
  flag: '__MOCK__', // https://xx.com/xx/xxxx?__MOCK__ open the mock mode
  key: 'url', // axios({method: 'post', url: '/user/123' })
  // key: 'xxx', // asyncFn({method: 'get', xxx: '/user/123'})
  setPath: (param) => '', // mockData key, param: request body
});


// const axiosGet = mock(axios.get, { data: mockData })
// const axiosPost = mock(axios.post, { data: mockData })

// const asyncFn = (param) => Promise.resolve(xxx);
// const mockAsyncFn = mock(asyncFn);
// mockAsyncFn(param).then(xxx => {});

// const fn = (param) => ({xxxx});
// const mockFn = mock(fn);
// mockFn(param);

```


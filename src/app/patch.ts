export const fetchSource = (url: string, options?: object) => {
  return new Promise((resolve, reject) => {
    try {
      fetch(url, options)
        .then((res) => {
          if (res.status >= 200 && res.status < 400) {
            if (res.status === 302) {
              // location.href = res.data
              reject(res);
            } else {
              resolve(res.text());
            }
          } else {
            reject(res);
            // console.error(res);
          }
        })
        .catch((e) => {
          reject(e);
          // console.error(e);
        });
    } catch (e) {
      reject(e);
      // console.error(e);
    }
  });
};

export const scheduleTask = (fn) => {
  if (Promise && Promise.resolve) {
    Promise.resolve().then(fn);
  } else if (setImmediate) {
    setImmediate(fn);
  } else {
    setTimeout(fn, 0);
  }
};

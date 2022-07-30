export const fetchSource = (url: string, options?: object) => {
  return fetch(url, options).then((res) => {
    return res.text();
  });
};
export const parseSource = (url: string, options?: object) => {
  return new Promise((resolve, resject) => {
    if (url) {
      resolve(url);
    } else {
      resject(options);
    }
  });
};

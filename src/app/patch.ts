export const fetchSource = (url: string, options?: object) => {
  return fetch(url, options).then((res) => {
    return res.text();
  });
};

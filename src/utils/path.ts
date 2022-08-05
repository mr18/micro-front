export const parseLocationUrl = (url: string) => {
  let hash: string, // #xxx
    // host: string, // "localhost:9000"
    // hostname: string, // : "localhost"
    href: string = url, // : "http://localhost:9000/"
    // origin: string, // : "http://localhost:9000"
    // pathname: string, // : "/"
    // port: string, // : "9000"
    search: string, // '?xxx'
    protocol: string, // : "http:"
    str: string;

  const reg = /(http(s?):)?\/\/([^/:]+):?(\d*)(\/?.*)/i;

  [str, hash] = url.split('#') || [];
  [str, search] = str.split('?') || [];

  const res = reg.exec(str) || [];

  protocol = res[1];
  if (!protocol) {
    protocol = location.protocol;
    href = protocol + url;
  }
  const hostname = res[3];
  const port = res[4];
  const pathname = res[5];

  const host = hostname + (port ? ':' + port : '');
  const origin = protocol + '//' + host;

  return {
    hash: hash ? '#' + hash : hash,
    host,
    hostname,
    href,
    origin,
    pathname,
    port,
    search: search ? '?' + search : search,
    protocol: protocol || location.protocol,
  };
};

export const resolvePath = (loc: Record<PropertyKey, any>, url = '') => {
  if (/\/\//.test(url)) {
    return location.protocol + url;
  } else if (/\.\/+/.test(url)) {
    return loc.origin + loc.pathname.replace(/\/([^/]*\.[^/]*)?$/, '') + url.replace(/\.\/+/, '/');
  } else if (/\/[^/]+/.test(url)) {
    return loc.origin + url;
  }
  return url;
};
export const parseFileName = (path = '') => {
  if (/[^.]+\.[^./]+$/.test(path)) {
    const file = path.split('/');
    return (file[file.length - 1] || '').trim();
  }
  return '';
};

export const getContainerSelector = (appName: string) => {
  return `micro-ctn-${appName}`;
};

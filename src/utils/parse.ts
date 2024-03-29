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

export const resolvePath = (loc: Record<PropertyKey, any>, url: string) => {
  if (/\/\//.test(url)) {
    return location.protocol + url;
  } else if (/\.\/+/.test(url)) {
    return loc.origin + loc.pathname.replace(/\/([^/]*\.[^/]*)?$/, '') + url.replace(/\.\/+/, '/');
  } else if (/\/[^/]+/.test(url)) {
    return loc.origin + url;
  }
  return url;
};
export const parseFileName = (path: string) => {
  if (/[^.]+\.[^./]+$/.test(path)) {
    const file = path.split('/');
    return (file[file.length - 1] || '').trim();
  }
};
export const parseHtmlSource = (html: string, _location: Record<PropertyKey, any>) => {
  const scripts = new Map<string, any>();
  const styles = new Map<string, any>();
  const headHtml = (html.match(/<head>(.*)<\/head>/is) || [])[1];
  const bodyHtml = (html.match(/<body>(.*)<\/body>/is) || [])[1];
  const oHeadWrap: HTMLElement = document.createElement('div');
  oHeadWrap.innerHTML = headHtml;

  const oBodyWrap: HTMLElement = document.createElement('div');
  oBodyWrap.innerHTML = bodyHtml;

  function pickSourceInfo(src: string, ele: HTMLElement, type: string, replaceEle?: HTMLElement) {
    if (type === 'script') {
      if (src) {
        const module = ele.getAttribute('module') !== null;
        const async = ele.getAttribute('async') !== null;
        scripts.set(src, {
          url: resolvePath(_location, src),
          async,
          defer: !async,
          module,
          nomodule: !module,
          fileName: parseFileName(src),
          ele,
        });
      } else {
        const contentUri = ele.textContent.replace(/[\n\t\s]+/, '').substring(0, 50) + '...';
        scripts.set(contentUri, {
          url: contentUri,
          defer: true,
          // fileName: parseFileName(src),
          result: ele.textContent,
          ele,
        });
      }
    } else if (type === 'link') {
      const rel = ele.getAttribute('rel');
      if (rel === 'stylesheet') {
        styles.set(src, {
          url: resolvePath(_location, src),
          fileName: parseFileName(src),
          ele: replaceEle,
        });
      }
      // 预加载js
      else if (rel === 'prefetch') {
        scripts.set(src, {
          url: resolvePath(_location, src),
        });
      }
    }
  }
  function pickSource(ele: HTMLElement, parent: HTMLElement) {
    if (ele.childNodes && ele.childNodes.length > 0) {
      ele.childNodes.forEach((e: HTMLElement) => {
        pickSource(e, ele);
      });
    }
    if (ele.nodeType === 1) {
      const tagName = ele.tagName.toLowerCase();
      // 收集script资源
      if (tagName === 'script') {
        const src = ele.getAttribute('src');
        pickSourceInfo(src, ele, tagName);
        parent.replaceChild(document.createComment('script element removed by micro framework'), ele);
      }
      // 收集link资源
      else if (tagName === 'link') {
        const href = ele.getAttribute('href');
        const replaceEle = document.createElement('style');
        pickSourceInfo(href, ele, tagName, replaceEle);
        parent.insertBefore(document.createComment('link element is replaced to style element by micro framework'), ele);
        parent.replaceChild(replaceEle, ele);
      }
      // 替换资源路径
      else if (tagName === 'a') {
        ele.setAttribute('href', resolvePath(_location, ele.getAttribute('href')));
      } else if (tagName === 'img' || tagName === 'iframe') {
        ele.setAttribute('src', ele.getAttribute('src'));
      }
      // 移除无用资源
      else if (tagName === 'title' || tagName === 'meta') {
        parent.replaceChild(document.createComment(`${tagName} element removed by micro framework`), ele);
      }
    }
  }

  oHeadWrap.childNodes.forEach((ele: HTMLElement) => {
    pickSource(ele, oHeadWrap);
  });

  oBodyWrap.childNodes.forEach((ele: HTMLElement) => {
    pickSource(ele, oBodyWrap);
  });

  return {
    scripts,
    styles,
    oHeadWrap,
    oBodyWrap,
  };
};

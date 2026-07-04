const genericHandler = async (client, method, pathPattern, args) => {
  let url = pathPattern;
  const pathParams = [];
  
  // Replace path parameters (e.g. :user_id, {user_id}, *path)
  url = url.replace(/:([a-zA-Z0-9_]+)/g, (match, p1) => {
    pathParams.push(p1);
    if (args[p1] !== undefined && args[p1] !== null) {
      return encodeURIComponent(args[p1]);
    }
    throw new Error(`Missing required path parameter: ${p1}`);
  });
  
  url = url.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, p1) => {
    pathParams.push(p1);
    if (args[p1] !== undefined && args[p1] !== null) {
      return encodeURIComponent(args[p1]);
    }
    throw new Error(`Missing required path parameter: ${p1}`);
  });

  url = url.replace(/\*([a-zA-Z0-9_]+)/g, (match, p1) => {
    pathParams.push(p1);
    if (args[p1] !== undefined && args[p1] !== null) {
      // For wildcard paths, we might not want to URL encode slashes
      return args[p1];
    }
    throw new Error(`Missing required path parameter: ${p1}`);
  });

  const fetchAllPages = args.fetch_all_pages === true;

  const payload = {};
  for (const key in args) {
    if (!pathParams.includes(key) && key !== 'fetch_all_pages') {
      payload[key] = args[key];
    }
  }

  const config = {
    method: method.toLowerCase(),
    url: url
  };

  if (config.method === 'get' || config.method === 'delete') {
    config.params = payload;
  } else {
    config.data = payload;
  }

  if (fetchAllPages && config.method === 'get') {
    let allData = [];
    let currentConfig = { ...config };

    while (true) {
      const response = await client(currentConfig);
      if (Array.isArray(response.data)) {
        allData = allData.concat(response.data);
      } else {
        // Not an array, pagination doesn't apply
        return response.data;
      }

      const linkHeader = response.headers && (response.headers.link || response.headers.Link);
      if (!linkHeader) break;

      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextMatch && nextMatch[1]) {
        currentConfig = {
          method: 'get',
          url: nextMatch[1]
        };
      } else {
        break;
      }
    }
    return allData;
  }

  const response = await client(config);
  return response.data;
};

module.exports = {
  genericHandler
};

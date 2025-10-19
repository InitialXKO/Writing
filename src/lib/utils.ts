export const getActualEndpoint = (baseURL?: string): string => {
  if (!baseURL) return 'https://api.openai.com/v1';
  let url = baseURL.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  if (!/\/v1\/?$/.test(url)) {
    url = url.endsWith('/') ? url + 'v1' : url + '/v1';
  }
  return url;
};

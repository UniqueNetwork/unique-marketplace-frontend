export function JWTDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = Buffer.from(base64Url.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  const jsonPayload = decodeURIComponent(base64.toString('utf-8').split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload) as { exp: number };
}

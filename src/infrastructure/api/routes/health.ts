export function healthResponse(): Response {
  return new Response('OK', {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8'
    }
  });
}

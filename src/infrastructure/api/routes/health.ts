export type HealthResponse = {
  ok: true;
  service: 'babyflow';
};

export function healthResponse(): Response {
  const body: HealthResponse = {
    ok: true,
    service: 'babyflow'
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
}

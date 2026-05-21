const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data?.error ?? 'Request failed'), { response: { data, status: res.status } });
  return data as T;
}

const api = {
  get: <T = unknown>(path: string, opts?: { params?: Record<string, unknown> }) => {
    const url = opts?.params
      ? `${path}?${new URLSearchParams(
          Object.entries(opts.params)
            .filter(([, v]) => v != null && v !== '')
            .map(([k, v]) => [k, String(v)])
        )}`
      : path;
    return request<T>('GET', url);
  },
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>('POST', path, body, body instanceof FormData),
  put: <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T = unknown>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T = unknown>(path: string) => request<T>('DELETE', path),
};

export default api;

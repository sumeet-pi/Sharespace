export function getApiBaseUrl() {
  // CRA style env var only; fallback to localhost:5000
  const fromCRA = process.env.REACT_APP_API_BASE_URL;
  return fromCRA || 'http://localhost:5001/api';
}

export async function apiRequest(path, options = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const merged = {
    method: 'GET',
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    ...options,
  };
  
  try {
    const res = await fetch(url, merged);
    
    // Check content type before reading body - only read once
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    // Read response body only once - never read twice
    let data = null;
    let message = '';
    
    try {
      data = isJson ? await res.json() : await res.text();
      
      // Extract message from various possible fields (only if JSON)
      if (isJson && data && typeof data === 'object') {
        message = data?.message || data?.error || data?.detail || '';
      }
    } catch (parseError) {
      // If parsing fails, create a minimal error response
      // Log parsing error to console (silent to user)
      console.error('Response parsing error:', parseError);
      if (isJson) {
        data = { message: `Request failed (${res.status})` };
      } else {
        data = `Request failed (${res.status})`;
      }
      message = '';
    }
    
    // Always return clean structure - never undefined
    return {
      ok: res.ok === true,
      status: res.status || 0,
      data: res.ok ? data : null,
      message: message || '',
      error: res.ok ? null : data
    };
  } catch (fetchError) {
    // Handle network errors (fetch failed, TypeError, CORS, etc.)
    // Log network error to console (silent to user)
    console.error('Network error:', fetchError);
    
    // Always return clean structure for network errors
    return {
      ok: false,
      status: 0,
      data: null,
      message: '',
      error: fetchError
    };
  }
}


import axios from 'axios'


const api = axios.create({
  baseURL: `http://localhost:1234`, 
  timeout: 5000,
})

// Add Referrer-Policy header to all requests (set to a valid value, e.g. 'no-referrer-when-downgrade')
api.interceptors.request.use(
  config => {
    if (config.headers) {
      config.headers["Referrer-Policy"] = "no-referrer-when-downgrade";
    }
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`)
    return config;
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,     
  error => {
    console.error('❌', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

export default api
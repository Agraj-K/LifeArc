import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401 (expired/invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    if (error.response?.status === 403) {
      if (error.response?.data?.reason) {
        localStorage.setItem('suspensionReason', error.response.data.reason)
      }
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email) {
        localStorage.setItem('suspensionEmail', user.email);
      }
      window.location.href = '/suspended'
    }
    return Promise.reject(error)
  }
)

export default API

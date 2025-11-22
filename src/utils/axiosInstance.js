import axios from 'axios'

const BASE_URL = 'http://192.168.1.3:3000'

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

try {
  const token = localStorage.getItem('token')
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
} catch (e) {
  console.warn('Could not set Authorization header from localStorage', e)
}

export default instance

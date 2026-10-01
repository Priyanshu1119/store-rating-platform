import api from './api';

export const loginRequest = (data) => api.post('/auth/login', data);
export const signupRequest = (data) => api.post('/auth/signup', data);
export const getProfile = () => api.get('/auth/me');
export const changePasswordRequest = (data) => api.patch('/auth/password', data);

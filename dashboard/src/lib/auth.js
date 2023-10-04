'use client';

import { useEffect, useState } from 'react';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api'

export const LOCAL_STORAGE_TOKEN_KEY = 'swishjam-token';

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  }
}

export const logUserOut = async () => {
  const { error } = await SwishjamAPI.Auth.logout()
  if (error) {
    throw error;
  } else {
    clearToken();
  }
}

export const setAuthToken = tokenValue => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenValue);
  } else {
    throw new Error('localStorage is not defined yet, cannot set token.');
  }
}

export const signUserUp = async ({ email, password, companyUrl, inviteCode }) => {
  const { error, user, workspace, token } = await SwishjamAPI.Auth.register({ email, password, companyUrl, inviteCode });
  if (token) {
    setAuthToken(token);
  }
  return { error, user, workspace, token };
}

export const logUserIn = async ({ email, password }) => {
  const { error, user, token } = await SwishjamAPI.Auth.login({ email, password });
  if (token) {
    setAuthToken(token);
  }
  return { error, user, token };
}

export const getToken = () => {
  const [token, setToken] = useState();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY));
    }
  }, []);

  return token;
}
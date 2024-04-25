'use client';

import { useEffect, useState } from 'react';
import { SwishjamAPI } from '@/lib/api-client/swishjam-api'
import { swishjam } from '@swishjam/react'
import * as Sentry from '@sentry/nextjs';

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
    swishjam.logout();
    Sentry.setUser(null);
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

export const signUserUp = async ({ email, password, companyUrl }) => {
  const { error, user, workspace, token } = await SwishjamAPI.Auth.register({ email, password, companyUrl });
  if (token) {
    const { email, first_name, last_name } = user;
    debugger;
    swishjam.identify(user.id, { email, first_name, last_name });
    swishjam.setOrganization(workspace.id, { name: workspace.name, company_url: workspace.company_url });
    swishjam.event('user_signup', { ...user, workspace: workspace.name });
    Sentry.setUser({ email, id: user.id });
    setAuthToken(token);
  }
  return { error, user, workspace, token };
}

export const logUserIn = async ({ email, password }) => {
  const { error, token, workspace, user } = await SwishjamAPI.Auth.login({ email, password });
  if (token) {
    const { email, first_name, last_name } = user;
    swishjam.identify(user.id, { email, first_name, last_name });
    swishjam.setOrganization(workspace.id, { name: workspace.name, company_url: workspace.company_url });
    swishjam.event('user_login', { ...user, workspace: workspace.name });
    Sentry.setUser({ email, id: user.id });
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
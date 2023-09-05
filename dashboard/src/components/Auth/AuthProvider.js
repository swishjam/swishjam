'use client';

import { useEffect, useState } from 'react';
import { API } from '@lib/api-client/base'

export const LOCAL_STORAGE_TOKEN_KEY = 'swishjam-token';

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  }
}

export const logUserOut = async () => {
  const { error } = await API.post('/auth/logout');
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

export const signUserUp = async ({ email, password, workspaceName, companyUrl }) => {
  const { error, user, workspace, token } = await API.post('/auth/register', { email, password, workspace_name: workspaceName, company_url: companyUrl });
  if (token) {
    setAuthToken(token);
  }
  return { error, user, workspace, token };
}

export const logUserIn = async ({ email, password }) => {
  const { error, user, token } = await API.post('/auth/login', { email, password });
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

export const useAuthData = () => {
  const [authData, setAuthData] = useState();
  const [isAwaitingData, setIsAwaitingData] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const decodeJWT = token => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (token) {
        try {
          const decoded = decodeJWT(token);
          setAuthData({
            token: () => token,
            email: () => decoded.user.email,
            userId: () => decoded.user.id,
            workspaceId: () => decoded.current_workspace.id,
            workspaceName: () => decoded.current_workspace.name,
            currentWorkspaceName: () => decoded.current_workspace.name,
            currentWorkspaceId: () => decoded.current_workspace.id,
            workspaces: () => decoded.workspaces,
            epiresAtEpoch: () => decoded.expires_at_epoch,
            isExpired: () => decoded.expires_at_epoch < Date.now() / 1000,
          });
        } catch(err) {
          setIsLoggedOut(true);
        }
      } else {
        setIsLoggedOut(true);
      }
      setIsAwaitingData(false);
    }
  }, []);

  return { authData, isAwaitingData, isLoggedOut, isLoggedIn: isAwaitingData ? null : !isLoggedOut };
}
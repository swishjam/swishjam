'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { clearToken, LOCAL_STORAGE_TOKEN_KEY } from '@/lib/auth.js';

const AuthenticationContext = createContext({ isAwaitingData:  true });
export const useAuthData = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
  const [authStates, setAuthStates] = useState({ isAwaitingData: true });

  const decodeJWT = token => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token) {
      try {
        const decoded = decodeJWT(token);
        const isExpired = decoded.expires_at_epoch < Date.now() / 1000;
        if (isExpired) {
          clearToken();
          setAuthStates({ isLoggedOut: true, isAwaitingData: false });
        } else {
          setAuthStates({
            isLoggedOut: false,
            isAwaitingData: false,
            token: token,
            email: decoded.user.email,
            userId: decoded.user.id,
            workspaceId: decoded.current_workspace.id,
            workspaceName: decoded.current_workspace.name,
            publicKey: decoded.current_workspace.public_key,
            currentWorkspaceName: decoded.current_workspace.name,
            currentWorkspaceId: decoded.current_workspace.id,
            currentWorkspacePublicKey: decoded.current_workspace.public_key,
            workspaces: decoded.workspaces,
            epiresAtEpoch: decoded.expires_at_epoch,
            isExpired: () => decoded.expires_at_epoch < Date.now() / 1000,
          });
        }
      } catch (err) {
        clearToken();
        setAuthStates({ isLoggedOut: true, isAwaitingData: false });
      }
    } else {
      clearToken();
      setAuthStates({ isLoggedOut: true, isAwaitingData: false });
    }
  }, []);

  return (
    <AuthenticationContext.Provider value={authStates}>
      {children}
    </AuthenticationContext.Provider>
  );
}
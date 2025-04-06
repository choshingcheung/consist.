import React, { useEffect } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

const LoginContent = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    } else if (isAuthenticated) {
      chrome.storage.local.set({ isLoggedIn: true });
      window.location.href = 'landing.html';
    }
  }, [isLoading, isAuthenticated]);

  return <div>🔒 Redirecting to login...</div>;
};

const Login = () => (
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin + '/login.html'
    }}
    cacheLocation="localstorage"
  >
    <LoginContent />
  </Auth0Provider>
);

export default Login;

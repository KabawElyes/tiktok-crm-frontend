import React, { useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      // Clear any previous errors
      setError(null);

      // Use environment variable for backend URL, with correct default port
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
      
      // Log the exact URL being called with more context
      console.log(`🔍 Attempting to call login endpoint:`, {
        fullUrl: `${backendUrl}/auth/login?state=abc123`,
        backendUrl,
        envVariable: process.env.REACT_APP_BACKEND_URL
      });

      // Enhanced axios configuration for better debugging
      const response = await axios({
        method: 'get',
        url: `${backendUrl}/auth/login`,
        params: { state: 'abc123' },
        timeout: 10000,
        // Add headers to help with debugging
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Log full response for debugging
      console.log('🌐 Full Backend Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      // Detailed validation of response data
      console.log('🕵️ Detailed Response Data:', JSON.stringify(response.data, null, 2));

      // More robust validation
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const authUrl = response.data.AdvertiserAuthorizationUrl || 
                      response.data.advertiserAuthorizationUrl || 
                      response.data.authUrl;

      if (!authUrl) {
        throw new Error('Invalid response: Authorization URL not found in server response');
      }
      
      // Log the authorization URL before redirection
      console.log('🚀 Redirecting to Authorization URL:', authUrl);

      // Use replace to prevent adding to browser history
      window.location.replace(authUrl);
    } catch (error) {
      // Comprehensive error handling
      console.error("🚨 Login Error Details:", {
        fullError: error,
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.request ? 'Request made' : 'No request',
        config: error.config
      });

      // Set user-friendly error message
      setError(
        error.response?.data?.message || 
        error.message || 
        'Une erreur est survenue lors de la connexion'
      );
    }
  };

  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "50px", 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1>Connexion avec TikTok</h1>
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '20px', 
          padding: '10px', 
          border: '1px solid red',
          backgroundColor: '#ffeeee',
          borderRadius: '5px'
        }}>
          <strong>Erreur :</strong> {error}
        </div>
      )}
      <button 
        onClick={handleLogin} 
        disabled={!!error}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#0077cc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#005fa3'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#0077cc'}
      >
        Se connecter avec TikTok
      </button>
    </div>
  );
}

export default LoginPage;

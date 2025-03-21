import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function CallbackPage() {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Log full search parameters for debugging
    console.log('🔍 Callback URL Search Parameters:', location.search);

    // Récupérer le code d'autorisation et le state depuis l'URL
    const params = new URLSearchParams(location.search);
    
    // Extract all potential authorization codes
    const authCode = params.get("auth_code") || params.get("code");
    const state = params.get("state");

    // Log extracted parameters
    console.log('🕵️ Extracted Parameters:', {
      authCode,
      state,
      fullParams: Object.fromEntries(params)
    });

    if (!authCode) {
      const errorMessage = "Aucun code d'autorisation reçu.";
      console.error(`🚨 ${errorMessage}`);
      setError(errorMessage);
      return;
    }

    // Appeler le backend pour échanger le code contre un access token
    const fetchAccessToken = async () => {
      try {
        // Use environment variable for backend URL
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000/auth/callback';

        console.log('🌐 Attempting to fetch access token:', {
          backendUrl,
          authCode,
          state
        });

        const response = await axios({
          method: 'get',
          url: `${backendUrl}/auth/callback`,
          params: { 
            code: authCode,
            state: state
          },
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // Log full response for debugging
        console.log('🔑 Token Response:', {
          status: response.status,
          data: response.data
        });

        // More flexible token extraction
        const token = response.data.AccessToken || 
                      response.data.accessToken || 
                      response.data.token;

        if (!token) {
          throw new Error('No access token found in response');
        }

        setAccessToken(token);
      } catch (err) {
        console.error("🚨 Token Exchange Error:", {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            data: err.response.data
          } : null
        });

        setError(
          err.response?.data?.message || 
          err.message || 
          "Erreur lors de l'échange du code d'autorisation."
        );
      }
    };

    fetchAccessToken();
  }, [location.search]);

  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "50px", 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1>Résultat de l'authentification TikTok</h1>
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
      {accessToken ? (
        <div>
          <h2>Access Token :</h2>
          <p style={{ 
            wordBreak: 'break-all', 
            backgroundColor: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '5px' 
          }}>
            {accessToken}
          </p>
        </div>
      ) : (
        !error && <p>Chargement...</p>
      )}
    </div>
  );
}

export default CallbackPage;

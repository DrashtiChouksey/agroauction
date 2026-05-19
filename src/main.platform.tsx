import React from 'react'
import ReactDOM from 'react-dom/client'
import { FarmerBuyerApp } from './FarmerBuyerApp.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { CustomCursor } from './components/CustomCursor'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1009058164970-foj7ck32khadhn6ab6k4gn895n8isagu.apps.googleusercontent.com">
      <CustomCursor />
      <FarmerBuyerApp />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

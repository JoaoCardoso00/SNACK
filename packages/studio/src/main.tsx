import React from 'react'
import ReactDOM from 'react-dom/client'
import { StudioRouter } from './components/router'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StudioRouter />
  </React.StrictMode>
)

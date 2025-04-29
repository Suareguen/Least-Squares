import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LinearRegressionVisualization from './LinearRegressionVisualization.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LinearRegressionVisualization />
  </StrictMode>,
)

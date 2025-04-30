import React, { useState } from 'react'
import LinearRegressionVisualization from './components/LinearRegressionVisualization'
import DerivativeVisualization from './components/DerivativeVisualization'

function App() {
    const [activeVisualization, setActiveVisualization] = useState('linear')

    return (
        <div className="p-4">
            <div className="flex items-center justify-center mb-6">
                <div className="bg-gray-200 rounded-full p-1">
                    <button
                        className={`px-4 py-2 rounded-full ${activeVisualization === 'linear' ? 'bg-blue-500 text-white' : 'bg-transparent'}`}
                        onClick={() => setActiveVisualization('linear')}
                    >
                        Regresión Lineal
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${activeVisualization === 'derivative' ? 'bg-blue-500 text-white' : 'bg-transparent'}`}
                        onClick={() => setActiveVisualization('derivative')}
                    >
                        Derivada
                    </button>
                </div>
            </div>

            <div className="visualization-container">
                {activeVisualization === 'linear' ? (
                    <LinearRegressionVisualization />
                ) : (
                    <DerivativeVisualization />
                )}
            </div>
        </div>
    )
}

export default App
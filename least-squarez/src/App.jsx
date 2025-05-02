import React, { useState } from 'react'
import LinearRegressionVisualization from './components/LinearRegressionVisualization'
import DerivativeVisualization from './components/DerivativeVisualization'
import BayesPlayground from './components/NaiveBayes'
import CoinFlipProbability from './components/Probability'



export default function App() {
    const [activeVisualization, setActiveVisualization] = useState('linear')

    const buttons = [
        { id: 'linear', label: 'Regresión Lineal' },
        { id: 'derivative', label: 'Derivada' },
        { id: 'bayes', label: 'Bayes' },
        { id: 'coin', label: 'Coin Probability' },
    ]

    return (
        <div className="p-4">
            {/* selector */}
            <div className="flex items-center justify-center mb-6">
                <div className="bg-gray-200 rounded-full p-1 flex gap-1">
                    {buttons.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setActiveVisualization(id)}
                            className={`
                px-4 py-2 rounded-full transition
                ${activeVisualization === id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-transparent hover:bg-blue-100'}
              `}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* visualización activa */}
            <div className="visualization-container">
                {activeVisualization === 'linear' && <LinearRegressionVisualization />}
                {activeVisualization === 'derivative' && <DerivativeVisualization />}
                {activeVisualization === 'bayes' && <BayesPlayground />}
                {activeVisualization === 'coin' && <CoinFlipProbability />}
            </div>
        </div>
    )
}
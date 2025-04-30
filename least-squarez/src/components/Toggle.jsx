import React, { useState } from 'react'

function Toggle() {
    const [activeVisualization, setActiveVisualization] = useState('linear-regression');
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-center text-blue-800 mb-2">
                        Visualizaciones Matemáticas Interactivas
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Herramientas interactivas para comprender conceptos matemáticos fundamentales
                    </p>

                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-200 p-1 rounded-lg inline-flex">
                            <button
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${activeVisualization === 'linear-regression'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                                    }`}
                                onClick={() => setActiveVisualization('linear-regression')}
                            >
                                Regresión Lineal
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${activeVisualization === 'derivative'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                                    }`}
                                onClick={() => setActiveVisualization('derivative')}
                            >
                                Derivadas
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        {activeVisualization === 'linear-regression' ? (
                            <div className="visualization-container">
                                <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
                                    Método de Mínimos Cuadrados
                                </h2>
                                <p className="text-gray-600 text-center mb-6">
                                    Explora cómo funciona el ajuste de una recta a un conjunto de datos mediante el método de mínimos cuadrados
                                </p>
                                <LinearRegressionVisualization />
                            </div>
                        ) : (
                            <div className="visualization-container">
                                <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
                                    Interpretación Geométrica de la Derivada
                                </h2>
                                <p className="text-gray-600 text-center mb-6">
                                    Visualiza cómo la derivada representa la pendiente de la tangente a una función en cada punto
                                </p>
                                <DerivativeVisualization />
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4 text-center">Acerca de estas visualizaciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border-r border-gray-200 pr-4">
                            <h3 className="font-semibold text-lg mb-2 text-blue-700">Regresión Lineal</h3>
                            <p className="text-sm text-gray-600">
                                Esta visualización muestra cómo el método de mínimos cuadrados encuentra la línea que mejor se ajusta a un conjunto de datos.
                                Permite experimentar con diferentes pendientes e interceptos para ver cómo se minimiza la suma de los errores cuadráticos.
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                Conceptos clave: ajuste de curvas, error cuadrático, optimización, predicción.
                            </p>
                        </div>
                        <div className="pl-4">
                            <h3 className="font-semibold text-lg mb-2 text-blue-700">Derivadas</h3>
                            <p className="text-sm text-gray-600">
                                La visualización de derivadas muestra interactivamente cómo la derivada representa la pendiente de la tangente a una función en cada punto.
                                Permite explorar diferentes funciones y ver cómo cambia la derivada a lo largo de la curva.
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                Conceptos clave: tasa de cambio instantánea, pendiente de la tangente, límites, cálculo diferencial.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Toggle
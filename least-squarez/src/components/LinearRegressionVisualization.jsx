import { useState, useEffect } from 'react';

const LinearRegressionVisualization = () => {
  // Datos iniciales
  const initialData = [
    { x: 10, y: 15 },
    { x: 20, y: 25 },
    { x: 30, y: 32 },
    { x: 40, y: 40 },
    { x: 50, y: 48 },
    { x: 60, y: 65 },
    { x: 70, y: 70 },
    { x: 80, y: 85 }
  ];

  const [data, setData] = useState(initialData);
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(5);
  const [showResiduals, setShowResiduals] = useState(true);
  const [showSquares, setShowSquares] = useState(true);
  const [showOptimalResiduals, setShowOptimalResiduals] = useState(false);
  const [showErrorValues, setShowErrorValues] = useState(true);
  const [sumOfSquares, setSumOfSquares] = useState(0);
  const [optimalSumOfSquares, setOptimalSumOfSquares] = useState(0);
  const [bestFitLine, setBestFitLine] = useState({ slope: 0, intercept: 0 });
  const [isOptimal, setIsOptimal] = useState(false);

  // Dimensiones del gráfico
  const width = 600;
  const height = 400;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Calcular la línea de mejor ajuste con mínimos cuadrados
  useEffect(() => {
    // Calcular medias
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    // Calcular pendiente e intercepto
    const numerator = data.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
    const denominator = data.reduce((sum, point) => sum + Math.pow(point.x - meanX, 2), 0);

    const optimalSlope = denominator !== 0 ? numerator / denominator : 0;
    const optimalIntercept = meanY - optimalSlope * meanX;

    setBestFitLine({ slope: optimalSlope, intercept: optimalIntercept });

    // Comparar si la línea actual es la óptima
    setIsOptimal(Math.abs(slope - optimalSlope) < 0.01 && Math.abs(intercept - optimalIntercept) < 0.01);
  }, [data, slope, intercept]);

  // Calcular suma de cuadrados de residuos para la línea actual y la óptima
  useEffect(() => {
    // Para la línea actual
    const sse = data.reduce((sum, point) => {
      const predictedY = slope * point.x + intercept;
      return sum + Math.pow(point.y - predictedY, 2);
    }, 0);
    setSumOfSquares(sse);

    // Para la línea óptima
    const optimalSse = data.reduce((sum, point) => {
      const predictedY = bestFitLine.slope * point.x + bestFitLine.intercept;
      return sum + Math.pow(point.y - predictedY, 2);
    }, 0);
    setOptimalSumOfSquares(optimalSse);
  }, [data, slope, intercept, bestFitLine]);

  // Función para escalar valores a coordenadas del gráfico
  const scaleX = (x) => padding + (x / 100) * chartWidth;
  const scaleY = (y) => height - padding - (y / 100) * chartHeight;

  // Función para dibujar la línea de regresión
  const getLinePoints = () => {
    const startX = 0;
    const endX = 100;
    const startY = intercept + slope * startX;
    const endY = intercept + slope * endX;

    return {
      x1: scaleX(startX),
      y1: scaleY(startY),
      x2: scaleX(endX),
      y2: scaleY(endY)
    };
  };

  // Manejo del movimiento de la línea
  const handleSlopeChange = (e) => {
    setSlope(parseFloat(e.target.value));
  };

  const handleInterceptChange = (e) => {
    setIntercept(parseFloat(e.target.value));
  };

  const handleOptimize = () => {
    setSlope(bestFitLine.slope);
    setIntercept(bestFitLine.intercept);
  };

  // Restablecer datos a los iniciales
  const handleResetData = () => {
    setData(initialData);
    setSlope(1);
    setIntercept(5);
  };

  // Calculamos los residuos (errores) para la línea actual
  const residuals = data.map((point) => {
    const predictedY = slope * point.x + intercept;
    return {
      x: point.x,
      y: point.y,
      predictedY: predictedY,
      error: point.y - predictedY,
      squaredError: Math.pow(point.y - predictedY, 2)
    };
  });

  // Calculamos los residuos para la línea óptima
  const optimalResiduals = data.map((point) => {
    const predictedY = bestFitLine.slope * point.x + bestFitLine.intercept;
    return {
      x: point.x,
      y: point.y,
      predictedY: predictedY,
      error: point.y - predictedY,
      squaredError: Math.pow(point.y - predictedY, 2)
    };
  });

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Visualización de Mínimos Cuadrados</h2>

      <div className="w-full max-w-3xl mb-4 p-4 bg-white rounded shadow">
        <svg
          width={width}
          height={height}
          className="bg-white"
        >
          {/* Cuadrícula */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`grid-h-${i}`}
              x1={padding}
              y1={scaleY(i * 10)}
              x2={width - padding}
              y2={scaleY(i * 10)}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`grid-v-${i}`}
              x1={scaleX(i * 10)}
              y1={padding}
              x2={scaleX(i * 10)}
              y2={height - padding}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}

          {/* Ejes */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="black"
            strokeWidth="2"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={padding}
            y2={padding}
            stroke="black"
            strokeWidth="2"
          />

          {/* Etiquetas de los ejes */}
          <text x={width / 2} y={height - 10} textAnchor="middle">X</text>
          <text x={15} y={height / 2} textAnchor="middle" transform={`rotate(-90, 15, ${height / 2})`}>Y</text>

          {/* Cuadrados de error */}
          {showSquares && residuals.map((r, i) => (
            <rect
              key={`square-${i}`}
              x={scaleX(r.x)}
              y={Math.min(scaleY(r.y), scaleY(r.predictedY))}
              width={Math.abs(scaleY(r.y) - scaleY(r.predictedY))}
              height={Math.abs(scaleY(r.y) - scaleY(r.predictedY))}
              fill="rgba(255, 0, 0, 0.2)"
              stroke="red"
              strokeWidth="1"
            />
          ))}

          {/* Línea de regresión */}
          <line
            {...getLinePoints()}
            stroke={isOptimal ? "green" : "blue"}
            strokeWidth="2"
          />

          {/* Línea de mejor ajuste (opcional) */}
          {!isOptimal && (
            <line
              x1={scaleX(0)}
              y1={scaleY(bestFitLine.intercept)}
              x2={scaleX(100)}
              y2={scaleY(bestFitLine.slope * 100 + bestFitLine.intercept)}
              stroke="green"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}

          {/* Residuos para la línea óptima (mostrados en verde) */}
          {showOptimalResiduals && !isOptimal && optimalResiduals.map((r, i) => (
            <line
              key={`optimal-error-${i}`}
              x1={scaleX(r.x)}
              y1={scaleY(r.y)}
              x2={scaleX(r.x)}
              y2={scaleY(r.predictedY)}
              stroke="green"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          ))}

          {/* Residuos para la línea actual (líneas de error) */}
          {showResiduals && residuals.map((r, i) => (
            <line
              key={`error-${i}`}
              x1={scaleX(r.x)}
              y1={scaleY(r.y)}
              x2={scaleX(r.x)}
              y2={scaleY(r.predictedY)}
              stroke="red"
              strokeWidth="2"
            />
          ))}

          {/* Mostrar valores de error para la línea actual */}
          {showErrorValues && showResiduals && residuals.map((r, i) => (
            <g key={`error-value-${i}`}>
              <text
                x={scaleX(r.x) + 5}
                y={(scaleY(r.y) + scaleY(r.predictedY)) / 2}
                fill="red"
                fontSize="10"
                fontWeight="bold"
                textAnchor="start"
              >
                {Math.abs(r.error).toFixed(1)}
              </text>
              <circle
                cx={scaleX(r.x)}
                cy={(scaleY(r.y) + scaleY(r.predictedY)) / 2}
                r="2"
                fill="red"
              />
            </g>
          ))}

          {/* Puntos de datos */}
          {data.map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r="6"
              fill="purple"
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Parámetros de la línea</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium">
              Pendiente (m): {slope.toFixed(2)}
              <input
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={slope}
                onChange={handleSlopeChange}
                className="w-full mt-1"
              />
            </label>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">
              Intercepto (b): {intercept.toFixed(2)}
              <input
                type="range"
                min="-20"
                max="40"
                step="0.5"
                value={intercept}
                onChange={handleInterceptChange}
                className="w-full mt-1"
              />
            </label>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleOptimize}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Calcular Línea Óptima
            </button>
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Restablecer Datos
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Estadísticas del Error</h3>
          <div className="mb-3 p-2 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">Línea Actual:</p>
            <p className="text-sm">
              <strong>Suma de Errores Cuadrados:</strong> {sumOfSquares.toFixed(2)}
            </p>
            <p className="text-sm">
              <strong>MSE:</strong> {(sumOfSquares / data.length).toFixed(2)}
            </p>
          </div>

          <div className="mb-3 p-2 bg-green-50 rounded">
            <p className="text-sm font-medium text-green-800">Línea Óptima:</p>
            <p className="text-sm">
              <strong>Suma de Errores Cuadrados:</strong> {optimalSumOfSquares.toFixed(2)}
            </p>
            <p className="text-sm">
              <strong>MSE:</strong> {(optimalSumOfSquares / data.length).toFixed(2)}
            </p>
          </div>

          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showResiduals}
                onChange={() => setShowResiduals(!showResiduals)}
                className="mr-2"
              />
              Mostrar Residuos (Línea Actual)
            </label>
          </div>
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showErrorValues}
                onChange={() => setShowErrorValues(!showErrorValues)}
                className="mr-2"
                disabled={!showResiduals}
              />
              Mostrar Valores de Error
            </label>
          </div>
          <div className="mb-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOptimalResiduals}
                onChange={() => setShowOptimalResiduals(!showOptimalResiduals)}
                className="mr-2"
              />
              Mostrar Residuos (Línea Óptima)
            </label>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showSquares}
                onChange={() => setShowSquares(!showSquares)}
                className="mr-2"
              />
              Mostrar Cuadrados de Error
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white rounded shadow w-full max-w-3xl">
        <h3 className="text-lg font-semibold mb-2">Información</h3>
        <p className="text-sm">
          • Este gráfico muestra cómo funciona el método de mínimos cuadrados para encontrar la mejor línea de regresión.
        </p>
        <p className="text-sm">
          • Puedes usar los controles deslizantes para ajustar la pendiente y el intercepto de la línea.
        </p>
        <p className="text-sm">
          • Los <strong>residuos de la línea actual</strong> se muestran como líneas rojas verticales que representan el error entre los puntos observados y la predicción.
        </p>
        <p className="text-sm">
          • Los <strong>valores de error</strong> muestran numéricamente la magnitud de la distancia vertical (error) de cada punto a la recta.
        </p>
        <p className="text-sm">
          • Los <strong>residuos de la línea óptima</strong> se muestran como líneas verdes punteadas, mostrando cómo se minimizan los errores en la solución óptima.
        </p>
        <p className="text-sm">
          • Los <strong>cuadrados</strong> representan visualmente el error cuadrático para la línea actual.
        </p>
        <p className="text-sm">
          • La línea azul es tu recta actual, y la línea verde punteada representa la recta óptima (si es diferente).
        </p>
        <p className="text-sm">
          • El método de mínimos cuadrados encuentra los valores de pendiente e intercepto que <strong>minimizan</strong> la suma de los errores cuadrados.
        </p>
      </div>
    </div>
  );
};

export default LinearRegressionVisualization
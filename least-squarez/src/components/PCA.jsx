import { useState, useEffect, useMemo } from "react";

/**
 * PCAVisualization – Visualización interactiva del Análisis de Componentes Principales
 * Una herramienta educativa para entender cómo funciona el PCA en la reducción de dimensionalidad
 */
const PCAVisualization = () => {
    // Estados para mostrar/ocultar secciones
    const [showExplanation, setShowExplanation] = useState(true);
    const [showMathDetails, setShowMathDetails] = useState(false);
    const [showSteps, setShowSteps] = useState(true);

    // Estado para el conjunto de datos y componentes principales
    const [datasetType, setDatasetType] = useState("correlation");
    const [numPoints, setNumPoints] = useState(50);
    const [noise, setNoise] = useState(20);
    const [rotation, setRotation] = useState(45);
    const [showOriginalAxes, setShowOriginalAxes] = useState(true);
    const [showPCAAxes, setShowPCAAxes] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    // Generar datos de ejemplo
    const generateData = () => {
        const data = [];
        const rad = rotation * Math.PI / 180;
        const cosRad = Math.cos(rad);
        const sinRad = Math.sin(rad);

        for (let i = 0; i < numPoints; i++) {
            // Base values depending on dataset type
            let x, y;

            if (datasetType === "correlation") {
                // Correlated data along a line with slope
                const t = (Math.random() * 2 - 1) * 5;
                x = t;
                y = t * 0.8;
            } else if (datasetType === "anticorrelation") {
                // Anti-correlated data
                const t = (Math.random() * 2 - 1) * 5;
                x = t;
                y = -t * 0.8;
            } else {
                // Circular/uncorrelated data
                const angle = Math.random() * Math.PI * 2;
                const radius = 2 + Math.random() * 3;
                x = Math.cos(angle) * radius;
                y = Math.sin(angle) * radius;
            }

            // Add noise
            const noiseLevel = noise / 100;
            x += (Math.random() * 2 - 1) * noiseLevel * 3;
            y += (Math.random() * 2 - 1) * noiseLevel * 3;

            // Apply rotation if needed
            const rotatedX = x * cosRad - y * sinRad;
            const rotatedY = x * sinRad + y * cosRad;

            data.push([rotatedX, rotatedY]);
        }

        return data;
    };

    // Calcular estadísticas y PCA
    const calculatePCA = (data) => {
        // Calculate mean of each dimension
        const n = data.length;
        const mean = [0, 0];

        for (const point of data) {
            mean[0] += point[0];
            mean[1] += point[1];
        }

        mean[0] /= n;
        mean[1] /= n;

        // Center the data
        const centeredData = data.map(point => [
            point[0] - mean[0],
            point[1] - mean[1]
        ]);

        // Calculate covariance matrix
        const cov = [
            [0, 0],
            [0, 0]
        ];

        for (const point of centeredData) {
            cov[0][0] += point[0] * point[0];
            cov[0][1] += point[0] * point[1];
            cov[1][0] += point[1] * point[0];
            cov[1][1] += point[1] * point[1];
        }

        cov[0][0] /= n - 1;
        cov[0][1] /= n - 1;
        cov[1][0] /= n - 1;
        cov[1][1] /= n - 1;

        // Calculate eigenvalues and eigenvectors (for 2x2 matrix)
        const trace = cov[0][0] + cov[1][1];
        const det = cov[0][0] * cov[1][1] - cov[0][1] * cov[1][0];

        const lambda1 = (trace + Math.sqrt(trace * trace - 4 * det)) / 2;
        const lambda2 = (trace - Math.sqrt(trace * trace - 4 * det)) / 2;

        // First eigenvector
        let v1;
        if (cov[0][1] !== 0) {
            const ev1_1 = cov[0][1];
            const ev1_2 = lambda1 - cov[0][0];
            const length1 = Math.sqrt(ev1_1 * ev1_1 + ev1_2 * ev1_2);
            v1 = [ev1_1 / length1, ev1_2 / length1];
        } else {
            v1 = cov[0][0] > cov[1][1] ? [1, 0] : [0, 1];
        }

        // Second eigenvector (perpendicular to first)
        const v2 = [-v1[1], v1[0]];

        // Project data onto principal components
        const projectedData = centeredData.map(point => [
            point[0] * v1[0] + point[1] * v1[1],
            point[0] * v2[0] + point[1] * v2[1]
        ]);

        return {
            originalData: data,
            centeredData,
            mean,
            cov,
            eigenvalues: [lambda1, lambda2],
            eigenvectors: [v1, v2],
            explainedVariance: [
                lambda1 / (lambda1 + lambda2),
                lambda2 / (lambda1 + lambda2)
            ],
            projectedData
        };
    };

    // Generar datos y calcular PCA
    const { originalData, centeredData, mean, cov, eigenvalues, eigenvectors, explainedVariance, projectedData } = useMemo(() => {
        const data = generateData();
        return calculatePCA(data);
    }, [datasetType, numPoints, noise, rotation]);

    // Configuración del plano cartesiano
    const canvasWidth = 500;
    const canvasHeight = 400;
    const padding = 40;
    const xScale = (x) => (x * 30) + canvasWidth / 2;
    const yScale = (y) => canvasHeight / 2 - (y * 30);

    // Obtener límites para ejes
    const getBounds = () => {
        const allData = [...originalData];

        let minX = Math.min(...allData.map(p => p[0]));
        let maxX = Math.max(...allData.map(p => p[0]));
        let minY = Math.min(...allData.map(p => p[1]));
        let maxY = Math.max(...allData.map(p => p[1]));

        // Add buffer
        const bufferX = (maxX - minX) * 0.2;
        const bufferY = (maxY - minY) * 0.2;

        return {
            minX: Math.min(-5, minX - bufferX),
            maxX: Math.max(5, maxX + bufferX),
            minY: Math.min(-5, minY - bufferY),
            maxY: Math.max(5, maxY + bufferY)
        };
    };

    // Trazar datos en SVG
    const plotData = () => {
        const dataPoints = [];
        const dataToShow = currentStep >= 2 ? centeredData : originalData;

        for (let i = 0; i < dataToShow.length; i++) {
            const [x, y] = dataToShow[i];
            dataPoints.push(
                <circle
                    key={`data-${i}`}
                    cx={xScale(x)}
                    cy={yScale(y)}
                    r="4"
                    fill="#3B82F6"
                    fillOpacity="0.7"
                    stroke="#2563EB"
                    strokeWidth="1"
                />
            );
        }

        return dataPoints;
    };

    // Trazar ejes originales
    const plotOriginalAxes = () => {
        if (!showOriginalAxes) return null;

        const bounds = getBounds();

        return (
            <>
                {/* X-axis */}
                <line
                    x1={xScale(bounds.minX)}
                    y1={yScale(0)}
                    x2={xScale(bounds.maxX)}
                    y2={yScale(0)}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray={currentStep >= 3 ? "4" : "none"}
                />
                {/* Y-axis */}
                <line
                    x1={xScale(0)}
                    y1={yScale(bounds.minY)}
                    x2={xScale(0)}
                    y2={yScale(bounds.maxY)}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray={currentStep >= 3 ? "4" : "none"}
                />

                {/* Labels */}
                <text x={xScale(bounds.maxX) - 15} y={yScale(0) + 20} fill="#64748B" fontSize="12">X</text>
                <text x={xScale(0) + 10} y={yScale(bounds.maxY) + 5} fill="#64748B" fontSize="12">Y</text>
            </>
        );
    };

    // Trazar ejes PCA
    const plotPCAAxes = () => {
        if (!showPCAAxes || currentStep < 3) return null;

        const bounds = getBounds();
        const maxLength = Math.max(
            Math.abs(bounds.minX),
            Math.abs(bounds.maxX),
            Math.abs(bounds.minY),
            Math.abs(bounds.maxY)
        ) * 1.2;

        return (
            <>
                {/* First principal component */}
                <line
                    x1={xScale(eigenvectors[0][0] * -maxLength)}
                    y1={yScale(eigenvectors[0][1] * -maxLength)}
                    x2={xScale(eigenvectors[0][0] * maxLength)}
                    y2={yScale(eigenvectors[0][1] * maxLength)}
                    stroke="#DC2626"
                    strokeWidth="2"
                />

                {/* Second principal component */}
                <line
                    x1={xScale(eigenvectors[1][0] * -maxLength)}
                    y1={yScale(eigenvectors[1][1] * -maxLength)}
                    x2={xScale(eigenvectors[1][0] * maxLength)}
                    y2={yScale(eigenvectors[1][1] * maxLength)}
                    stroke="#059669"
                    strokeWidth="2"
                />

                {/* Labels */}
                <text
                    x={xScale(eigenvectors[0][0] * maxLength * 0.8)}
                    y={yScale(eigenvectors[0][1] * maxLength * 0.8) - 10}
                    fill="#DC2626"
                    fontSize="14"
                    fontWeight="bold"
                >
                    PC1 ({(explainedVariance[0] * 100).toFixed(1)}%)
                </text>

                <text
                    x={xScale(eigenvectors[1][0] * maxLength * 0.8)}
                    y={yScale(eigenvectors[1][1] * maxLength * 0.8) - 10}
                    fill="#059669"
                    fontSize="14"
                    fontWeight="bold"
                >
                    PC2 ({(explainedVariance[1] * 100).toFixed(1)}%)
                </text>
            </>
        );
    };

    // Generar proyecciones
    const plotProjections = () => {
        if (currentStep < 4) return null;

        const projectionLines = [];

        for (let i = 0; i < centeredData.length; i++) {
            const original = centeredData[i];
            const projected = projectedData[i];

            // Visualize only projection to PC1
            const reconX = projected[0] * eigenvectors[0][0];
            const reconY = projected[0] * eigenvectors[0][1];

            projectionLines.push(
                <line
                    key={`proj-${i}`}
                    x1={xScale(original[0])}
                    y1={yScale(original[1])}
                    x2={xScale(reconX)}
                    y2={yScale(reconY)}
                    stroke="#9333EA"
                    strokeWidth="1"
                    strokeDasharray="2"
                    strokeOpacity="0.6"
                />
            );

            projectionLines.push(
                <circle
                    key={`proj-point-${i}`}
                    cx={xScale(reconX)}
                    cy={yScale(reconY)}
                    r="3"
                    fill="#9333EA"
                    fillOpacity="0.7"
                />
            );
        }

        return projectionLines;
    };

    // Regenerar datos cuando cambian los parámetros
    useEffect(() => {
        // Regenerate data when parameters change
    }, [datasetType, numPoints, noise, rotation]);

    // Formatear número para mostrar
    const formatNumber = (num) => {
        return num.toFixed(2).replace(/\.00$/, '');
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-3">Visualización del Análisis de Componentes Principales (PCA)</h2>

            {/* Explicación del problema */}
            <div className="w-full max-w-3xl mb-4 bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">¿Qué es PCA?</h3>
                <p className="text-gray-700 mb-2">
                    El Análisis de Componentes Principales (PCA) es una técnica de reducción de dimensionalidad que encuentra las direcciones
                    (componentes) con mayor varianza en los datos multidimensionales. Estos componentes son ortogonales entre sí y
                    capturan progresivamente menos varianza.
                </p>
                <p className="text-gray-700">
                    Esta visualización interactiva muestra cómo el PCA encuentra estas direcciones en datos bidimensionales, permitiéndote
                    entender los pasos clave del algoritmo y cómo diferentes patrones en los datos afectan sus resultados.
                </p>
            </div>

            {/* Controles */}
            <div className="w-full max-w-3xl mb-4 bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Configuración</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Tipo de datos */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Tipo de datos:
                        </label>
                        <select
                            value={datasetType}
                            onChange={(e) => setDatasetType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                            <option value="correlation">Correlación positiva</option>
                            <option value="anticorrelation">Correlación negativa</option>
                            <option value="uncorrelated">Sin correlación (circular)</option>
                        </select>
                    </div>

                    {/* Número de puntos */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Número de puntos: {numPoints}
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="200"
                            step="10"
                            value={numPoints}
                            onChange={(e) => setNumPoints(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Ruido */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Nivel de ruido: {noise}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={noise}
                            onChange={(e) => setNoise(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Rotación */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Rotación: {rotation}°
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="180"
                            step="15"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                {/* Visibilidad de ejes */}
                <div className="flex flex-wrap gap-4 mt-2">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={showOriginalAxes}
                            onChange={() => setShowOriginalAxes(!showOriginalAxes)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar ejes originales</span>
                    </label>

                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={showPCAAxes}
                            onChange={() => setShowPCAAxes(!showPCAAxes)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mostrar componentes principales</span>
                    </label>
                </div>
            </div>

            {/* Visualización */}
            <div className="w-full max-w-3xl mb-4 bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Visualización de PCA</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className={`px-3 py-1 rounded text-sm font-medium ${currentStep === 1
                                    ? "bg-gray-100 text-gray-400"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                }`}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                            disabled={currentStep === 4}
                            className={`px-3 py-1 rounded text-sm font-medium ${currentStep === 4
                                    ? "bg-gray-100 text-gray-400"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                }`}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>

                {/* Current step indicator */}
                <div className="flex justify-between mb-4 px-4">
                    <div className={`text-center ${currentStep === 1 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center ${currentStep === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                            }`}>1</div>
                        <span className="text-xs mt-1 block">Datos originales</span>
                    </div>
                    <div className={`text-center ${currentStep === 2 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center ${currentStep === 2 ? "bg-blue-600 text-white" : currentStep > 2 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"
                            }`}>2</div>
                        <span className="text-xs mt-1 block">Centrar datos</span>
                    </div>
                    <div className={`text-center ${currentStep === 3 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center ${currentStep === 3 ? "bg-blue-600 text-white" : currentStep > 3 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"
                            }`}>3</div>
                        <span className="text-xs mt-1 block">Componentes</span>
                    </div>
                    <div className={`text-center ${currentStep === 4 ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                        <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center ${currentStep === 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                            }`}>4</div>
                        <span className="text-xs mt-1 block">Proyección</span>
                    </div>
                </div>

                {/* Explicación del paso actual */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-800 mb-1">
                        {currentStep === 1 && "Paso 1: Datos originales"}
                        {currentStep === 2 && "Paso 2: Centrar los datos"}
                        {currentStep === 3 && "Paso 3: Encontrar componentes principales"}
                        {currentStep === 4 && "Paso 4: Proyectar datos en componentes principales"}
                    </h4>
                    <p className="text-sm text-blue-700">
                        {currentStep === 1 &&
                            "Comenzamos con un conjunto de datos bidimensionales (X, Y). PCA intentará encontrar las direcciones con mayor variabilidad."
                        }
                        {currentStep === 2 &&
                            "Centramos los datos restando la media, haciendo que el centro de los datos esté en el origen (0,0)."
                        }
                        {currentStep === 3 &&
                            "Calculamos la matriz de covarianza y encontramos sus valores propios (varianza) y vectores propios (direcciones). Los vectores propios se convierten en nuestros componentes principales."
                        }
                        {currentStep === 4 &&
                            "Proyectamos los datos sobre los componentes principales. Cada punto tiene coordenadas en el nuevo sistema de ejes PC1 y PC2."
                        }
                    </p>
                </div>

                {/* Canvas de visualización */}
                <div className="w-full h-96 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <svg width="100%" height="100%" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
                        {/* Grid lines */}
                        <defs>
                            <pattern id="smallGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(200, 200, 200, 0.3)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#smallGrid)" />

                        {/* Plot axes */}
                        {plotOriginalAxes()}
                        {plotPCAAxes()}

                        {/* Projection lines */}
                        {plotProjections()}

                        {/* Data points */}
                        {plotData()}

                        {/* Mean point */}
                        {currentStep >= 2 && (
                            <circle
                                cx={xScale(0)}
                                cy={yScale(0)}
                                r="6"
                                fill="#EF4444"
                                stroke="#ffffff"
                                strokeWidth="2"
                            />
                        )}
                    </svg>
                </div>

                {/* Estadísticas y resultados */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Estadísticas básicas</h4>
                        <div className="text-sm">
                            <p className="mb-1">
                                <span className="font-medium">Media:</span> X={formatNumber(mean[0])}, Y={formatNumber(mean[1])}
                            </p>
                            <p className="mb-1">
                                <span className="font-medium">Varianza:</span> X={formatNumber(cov[0][0])}, Y={formatNumber(cov[1][1])}
                            </p>
                            <p>
                                <span className="font-medium">Covarianza:</span> {formatNumber(cov[0][1])}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Resultados PCA</h4>
                        <div className="text-sm">
                            <p className="mb-1">
                                <span className="font-medium text-red-600">PC1:</span> [{formatNumber(eigenvectors[0][0])}, {formatNumber(eigenvectors[0][1])}]
                            </p>
                            <p className="mb-1">
                                <span className="font-medium text-green-600">PC2:</span> [{formatNumber(eigenvectors[1][0])}, {formatNumber(eigenvectors[1][1])}]
                            </p>
                            <p>
                                <span className="font-medium">Varianza explicada:</span> PC1={formatNumber(explainedVariance[0] * 100)}%, PC2={formatNumber(explainedVariance[1] * 100)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pasos del algoritmo */}
            {showSteps && (
                <div className="w-full max-w-3xl mb-4 bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Algoritmo PCA paso a paso</h3>
                        <button
                            onClick={() => setShowSteps(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Ocultar
                        </button>
                    </div>

                    <ol className="list-decimal pl-5 space-y-3 text-sm">
                        <li>
                            <span className="font-medium">Preparar datos:</span> Comienza con una matriz de datos con n observaciones (filas) y p variables (columnas).
                        </li>
                        <li>
                            <span className="font-medium">Estandarizar datos (opcional):</span> Escalar las variables para que tengan media cero y varianza unitaria.
                        </li>
                        <li>
                            <span className="font-medium">Calcular la matriz de covarianza:</span> Mide cómo varían conjuntamente las variables.
                        </li>
                        <li>
                            <span className="font-medium">Calcular valores propios y vectores propios:</span> Los vectores propios determinan las direcciones de máxima varianza.
                        </li>
                        <li>
                            <span className="font-medium">Ordenar por importancia:</span> Ordenar los vectores propios por sus valores propios correspondientes en orden descendente.
                        </li>
                        <li>
                            <span className="font-medium">Seleccionar componentes:</span> Elegir los k primeros componentes según la varianza que se desea conservar.
                        </li>
                        <li>
                            <span className="font-medium">Proyectar los datos:</span> Transformar los datos originales al nuevo espacio de componentes principales.
                        </li>
                    </ol>
                </div>
            )}

            {/* Detalles matemáticos */}
            <div className="w-full max-w-3xl bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Explicación matemática</h3>
                    <button
                        onClick={() => setShowMathDetails(!showMathDetails)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        {showMathDetails ? "Ocultar" : "Mostrar"}
                    </button>
                </div>

                {showMathDetails && (
                    <div className="text-sm space-y-3">
                        <div>
                            <p className="font-medium mb-1">Matriz de covarianza:</p>
                            <div className="bg-gray-50 p-3 rounded-lg font-mono">
                                Σ = [
                                <span className="text-blue-600">{formatNumber(cov[0][0])}</span>, {formatNumber(cov[0][1])};
                                <br />
                                {formatNumber(cov[1][0])}, <span className="text-blue-600">{formatNumber(cov[1][1])}</span>
                                ]
                            </div>
                        </div>

                        <div>
                            <p className="font-medium mb-1">Valores propios (eigenvalues):</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                λ<sub>1</sub> = {formatNumber(eigenvalues[0])} → varianza en PC1
                                <br />
                                λ<sub>2</sub> = {formatNumber(eigenvalues[1])} → varianza en PC2
                            </div>
                        </div>

                        <div>
                            <p className="font-medium mb-1">Vectores propios (eigenvectors):</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                v<sub>1</sub> = [{formatNumber(eigenvectors[0][0])}, {formatNumber(eigenvectors[0][1])}] → dirección de PC1
                                <br />
                                v<sub>2</sub> = [{formatNumber(eigenvectors[1][0])}, {formatNumber(eigenvectors[1][1])}] → dirección de PC2
                            </div>
                        </div>

                        <div>
                            <p className="font-medium mb-1">Proyección de un punto (x,y):</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p>Para proyectar un punto x en los componentes principales:</p>
                                <p className="mt-1">z = V<sup>T</sup>(x - μ)</p>
                                <p className="text-xs text-gray-500 mt-1">Donde V es la matriz de vectores propios y μ es el vector de medias</p>
                            </div>
                        </div>

                        <div>
                            <p className="font-medium mb-1">Reducción de dimensionalidad:</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p>Si sólo usamos k componentes principales (k &lt; p):</p>
                                <p className="mt-1">x̂ ≈ μ + V<sub>k</sub>z<sub>k</sub></p>
                                <p className="text-xs text-gray-500 mt-1">Donde V<sub>k</sub> contiene sólo los k primeros vectores propios</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Explicación general */}
            {showExplanation && (
                <div className="w-full max-w-3xl mt-4 bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Entendiendo PCA</h3>
                        <button
                            onClick={() => setShowExplanation(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Ocultar
                        </button>
                    </div>

                    <div className="text-sm space-y-3">
                        <p>
                            <strong>¿Qué es PCA?</strong> El Análisis de Componentes Principales es una técnica estadística que
                            identifica patrones en datos multidimensionales, y expresa los datos como un conjunto más pequeño de
                            variables llamadas componentes principales.
                        </p>

                        <p>
                            <strong>¿Para qué se usa?</strong> PCA se utiliza principalmente para:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Reducción de dimensionalidad (comprimir datos)</li>
                            <li>Visualización de datos multidimensionales</li>
                            <li>Eliminación de ruido y extracción de características</li>
                            <li>Preprocesamiento para otros algoritmos</li>
                        </ul>

                        <p>
                            <strong>Conceptos clave:</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Componentes principales:</strong> Nuevos ejes que maximizan la varianza de los datos proyectados</li>
                            <li><strong>Valores propios:</strong> Indican la cantidad de varianza explicada por cada componente</li>
                            <li><strong>Vectores propios:</strong> Determinan la dirección de los componentes principales</li>
                            <li><strong>Varianza explicada:</strong> Porcentaje de la variabilidad total capturada por cada componente</li>
                        </ul>

                        <p>
                            <strong>Ejemplo práctico:</strong> Imagina que tienes datos de pacientes con múltiples medidas médicas
                            (presión arterial, colesterol, glucosa, etc.). Con PCA podrías reducir estas variables a 2-3 componentes
                            principales que capturen la mayor parte de la variabilidad, permitiéndote visualizar patrones y agrupar
                            pacientes similares.
                        </p>

                        <p>
                            <strong>Limitaciones:</strong> PCA asume relaciones lineales entre variables y es sensible a outliers.
                            Además, los componentes principales pueden ser difíciles de interpretar en términos de las variables originales.
                        </p>
                    </div>
                </div>
            )}

            {/* Aplicaciones */}
            <div className="w-full max-w-3xl mt-4 bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Aplicaciones de PCA</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                        <h4 className="font-medium text-purple-800 mb-1">Reconocimiento facial</h4>
                        <p className="text-sm text-purple-700">
                            PCA reduce la dimensionalidad de imágenes faciales (eigenfaces), conservando las características
                            más distintivas para identificación eficiente.
                        </p>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-3">
                        <h4 className="font-medium text-indigo-800 mb-1">Genómica</h4>
                        <p className="text-sm text-indigo-700">
                            Análisis de expresión génica para identificar patrones en miles de genes
                            simultáneamente, reduciendo a componentes principales biológicamente significativos.
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-medium text-blue-800 mb-1">Finanzas</h4>
                        <p className="text-sm text-blue-700">
                            Descubrir factores subyacentes que afectan a múltiples instrumentos financieros, ayudando
                            en la construcción de portfolios y gestión de riesgos.
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3">
                        <h4 className="font-medium text-green-800 mb-1">Procesamiento de imágenes</h4>
                        <p className="text-sm text-green-700">
                            Compresión de imágenes, eliminación de ruido y extracción de características para
                            visión por computadora y reconocimiento de patrones.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default PCAVisualization;
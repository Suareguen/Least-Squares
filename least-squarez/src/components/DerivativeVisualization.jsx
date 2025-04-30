import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const DerivativeVisualization = () => {
    // Funciones disponibles
    const functions = [
        { name: "x²", func: (x) => x * x, derivative: (x) => 2 * x, latex: "f(x) = x^2" },
        { name: "x³", func: (x) => x * x * x, derivative: (x) => 3 * x * x, latex: "f(x) = x^3" },
        { name: "sin(x)", func: (x) => Math.sin(x), derivative: (x) => Math.cos(x), latex: "f(x) = \\sin(x)" },
        { name: "cos(x)", func: (x) => Math.cos(x), derivative: (x) => -Math.sin(x), latex: "f(x) = \\cos(x)" },
        { name: "e^x", func: (x) => Math.exp(x), derivative: (x) => Math.exp(x), latex: "f(x) = e^x" },
        { name: "ln(x)", func: (x) => Math.log(Math.max(0.1, x)), derivative: (x) => 1 / Math.max(0.1, x), latex: "f(x) = \\ln(x)" }
    ];

    // Estado para controlar parámetros de visualización
    const [selectedFunction, setSelectedFunction] = useState(0);
    const [pointX, setPointX] = useState(1);
    const [showTangentLine, setShowTangentLine] = useState(true);
    const [showDerivativeValue, setShowDerivativeValue] = useState(true);
    const [showDerivativeFunction, setShowDerivativeFunction] = useState(false);
    const [showSecantLines, setShowSecantLines] = useState(false);
    const [deltaX, setDeltaX] = useState(0.5);
    const [autoMode, setAutoMode] = useState(false);

    // Dimensiones del gráfico - definidas como constantes para evitar recreaciones
    const dimensions = {
        width: 600,
        height: 400,
        padding: 40,
        get chartWidth() { return this.width - 2 * this.padding; },
        get chartHeight() { return this.height - 2 * this.padding; }
    };

    // Rango de visualización
    const xRange = [-5, 5]; // Constante, no necesita ser estado

    // Función principal y derivada actual - memoizada para evitar recreaciones
    const currentFunction = useMemo(() => functions[selectedFunction], [selectedFunction]);

    // Funciones para calcular el rango Y - memoizada
    const calculateYRange = useCallback(() => {
        const samples = 100;
        const step = (xRange[1] - xRange[0]) / samples;
        let minY = Infinity;
        let maxY = -Infinity;

        for (let i = 0; i <= samples; i++) {
            const x = xRange[0] + i * step;
            const y = currentFunction.func(x);

            if (!isNaN(y) && isFinite(y)) {
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }

            if (showDerivativeFunction) {
                const dy = currentFunction.derivative(x);
                if (!isNaN(dy) && isFinite(dy)) {
                    minY = Math.min(minY, dy);
                    maxY = Math.max(maxY, dy);
                }
            }
        }

        // Añadir margen
        const margin = (maxY - minY) * 0.2 || 1; // Evitar división por cero
        return [minY - margin, maxY + margin];
    }, [currentFunction, xRange, showDerivativeFunction]);
    // Rango de visualización en Y (calculado dinámicamente)
    const yRange = useMemo(() => calculateYRange(), [calculateYRange]);


    // Animación del punto X (rebota entre los bordes) ---------------
    const directionRef = useRef(1);          // 1 → derecha, -1 → izquierda
    const animationFrameRef = useRef(null);  // Guarda el id del frame
    const speed = 0.03;                      // Paso por frame

    useEffect(() => {
        // Si la animación no está activada, asegurarse de cancelar frames previos
        if (!autoMode) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            return;
        }

        const animate = () => {
            setPointX(prevX => {
                let newX = prevX + speed * directionRef.current;

                // Rebotar en los límites
                if (newX > xRange[1] - 1) {
                    directionRef.current = -1;
                    newX = xRange[1] - 1;
                } else if (newX < xRange[0] + 1) {
                    directionRef.current = 1;
                    newX = xRange[0] + 1;
                }
                return newX;
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        // Limpieza cuando el efecto se desmonte o cambie la dependencia
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [autoMode, xRange]);

    // Funciones para escalar valores a coordenadas del gráfico - memoizadas
    const scaleX = useCallback((x) => {
        return dimensions.padding + ((x - xRange[0]) / (xRange[1] - xRange[0])) * dimensions.chartWidth;
    }, [dimensions, xRange]);

    const scaleY = useCallback((y) => {
        return dimensions.height - dimensions.padding - ((y - yRange[0]) / (yRange[1] - yRange[0])) * dimensions.chartHeight;
    }, [dimensions, yRange]);

    // Calcular puntos para la gráfica de la función - memoizado
    const generateFunctionPoints = useCallback((func) => {
        const points = [];
        const step = (xRange[1] - xRange[0]) / 200;

        for (let x = xRange[0]; x <= xRange[1]; x += step) {
            const y = func(x);
            if (!isNaN(y) && isFinite(y)) {
                points.push({ x, y });
            }
        }

        return points;
    }, [xRange]);

    // Puntos para la función principal y derivada - memoizados
    const functionPoints = useMemo(() =>
        generateFunctionPoints(currentFunction.func),
        [generateFunctionPoints, currentFunction.func]
    );

    const derivativePoints = useMemo(() =>
        showDerivativeFunction ? generateFunctionPoints(currentFunction.derivative) : [],
        [showDerivativeFunction, generateFunctionPoints, currentFunction.derivative]
    );

    // Calcular punto y derivada en el punto seleccionado - memoizado
    const currentY = useMemo(() =>
        currentFunction.func(pointX),
        [currentFunction, pointX]
    );

    const currentDerivative = useMemo(() =>
        currentFunction.derivative(pointX),
        [currentFunction, pointX]
    );

    // Línea tangente - memoizada
    const tangentLine = useMemo(() => ({
        startX: xRange[0],
        startY: currentY - currentDerivative * (pointX - xRange[0]),
        endX: xRange[1],
        endY: currentY + currentDerivative * (xRange[1] - pointX)
    }), [xRange, currentY, currentDerivative, pointX]);

    // Calcular puntos para líneas secantes - memoizado
    const secantLines = useMemo(() => {
        if (!showSecantLines) return [];

        return [
            // Línea secante para x+deltaX
            {
                x1: pointX,
                y1: currentY,
                x2: pointX + deltaX,
                y2: currentFunction.func(pointX + deltaX),
                color: "#ff8c00"
            },
            // Línea secante para x-deltaX
            {
                x1: pointX,
                y1: currentY,
                x2: pointX - deltaX,
                y2: currentFunction.func(pointX - deltaX),
                color: "#9932cc"
            }
        ];
    }, [showSecantLines, pointX, currentY, deltaX, currentFunction]);

    // Manejadores de eventos
    const handleFunctionChange = (e) => {
        const index = parseInt(e.target.value);
        setSelectedFunction(index);
    };

    const handlePointXChange = (e) => {
        const newX = parseFloat(e.target.value);
        setPointX(newX);
        setAutoMode(false);
    };

    const handleDeltaXChange = (e) => {
        setDeltaX(parseFloat(e.target.value));
    };

    // Renderizar líneas de cuadrícula para los ejes - memoizado
    const gridLines = useMemo(() => {
        const xStep = (xRange[1] - xRange[0]) / 10;
        const yStep = (yRange[1] - yRange[0]) / 10;
        const xGridLines = [];
        const yGridLines = [];
        const xLabels = [];
        const yLabels = [];

        // Líneas horizontales y etiquetas Y
        for (let i = 0; i <= 10; i++) {
            const y = yRange[0] + i * yStep;
            yGridLines.push(
                <line
                    key={`grid-h-${i}`}
                    x1={dimensions.padding}
                    y1={scaleY(y)}
                    x2={dimensions.width - dimensions.padding}
                    y2={scaleY(y)}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                />
            );

            // Solo mostrar algunas etiquetas para evitar aglomeración
            if (i % 2 === 0) {
                yLabels.push(
                    <text
                        key={`label-y-${i}`}
                        x={dimensions.padding - 10}
                        y={scaleY(y)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize="10"
                    >
                        {y.toFixed(1)}
                    </text>
                );
            }
        }

        // Líneas verticales y etiquetas X
        for (let i = 0; i <= 10; i++) {
            const x = xRange[0] + i * xStep;
            xGridLines.push(
                <line
                    key={`grid-v-${i}`}
                    x1={scaleX(x)}
                    y1={dimensions.padding}
                    x2={scaleX(x)}
                    y2={dimensions.height - dimensions.padding}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                />
            );

            // Solo mostrar algunas etiquetas para evitar aglomeración
            if (i % 2 === 0) {
                xLabels.push(
                    <text
                        key={`label-x-${i}`}
                        x={scaleX(x)}
                        y={dimensions.height - dimensions.padding + 15}
                        textAnchor="middle"
                        fontSize="10"
                    >
                        {x.toFixed(1)}
                    </text>
                );
            }
        }

        return [...xGridLines, ...yGridLines, ...xLabels, ...yLabels];
    }, [dimensions, xRange, yRange, scaleX, scaleY]);

    // Calcular path string para SVG - memoizado
    const functionPathD = useMemo(() => {
        if (!functionPoints.length) return '';
        return `M ${functionPoints.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' L ')}`;
    }, [functionPoints, scaleX, scaleY]);

    const derivativePathD = useMemo(() => {
        if (!derivativePoints.length) return '';
        return `M ${derivativePoints.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' L ')}`;
    }, [derivativePoints, scaleX, scaleY]);

    // Renderizado del componente
    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Visualización de la Derivada</h2>

            <div className="w-full max-w-3xl mb-4 p-4 bg-white rounded shadow">
                <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    className="bg-white"
                >
                    {/* Cuadrícula y etiquetas */}
                    {gridLines}

                    {/* Eje X */}
                    <line
                        x1={dimensions.padding}
                        y1={scaleY(0)}
                        x2={dimensions.width - dimensions.padding}
                        y2={scaleY(0)}
                        stroke="black"
                        strokeWidth="2"
                    />

                    {/* Eje Y */}
                    <line
                        x1={scaleX(0)}
                        y1={dimensions.padding}
                        x2={scaleX(0)}
                        y2={dimensions.height - dimensions.padding}
                        stroke="black"
                        strokeWidth="2"
                    />

                    {/* Etiquetas de los ejes */}
                    <text x={dimensions.width - dimensions.padding + 15} y={scaleY(0) + 15} textAnchor="middle">X</text>
                    <text x={scaleX(0) + 15} y={dimensions.padding - 10} textAnchor="middle">Y</text>

                    {/* Gráfica de la función */}
                    {functionPathD && (
                        <path
                            d={functionPathD}
                            fill="none"
                            stroke="blue"
                            strokeWidth="2"
                        />
                    )}

                    {/* Gráfica de la derivada si está habilitada */}
                    {showDerivativeFunction && derivativePathD && (
                        <path
                            d={derivativePathD}
                            fill="none"
                            stroke="green"
                            strokeWidth="2"
                            strokeDasharray="4,2"
                        />
                    )}

                    {/* Líneas secantes */}
                    {showSecantLines && secantLines.map((line, i) => (
                        <line
                            key={`secant-${i}`}
                            x1={scaleX(line.x1)}
                            y1={scaleY(line.y1)}
                            x2={scaleX(line.x2)}
                            y2={scaleY(line.y2)}
                            stroke={line.color}
                            strokeWidth="2"
                        />
                    ))}

                    {/* Línea tangente */}
                    {showTangentLine && (
                        <line
                            x1={scaleX(tangentLine.startX)}
                            y1={scaleY(tangentLine.startY)}
                            x2={scaleX(tangentLine.endX)}
                            y2={scaleY(tangentLine.endY)}
                            stroke="red"
                            strokeWidth="2"
                        />
                    )}

                    {/* Punto en la curva */}
                    <circle
                        cx={scaleX(pointX)}
                        cy={scaleY(currentY)}
                        r="6"
                        fill="purple"
                        stroke="white"
                        strokeWidth="2"
                    />

                    {/* Etiqueta del valor de la derivada */}
                    {showDerivativeValue && (
                        <text
                            x={scaleX(pointX) + 15}
                            y={scaleY(currentY) - 15}
                            fill="red"
                            fontSize="12"
                            fontWeight="bold"
                        >
                            f'({pointX.toFixed(2)}) = {currentDerivative.toFixed(2)}
                        </text>
                    )}
                </svg>
            </div>

            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Parámetros de visualización</h3>

                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                            Función:
                            <select
                                value={selectedFunction}
                                onChange={handleFunctionChange}
                                className="w-full p-2 border rounded mt-1"
                            >
                                {functions.map((f, i) => (
                                    <option key={i} value={i}>{f.name}</option>
                                ))}
                            </select>
                        </label>
                        <p className="text-sm font-medium mt-1">{currentFunction.latex}</p>
                        <p className="text-sm font-medium">f'(x) = {
                            selectedFunction === 0 ? "2x" :
                                selectedFunction === 1 ? "3x²" :
                                    selectedFunction === 2 ? "cos(x)" :
                                        selectedFunction === 3 ? "-sin(x)" :
                                            selectedFunction === 4 ? "e^x" :
                                                "1/x"
                        }</p>
                    </div>

                    <div className="mb-3">
                        <label className="block text-sm font-medium">
                            Punto x: {pointX.toFixed(2)}
                            <input
                                type="range"
                                min={xRange[0] + 0.1}
                                max={xRange[1] - 0.1}
                                step="0.1"
                                value={pointX}
                                onChange={handlePointXChange}
                                className="w-full mt-1"
                            />
                        </label>
                    </div>

                    {showSecantLines && (
                        <div className="mb-3">
                            <label className="block text-sm font-medium">
                                Δx: {deltaX.toFixed(2)}
                                <input
                                    type="range"
                                    min="0.05"
                                    max="2"
                                    step="0.05"
                                    value={deltaX}
                                    onChange={handleDeltaXChange}
                                    className="w-full mt-1"
                                />
                            </label>
                        </div>
                    )}

                    <button
                        onClick={() => setAutoMode(!autoMode)}
                        className={`px-4 py-2 ${autoMode ? 'bg-red-600' : 'bg-green-600'} text-white rounded hover:bg-green-700 mr-2`}
                    >
                        {autoMode ? "Detener animación" : "Animar punto"}
                    </button>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-2">Opciones de visualización</h3>

                    <div className="mb-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showTangentLine}
                                onChange={() => setShowTangentLine(!showTangentLine)}
                                className="mr-2"
                            />
                            Mostrar línea tangente
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showDerivativeValue}
                                onChange={() => setShowDerivativeValue(!showDerivativeValue)}
                                className="mr-2"
                            />
                            Mostrar valor de la derivada
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showDerivativeFunction}
                                onChange={() => setShowDerivativeFunction(!showDerivativeFunction)}
                                className="mr-2"
                            />
                            Mostrar función derivada
                        </label>
                    </div>

                    <div className="mb-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showSecantLines}
                                onChange={() => setShowSecantLines(!showSecantLines)}
                                className="mr-2"
                            />
                            Mostrar líneas secantes
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded shadow w-full max-w-3xl">
                <h3 className="text-lg font-semibold mb-2">Explicación de la Derivada</h3>

                <div className="text-sm space-y-2">
                    <p>
                        <strong>¿Qué es una derivada?</strong> La derivada de una función en un punto representa la pendiente de la
                        línea tangente a la gráfica de la función en ese punto. Es la tasa instantánea de cambio.
                    </p>

                    <p>
                        <strong>Interpretación geométrica:</strong> La línea tangente (roja) muestra la pendiente de la función en el
                        punto seleccionado. El valor numérico de esta pendiente es la derivada.
                    </p>

                    <p>
                        <strong>Líneas secantes:</strong> Cuando están activadas, muestran cómo al disminuir Δx, la pendiente de la
                        línea secante se aproxima a la de la tangente. Así es como se define la derivada como límite:
                    </p>

                    <p className="ml-4 font-medium">
                        f'(x) = lim<sub>Δx→0</sub> [f(x+Δx) - f(x)] / Δx
                    </p>

                    <p>
                        <strong>Función derivada:</strong> La línea verde punteada muestra f'(x) para cada valor de x. Observa
                        que cuando la función original crece, su derivada es positiva; cuando decrece, su derivada es negativa;
                        y en los puntos máximos o mínimos, la derivada es cero.
                    </p>

                    <p>
                        <strong>Aplicaciones:</strong> Las derivadas son esenciales para calcular tasas de cambio, optimización,
                        aproximaciones lineales y son la base del cálculo diferencial.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DerivativeVisualization;
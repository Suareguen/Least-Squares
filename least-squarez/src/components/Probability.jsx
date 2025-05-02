import { useState, useMemo } from "react";

/**
 * CoinFlipProbability – Visualización interactiva de probabilidades con monedas
 * Una herramienta educativa para entender probabilidades en juegos de azar
 */
const CoinFlipProbability = () => {
    // Estados para la opción seleccionada
    const [selectedOption, setSelectedOption] = useState("mixed");

    // Estados para mostrar/ocultar secciones
    const [showExplanation, setShowExplanation] = useState(true);
    const [showFormula, setShowFormula] = useState(true);
    const [showSimulation, setShowSimulation] = useState(true);

    // Estado para la simulación
    const [numSimulations, setNumSimulations] = useState(20);
    const [simulationResults, setSimulationResults] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Definición de las opciones
    const options = {
        twoHeads: {
            title: "Dos caras",
            id: "twoHeads",
            probability: 0.25,
            favorableOutcomes: ["HH"],
            description: "Ambas monedas deben mostrar cara"
        },
        twoTails: {
            title: "Dos cruces",
            id: "twoTails",
            probability: 0.25,
            favorableOutcomes: ["TT"],
            description: "Ambas monedas deben mostrar cruz"
        },
        mixed: {
            title: "Una cara y una cruz",
            id: "mixed",
            probability: 0.5,
            favorableOutcomes: ["HT", "TH"],
            description: "Una moneda debe mostrar cara y la otra cruz, en cualquier orden"
        }
    };

    // Enunciado del problema
    const problemStatement = `Tú y tu amigo necesitan decidir quién comprará la carne para una barbacoa. Deciden lanzar una moneda cada uno. Quien adivine correctamente el resultado se libra de la tarea. Si nadie acierta, repiten el proceso.

Tu amigo te da tres opciones para elegir:
• Dos caras
• Dos cruces
• Una cara y una cruz

¿Cuál deberías elegir para maximizar tus posibilidades de evitar la tarea?`;

    // Todos los posibles resultados
    const allOutcomes = [
        { coins: "HH", result: options.twoHeads.favorableOutcomes.includes("HH") ? "twoHeads" : null },
        { coins: "HT", result: options.mixed.favorableOutcomes.includes("HT") ? "mixed" : null },
        { coins: "TH", result: options.mixed.favorableOutcomes.includes("TH") ? "mixed" : null },
        { coins: "TT", result: options.twoTails.favorableOutcomes.includes("TT") ? "twoTails" : null }
    ];

    // Función para simular los lanzamientos
    const runSimulation = () => {
        setIsSimulating(true);
        const results = [];

        // Limpiar resultados anteriores
        setSimulationResults([]);

        // Programar la ejecución de cada lanzamiento con un retraso
        let i = 0;
        const simulateOne = () => {
            if (i < numSimulations) {
                // Generar lanzamiento aleatorio
                const flip1 = Math.random() < 0.5 ? "H" : "T";
                const flip2 = Math.random() < 0.5 ? "H" : "T";
                const outcome = flip1 + flip2;

                // Determinar si ganamos con nuestra elección
                let winner = null;
                if (outcome === "HH") winner = "twoHeads";
                else if (outcome === "TT") winner = "twoTails";
                else winner = "mixed"; // HT o TH

                const result = {
                    id: i + 1,
                    coin1: flip1,
                    coin2: flip2,
                    outcome,
                    winningOption: winner,
                    userWins: winner === selectedOption
                };

                results.push(result);
                setSimulationResults([...results]);

                i++;
                setTimeout(simulateOne, 200); // Retraso de 200ms entre lanzamientos
            } else {
                setIsSimulating(false);
            }
        };

        simulateOne();
    };

    // Calcular estadísticas de la simulación
    const simulationStats = useMemo(() => {
        if (simulationResults.length === 0) return { wins: 0, losses: 0, winRate: 0 };

        const wins = simulationResults.filter(r => r.userWins).length;
        const losses = simulationResults.length - wins;
        const winRate = (wins / simulationResults.length) * 100;

        return { wins, losses, winRate };
    }, [simulationResults]);

    // Formatear porcentajes
    const fmt = (v) => `${v.toFixed(1)}%`;

    // Componente para visualizar una moneda
    const Coin = ({ face }) => (
        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-4 ${face === "H"
            ? "bg-yellow-400 border-yellow-500 text-white"
            : "bg-yellow-700 border-yellow-800 text-yellow-200"
            }`}>
            {face === "H" ? "CARA" : "CRUZ"}
        </div>
    );

    // Renderizado de cada opción
    const OptionCard = ({ option }) => {
        const isSelected = selectedOption === option.id;
        return (
            <div
                className={`p-4 rounded-lg cursor-pointer transition-all ${isSelected
                    ? "bg-blue-600 text-white shadow-lg border-2 border-blue-400"
                    : "bg-white hover:bg-blue-50 shadow border border-gray-200"
                    }`}
                onClick={() => setSelectedOption(option.id)}
            >
                <h3 className={`text-lg font-bold mb-2 ${isSelected ? "text-white" : "text-blue-800"}`}>
                    {option.title}
                </h3>
                <p className={`text-sm mb-3 ${isSelected ? "text-blue-100" : "text-gray-600"}`}>
                    {option.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase font-medium ${isSelected ? "text-blue-200" : "text-gray-500"}`}>
                        Probabilidad:
                    </span>
                    <span className={`text-lg font-bold ${isSelected ? "text-white" : "text-blue-600"}`}>
                        {option.probability * 100}%
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-3">Probabilidades en Lanzamiento de Monedas</h2>

            {/* Enunciado del problema */}
            <div className="w-full max-w-3xl mb-4 bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">El Problema de la Barbacoa</h3>
                <p className="text-gray-700 whitespace-pre-line">{problemStatement}</p>
            </div>

            {/* Opciones de selección */}
            <div className="w-full max-w-3xl mb-6">
                <h3 className="text-lg font-semibold mb-2">Elige tu predicción:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(options).map(option => (
                        <OptionCard key={option.id} option={option} />
                    ))}
                </div>
            </div>

            {/* Visualización de todos los posibles resultados */}
            <div className="w-full max-w-3xl mb-6 bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-3">Posibles resultados de lanzamiento</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allOutcomes.map((outcome, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-lg border ${outcome.result === selectedOption
                                ? "bg-green-100 border-green-400"
                                : "bg-gray-50 border-gray-200"
                                }`}
                        >
                            <div className="flex gap-2 justify-center mb-2">
                                <Coin face={outcome.coins[0]} />
                                <Coin face={outcome.coins[1]} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    Tu amigo: {outcome.coins[0]} • Tú: {outcome.coins[1]}
                                </p>
                                <p className={`text-xs mt-1 font-bold ${outcome.result === selectedOption
                                    ? "text-green-600"
                                    : "text-gray-500"
                                    }`}>
                                    {outcome.result === selectedOption
                                        ? "¡TÚ GANAS!"
                                        : outcome.result
                                            ? "Gana otra opción"
                                            : "Nadie gana"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fórmula y explicación */}
            {showFormula && (
                <div className="w-full max-w-3xl mb-6 bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Cálculo de probabilidad</h3>
                        <button
                            onClick={() => setShowFormula(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Ocultar
                        </button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-center font-serif text-lg">
                            P(dos caras) = P(H) × P(H) = 0.5 × 0.5 = 0.25 <span className="text-sm">(25%)</span>
                        </p>
                        <p className="text-center font-serif text-lg mt-2">
                            P(dos cruces) = P(T) × P(T) = 0.5 × 0.5 = 0.25 <span className="text-sm">(25%)</span>
                        </p>
                        <p className="text-center font-serif text-lg mt-2">
                            P(mixto) = P(H,T) + P(T,H) = 0.25 + 0.25 = 0.5 <span className="text-sm">(50%)</span>
                        </p>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <p className="text-center font-medium text-green-800">
                            La opción "Una cara y una cruz" te da un 50% de probabilidad de ganar, mientras que
                            "Dos caras" o "Dos cruces" solo te dan un 25% cada una.
                        </p>
                    </div>
                </div>
            )}

            {/* Simulación */}
            <div className="w-full max-w-3xl mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Simular lanzamientos</h3>
                    <button
                        onClick={() => setShowSimulation(!showSimulation)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        {showSimulation ? "Ocultar resultados" : "Mostrar resultados"}
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Número de lanzamientos:
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={numSimulations}
                            onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    <div className="w-16">
                        <input
                            type="number"
                            min="5"
                            max="100"
                            value={numSimulations}
                            onChange={(e) => setNumSimulations(parseInt(e.target.value))}
                            className="w-full p-1 border border-gray-300 rounded text-right text-sm"
                        />
                    </div>
                </div>

                <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className={`w-full py-2 rounded-lg font-medium ${isSimulating
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {isSimulating ? "Simulando..." : "Iniciar simulación"}
                </button>

                {/* Resultados de la simulación */}
                {showSimulation && simulationResults.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg mb-3">
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Victorias: <span className="text-green-600 font-bold">{simulationStats.wins}</span>
                                </span>
                                <span className="mx-3 text-gray-300">|</span>
                                <span className="text-sm font-medium text-gray-700">
                                    Derrotas: <span className="text-red-600 font-bold">{simulationStats.losses}</span>
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-medium text-gray-700">
                                    Tasa de victoria:
                                </span>
                                <span className="ml-2 text-lg font-bold text-blue-600">
                                    {fmt(simulationStats.winRate)}
                                </span>
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Monedas
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Resultado
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tu opción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {simulationResults.map((result) => (
                                        <tr key={result.id} className={result.userWins ? "bg-green-50" : ""}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {result.id}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${result.coin1 === "H"
                                                        ? "bg-yellow-400 text-yellow-900"
                                                        : "bg-yellow-700 text-yellow-100"
                                                        }`}>
                                                        {result.coin1}
                                                    </span>
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${result.coin2 === "H"
                                                        ? "bg-yellow-400 text-yellow-900"
                                                        : "bg-yellow-700 text-yellow-100"
                                                        }`}>
                                                        {result.coin2}
                                                    </span>
                                                    <span className="ml-2 text-sm font-medium">
                                                        {result.outcome}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <span className="text-sm">
                                                    {result.winningOption === "twoHeads" && "Dos caras"}
                                                    {result.winningOption === "twoTails" && "Dos cruces"}
                                                    {result.winningOption === "mixed" && "Mixto"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                {result.userWins ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Victoria
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Derrota
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Explicación */}
            {showExplanation && (
                <div className="w-full max-w-3xl bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Explicación</h3>
                        <button
                            onClick={() => setShowExplanation(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Ocultar
                        </button>
                    </div>

                    <div className="text-sm space-y-3">
                        <p>
                            <strong>La regla de multiplicación:</strong> Cuando dos eventos son independientes (como lanzar dos monedas), la probabilidad
                            de que ambos ocurran se calcula multiplicando sus probabilidades individuales.
                        </p>

                        <p>
                            <strong>Cada lanzamiento de moneda:</strong> Tiene una probabilidad de 0.5 (50%) de ser cara y
                            0.5 (50%) de ser cruz.
                        </p>

                        <p>
                            <strong>Para la opción "Dos caras":</strong> Necesitas que ambas monedas muestren cara.
                            P(H) × P(H) = 0.5 × 0.5 = 0.25 (25%)
                        </p>

                        <p>
                            <strong>Para la opción "Dos cruces":</strong> Necesitas que ambas monedas muestren cruz.
                            P(T) × P(T) = 0.5 × 0.5 = 0.25 (25%)
                        </p>

                        <p>
                            <strong>Para la opción "Una cara y una cruz":</strong> Puedes ganar de dos formas:
                            <br />- Primera moneda cara y segunda cruz: P(H,T) = 0.5 × 0.5 = 0.25
                            <br />- Primera moneda cruz y segunda cara: P(T,H) = 0.5 × 0.5 = 0.25
                            <br />P(mixto) = P(H,T) + P(T,H) = 0.25 + 0.25 = 0.5 (50%)
                        </p>

                        <p>
                            <strong>Conclusión:</strong> La opción "Una cara y una cruz" te da el doble de probabilidades
                            de ganar (50%) en comparación con elegir "Dos caras" o "Dos cruces" (25% cada una).
                        </p>

                        <p>
                            <strong>Importante:</strong> Aunque una estrategia tenga mayor probabilidad de éxito,
                            no garantiza la victoria en un solo intento. Sin embargo, a largo plazo, ganarás más veces
                            eligiendo la opción con mayor probabilidad.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoinFlipProbability;
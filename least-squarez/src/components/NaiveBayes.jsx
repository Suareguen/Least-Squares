import { useState, useMemo } from "react";

/**
 * BayesPlayground – Visualización interactiva del Teorema de Bayes
 * Una herramienta educativa para entender probabilidades condicionales
 */
const BayesPlayground = () => {
    // Estados principales
    const [prior, setPrior] = useState(0.3);          // P(A) - probabilidad a priori
    const [likelihood, setLikelihood] = useState(0.8); // P(B|A) - probabilidad de B dado A
    const [falsePos, setFalsePos] = useState(0.1);     // P(B|¬A) - falsos positivos

    // Estado para mostrar/ocultar diferentes elementos
    const [showFormula, setShowFormula] = useState(true);
    const [showPopulationView, setShowPopulationView] = useState(false);
    const [showExplanation, setShowExplanation] = useState(true);

    // Estado para tipo de ejemplo
    const [exampleType, setExampleType] = useState("medical");

    // Ejemplos predefinidos con enunciados descriptivos
    const examples = {
        medical: {
            title: "Test médico",
            prior: 0.01,
            likelihood: 0.95,
            falsePos: 0.05,
            description: {
                prior: "Prevalencia de la enfermedad",
                likelihood: "Sensibilidad del test (detecta enfermedad cuando existe)",
                falsePos: "Tasa de falsos positivos (positivo sin enfermedad)",
                posterior: "Probabilidad de tener la enfermedad si el test es positivo"
            },
            statement: "Un test médico para una enfermedad rara tiene una sensibilidad del 95% (detecta la enfermedad cuando existe) y una especificidad del 95% (no da falsos positivos). La prevalencia de la enfermedad en la población es del 1%. Si una persona da positivo en el test, ¿cuál es la probabilidad real de que tenga la enfermedad?"
        },
        spam: {
            title: "Filtro de spam",
            prior: 0.3,
            likelihood: 0.9,
            falsePos: 0.02,
            description: {
                prior: "Proporción de emails que son spam",
                likelihood: "Probabilidad que el filtro detecte un spam",
                falsePos: "Probabilidad que un email normal sea marcado como spam",
                posterior: "Probabilidad que un email sea spam si el filtro lo marca"
            },
            statement: "Un sistema de filtrado de correo electrónico tiene una efectividad del 90% para detectar mensajes spam. Sin embargo, también marca erróneamente el 2% de los correos legítimos como spam. Si el 30% de todos los correos recibidos son spam, ¿cuál es la probabilidad de que un correo marcado como spam realmente sea spam?"
        },
        legal: {
            title: "Caso legal",
            prior: 0.5,
            likelihood: 0.85,
            falsePos: 0.15,
            description: {
                prior: "Probabilidad inicial de culpabilidad",
                likelihood: "Probabilidad de evidencia si es culpable",
                falsePos: "Probabilidad de evidencia si es inocente",
                posterior: "Probabilidad de culpabilidad dada la evidencia"
            },
            statement: "En un juicio, existe una probabilidad inicial del 50% de que el acusado sea culpable. Se presenta una evidencia que tiene un 85% de probabilidad de aparecer si el acusado es culpable, pero también un 15% de probabilidad de aparecer si es inocente. Con esta nueva evidencia, ¿cuál es la probabilidad actualizada de que el acusado sea culpable?"
        }
    };

    // Cálculo de la probabilidad posterior P(A|B)
    const posterior = useMemo(() => {
        const numerator = likelihood * prior;
        const denominator = numerator + falsePos * (1 - prior);
        return denominator === 0 ? 0 : numerator / denominator;
    }, [prior, likelihood, falsePos]);

    // P(B) - probabilidad marginal o total de B
    const marginalB = useMemo(() => {
        return likelihood * prior + falsePos * (1 - prior);
    }, [prior, likelihood, falsePos]);

    // Cálculo para la visualización de conjuntos
    const setVisuals = useMemo(() => {
        // Total población representada como 100
        const totalPopulation = 100;

        // Tamaño de los conjuntos
        const sizeA = prior * totalPopulation;
        const sizeNotA = totalPopulation - sizeA;

        // Dentro de A, cuántos tienen B
        const sizeAandB = sizeA * likelihood;

        // Dentro de no A, cuántos tienen B
        const sizeNotAandB = sizeNotA * falsePos;

        // Tamaño total de B
        const sizeB = sizeAandB + sizeNotAandB;

        return {
            totalPopulation,
            sizeA,
            sizeNotA,
            sizeAandB,
            sizeNotAandB,
            sizeB
        };
    }, [prior, likelihood, falsePos]);

    // Cargar un ejemplo predefinido
    const loadExample = (type) => {
        const example = examples[type];
        setPrior(example.prior);
        setLikelihood(example.likelihood);
        setFalsePos(example.falsePos);
        setExampleType(type);
    };

    // Formatear valores a porcentaje
    const fmt = (v) => `${(v * 100).toFixed(1)}%`;

    // Parámetros para el donut SVG
    const R = 45;                       // radio
    const C = 2 * Math.PI * R;          // circunferencia
    const offset = C * (1 - posterior); // longitud restante (1 - p)

    // Descripción actual basada en el ejemplo seleccionado
    const currentDescription = examples[exampleType].description;
    const currentStatement = examples[exampleType].statement;

    // Componente para controles numéricos
    const Control = ({ label, value, set, description }) => (
        <div className="mb-4 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-gray-700">
                    {label}
                </label>
                <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">{fmt(value)}</span>
            </div>
            <p className="text-xs text-gray-600 mb-2 italic">{description}</p>
            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onChange={(e) => set(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onChange={(e) => set(parseFloat(e.target.value))}
                    className="w-20 p-1 border border-gray-300 rounded text-right text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Teorema de Bayes: Visualización Interactiva</h2>

            {/* Selector de ejemplos */}
            <div className="w-full max-w-3xl mb-4 bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Ejemplos prácticos</h3>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(examples).map(type => (
                        <button
                            key={type}
                            onClick={() => loadExample(type)}
                            className={`px-4 py-2 rounded-md transition-all duration-200 ${exampleType === type
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow'
                                }`}
                        >
                            {examples[type].title}
                        </button>
                    ))}
                </div>

                {/* Mostrar el enunciado del ejemplo seleccionado */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">{currentStatement}</p>
                    <p className="text-sm font-semibold text-blue-800 mt-2">
                        Respuesta: {fmt(posterior)}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel de controles */}
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Ajusta las probabilidades</h3>

                    <Control
                        label="P(A)"
                        value={prior}
                        set={setPrior}
                        description={currentDescription.prior}
                    />

                    <Control
                        label="P(B|A)"
                        value={likelihood}
                        set={setLikelihood}
                        description={currentDescription.likelihood}
                    />

                    <Control
                        label="P(B|¬A)"
                        value={falsePos}
                        set={setFalsePos}
                        description={currentDescription.falsePos}
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowFormula(!showFormula)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                            {showFormula ? "Ocultar fórmula" : "Mostrar fórmula"}
                        </button>

                        <button
                            onClick={() => setShowPopulationView(!showPopulationView)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                            {showPopulationView ? "Ver gráfico donut" : "Ver diagrama de población"}
                        </button>

                        <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                            {showExplanation ? "Ocultar explicación" : "Mostrar explicación"}
                        </button>
                    </div>
                </div>

                {/* Resultado y visualización */}
                <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">
                        P(A|B) - {currentDescription.posterior}
                    </h3>

                    {!showPopulationView ? (
                        // Visualización con donut
                        <div className="relative mb-4">
                            <svg width="140" height="140" className="-rotate-90">
                                {/* círculo base */}
                                <circle
                                    cx="70" cy="70" r={R}
                                    strokeWidth="16"
                                    className="stroke-gray-200 fill-none"
                                />
                                {/* arco de la probabilidad */}
                                <circle
                                    cx="70" cy="70" r={R}
                                    strokeWidth="16"
                                    className="stroke-blue-600 fill-none transition-[stroke-dashoffset] duration-500"
                                    strokeDasharray={C}
                                    strokeDashoffset={offset}
                                />
                            </svg>
                            {/* valor numérico en el centro */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold rotate-0">{fmt(posterior)}</span>
                            </div>
                        </div>
                    ) : (
                        // Visualización mejorada con rectángulos para representar población
                        <div className="w-full h-64 mb-8 relative bg-white rounded-lg shadow-inner overflow-hidden border border-gray-300">
                            {/* Título y leyenda */}
                            <div className="absolute top-2 left-0 right-0 flex justify-center gap-6 px-2 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-indigo-200 border border-indigo-300"></div>
                                    <span className="text-xs font-medium">Evento A</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-rose-200 border border-rose-300"></div>
                                    <span className="text-xs font-medium">Evento no-A</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-amber-400 border border-amber-500"></div>
                                    <span className="text-xs font-medium">Evento B</span>
                                </div>
                            </div>

                            {/* Contenedor principal */}
                            <div className="absolute top-10 bottom-8 left-4 right-4 flex rounded-lg overflow-hidden shadow-sm">
                                {/* Área A */}
                                <div
                                    className="h-full bg-indigo-200 border-r border-indigo-400 flex items-center justify-center relative"
                                    style={{ width: `${prior * 100}%` }}
                                >
                                    <span className={`text-indigo-800 font-semibold px-1 py-0.5 rounded ${prior < 0.15 ? 'text-xs' : 'text-sm'}`}>
                                        A: {fmt(prior)}
                                    </span>

                                    {/* B dentro de A - rectángulo ámbar */}
                                    <div
                                        className="absolute bottom-0 left-0 bg-amber-400 border-t border-amber-500 flex items-start justify-center"
                                        style={{
                                            width: '100%',
                                            height: `${likelihood * 100}%`,
                                        }}
                                    >
                                        <span className={`text-amber-800 font-medium mt-1 ${likelihood < 0.15 ? 'text-xs' : 'text-sm'}`}>
                                            {fmt(likelihood)}
                                        </span>
                                    </div>
                                </div>

                                {/* Área ¬A */}
                                <div
                                    className="h-full bg-rose-200 flex items-center justify-center relative"
                                    style={{ width: `${(1 - prior) * 100}%` }}
                                >
                                    <span className={`text-rose-800 font-semibold px-1 py-0.5 rounded ${(1 - prior) < 0.15 ? 'text-xs' : 'text-sm'}`}>
                                        ¬A: {fmt(1 - prior)}
                                    </span>

                                    {/* B dentro de ¬A - rectángulo ámbar */}
                                    <div
                                        className="absolute bottom-0 left-0 bg-amber-400 border-t border-amber-500 flex items-start justify-center"
                                        style={{
                                            width: '100%',
                                            height: `${falsePos * 100}%`
                                        }}
                                    >
                                        <span className={`text-amber-800 font-medium mt-1 ${falsePos < 0.15 ? 'text-xs' : 'text-sm'}`}>
                                            {fmt(falsePos)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Línea de eventos B con etiqueta */}
                            <div className="absolute left-0 right-0 bottom-8 flex justify-center">
                                <div className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-t-md font-medium">
                                    Evento B: {fmt(marginalB)}
                                </div>
                            </div>

                            {/* Etiquetas de intersección */}
                            <div className="absolute left-4 bottom-1 text-xs font-medium">
                                A∩B: {fmt(prior * likelihood)}
                            </div>

                            <div className="absolute right-4 bottom-1 text-xs font-medium">
                                ¬A∩B: {fmt((1 - prior) * falsePos)}
                            </div>

                            {/* Ecuación de Bayes específica para este caso */}
                            <div className="absolute top-full left-0 right-0 text-center text-sm font-medium mt-2 bg-blue-50 rounded-md p-2 shadow-sm">
                                <span className="font-semibold">P(A|B) =</span>
                                <span className="mx-1 border-b border-blue-800 inline-block text-blue-800">
                                    P(A∩B)
                                </span>
                                <span className="mx-1">/</span>
                                <span className="mx-1 text-amber-700">
                                    P(B)
                                </span>
                                <span className="mx-1">=</span>
                                <span className="mx-1 border-b border-blue-800 inline-block text-blue-800">
                                    {fmt(prior * likelihood)}
                                </span>
                                <span className="mx-1">/</span>
                                <span className="mx-1 text-amber-700">
                                    {fmt(marginalB)}
                                </span>
                                <span className="mx-1">=</span>
                                <span className="text-lg font-bold text-blue-600">{fmt(posterior)}</span>
                            </div>
                        </div>
                    )}

                    {/* Fórmula de Bayes */}
                    {showFormula && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg w-full text-center">
                            <p className="text-lg font-serif">
                                P(A|B) =
                                <span className="mx-1 border-b border-black inline-block">
                                    P(B|A) × P(A)
                                </span>
                                /
                                <span className="mx-1">
                                    P(B)
                                </span>
                            </p>
                            <p className="text-lg font-serif mt-2">
                                P(A|B) =
                                <span className="mx-1 border-b border-black inline-block">
                                    P(B|A) × P(A)
                                </span>
                                /
                                <span className="mx-1">
                                    [P(B|A) × P(A) + P(B|¬A) × P(¬A)]
                                </span>
                            </p>
                            <p className="text-lg font-serif mt-2">
                                =
                                <span className="mx-1 border-b border-black inline-block">
                                    {fmt(likelihood)} × {fmt(prior)}
                                </span>
                                /
                                <span className="mx-1">
                                    [{fmt(likelihood)} × {fmt(prior)} + {fmt(falsePos)} × {fmt(1 - prior)}]
                                </span>
                                = {fmt(posterior)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Explicación del Teorema de Bayes */}
            {showExplanation && (
                <div className="w-full max-w-3xl mt-6 bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">¿Qué es el Teorema de Bayes?</h3>

                    <div className="text-sm space-y-3">
                        <p>
                            <strong>Teorema de Bayes:</strong> Nos permite actualizar nuestras creencias (probabilidades)
                            cuando obtenemos nueva evidencia. Calcula la probabilidad de que una hipótesis sea cierta
                            dado que hemos observado cierta evidencia.
                        </p>

                        <p>
                            <strong>Interpretación en este ejemplo:</strong> Si sabemos que el evento B ha ocurrido,
                            ¿cuál es la probabilidad de que el evento A también sea cierto?
                        </p>

                        <p>
                            <strong>Componentes:</strong>
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>P(A)</strong> - Probabilidad a priori: Lo que creíamos antes de tener evidencia.</li>
                            <li><strong>P(B|A)</strong> - Probabilidad de ver la evidencia B si A es verdad.</li>
                            <li><strong>P(B|¬A)</strong> - Probabilidad de ver la evidencia B si A es falso.</li>
                            <li><strong>P(A|B)</strong> - Probabilidad a posteriori: Nuestra creencia actualizada.</li>
                        </ul>

                        <p>
                            <strong>Aplicaciones:</strong> El teorema de Bayes es fundamental en estadística,
                            inteligencia artificial, medicina (diagnósticos), filtros de spam, sistemas judiciales,
                            y cualquier área donde se toman decisiones bajo incertidumbre.
                        </p>

                        <p>
                            <strong>La falacia de la fiscalía:</strong> Es común confundir P(A|B) con P(B|A).
                            Por ejemplo, la probabilidad de que una persona tenga una enfermedad dado que dio positivo
                            en una prueba [P(A|B)] es muy diferente de la probabilidad de que dé positivo dado que
                            tiene la enfermedad [P(B|A)].
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BayesPlayground;
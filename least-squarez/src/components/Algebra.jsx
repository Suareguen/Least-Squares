

import React, { useState, useMemo } from "react";

/* ========= Helper parsing functions ========= */
const parseVector = (str) =>
    str.trim() === ""
        ? []
        : str
            .split(",")
            .map((n) => Number(n.trim()))
            .filter((n) => !Number.isNaN(n));

const parseMatrix = (str) =>
    str.trim() === ""
        ? []
        : str.split(";").map((row) =>
            row
                .split(",")
                .map((n) => Number(n.trim()))
                .filter((n) => !Number.isNaN(n))
        );

/* ========= Preview components ========= */
const VectorPreview = ({ vec }) =>
  vec.length === 0 ? null : (
    <div className="flex justify-center mt-2">
      <span className="text-xl mr-1">[</span>
      <div className="flex space-x-2">
        {vec.map((v, i) => (
          <div
            key={i}
            className="w-8 h-8 flex items-center justify-center border-2 border-green-500 rounded text-xs"
          >
            {v}
          </div>
        ))}
      </div>
      <span className="text-xl ml-1">]</span>
    </div>
  );

const MatrixPreview = ({ mat }) =>
  mat.length === 0 ? null : (
    <div className="flex justify-center mt-2">
      <table className="border-collapse">
        <tbody>
          {mat.map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td
                  key={j}
                  className="border border-purple-500 p-1 text-xs text-center"
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

/* ========= Algebraic operations ========= */
const addVectors = (a, b) =>
    a.length === b.length ? a.map((v, i) => v + b[i]) : null;

const dotProduct = (a, b) =>
    a.length === b.length
        ? a.reduce((s, v, i) => s + v * b[i], 0)
        : null;

const addMatrices = (A, B) =>
    A.length === B.length && A[0].length === B[0].length
        ? A.map((row, i) => row.map((v, j) => v + B[i][j]))
        : null;

const multiplyMatrices = (A, B) => {
    if (A[0].length !== B.length) return null;
    const C = Array.from({ length: A.length }, () =>
        Array(B[0].length).fill(0)
    );
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < A[0].length; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return C;
};

/* ========= UI component ========= */
const Algebra = () => {
    /* ----- Scalar state ----- */
    const [scalarA, setScalarA] = useState("");
    const [scalarB, setScalarB] = useState("");
    const [scalarOp, setScalarOp] = useState("+");
    const scalarResult = useMemo(() => {
        const a = Number(scalarA);
        const b = Number(scalarB);
        if (Number.isNaN(a) || Number.isNaN(b)) return "—";
        switch (scalarOp) {
            case "+":
                return a + b;
            case "-":
                return a - b;
            case "×":
                return a * b;
            case "÷":
                return b !== 0 ? a / b : "∞";
            default:
                return "—";
        }
    }, [scalarA, scalarB, scalarOp]);

    /* ----- Vector state ----- */
    const [vecA, setVecA] = useState("");
    const [vecB, setVecB] = useState("");
    const [vecOp, setVecOp] = useState("add");
    const vectorResult = useMemo(() => {
        const a = parseVector(vecA);
        const b = parseVector(vecB);
        if (a.length === 0 || b.length === 0) return "—";
        return vecOp === "add"
            ? addVectors(a, b) ?? "Longitudes distintas"
            : dotProduct(a, b) ?? "Longitudes distintas";
    }, [vecA, vecB, vecOp]);

    /* ----- Matrix state ----- */
    const [matA, setMatA] = useState("");
    const [matB, setMatB] = useState("");
    const [matOp, setMatOp] = useState("add");
    const matrixResult = useMemo(() => {
        const A = parseMatrix(matA);
        const B = parseMatrix(matB);
        if (A.length === 0 || B.length === 0) return "—";
        if (matOp === "add") {
            return addMatrices(A, B) ?? "Dimensiones distintas";
        }
        return multiplyMatrices(A, B) ?? "Dimensiones incompatibles";
    }, [matA, matB, matOp]);

    // Previews for current inputs
    const parsedVecA = useMemo(() => parseVector(vecA), [vecA]);
    const parsedVecB = useMemo(() => parseVector(vecB), [vecB]);
    const parsedMatA = useMemo(() => parseMatrix(matA), [matA]);
    const parsedMatB = useMemo(() => parseMatrix(matB), [matB]);

    const fmtArray = (arr) =>
        Array.isArray(arr) ? JSON.stringify(arr) : arr;

    /* ========= RENDER ========= */
    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">
                Escalares, Vectores, Matrices y Tensores
            </h2>

            {/* ----- Theory blocks ----- */}
            <div className="w-full max-w-3xl space-y-6 mb-8">
                <section className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Escalar</h3>
                    <p className="text-sm text-gray-700">
                        Un escalar es un número (tensor de orden 0). Ej: 5, -3.2, π.
                    </p>
                    <div className="flex justify-center mt-3">
                      <div className="w-16 h-16 flex items-center justify-center border-2 border-blue-400 rounded-lg text-xl font-bold">
                        5
                      </div>
                    </div>
                </section>

                <section className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Vector</h3>
                    <p className="text-sm text-gray-700">
                        Un vector es una lista ordenada de números (tensor de orden 1),
                        representada como <code>[x₁, x₂, …, xₙ]</code>.
                    </p>
                    <div className="flex justify-center mt-3">
                      <span className="text-2xl mr-1">[</span>
                      <div className="flex space-x-2">
                        <div className="w-10 h-10 flex items-center justify-center border-2 border-green-500 rounded">2</div>
                        <div className="w-10 h-10 flex items-center justify-center border-2 border-green-500 rounded">4</div>
                        <div className="w-10 h-10 flex items-center justify-center border-2 border-green-500 rounded">-1</div>
                      </div>
                      <span className="text-2xl ml-1">]</span>
                    </div>
                </section>

                <section className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Matriz</h3>
                    <p className="text-sm text-gray-700">
                        Una matriz es una tabla bidimensional de números (tensor de orden
                        2).
                    </p>
                    <div className="flex justify-center mt-3">
                      <table className="border-collapse">
                        <tbody>
                          <tr>
                            <td className="border border-purple-500 p-2">1</td>
                            <td className="border border-purple-500 p-2">2</td>
                          </tr>
                          <tr>
                            <td className="border border-purple-500 p-2">3</td>
                            <td className="border border-purple-500 p-2">4</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                </section>

                <section className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Tensor</h3>
                    <p className="text-sm text-gray-700">
                        Un tensor generaliza escalar, vector y matriz a cualquier número de
                        dimensiones.
                    </p>
                    <div className="flex justify-center mt-3 space-x-4">
                      {/* Dos “rebanadas” de un tensor 3 D 2×2×2 */}
                      <table className="border-collapse">
                        <tbody>
                          <tr>
                            <td className="border border-orange-500 p-1 text-xs">1</td>
                            <td className="border border-orange-500 p-1 text-xs">0</td>
                          </tr>
                          <tr>
                            <td className="border border-orange-500 p-1 text-xs">0</td>
                            <td className="border border-orange-500 p-1 text-xs">1</td>
                          </tr>
                        </tbody>
                      </table>
                      <table className="border-collapse">
                        <tbody>
                          <tr>
                            <td className="border border-orange-500 p-1 text-xs">2</td>
                            <td className="border border-orange-500 p-1 text-xs">3</td>
                          </tr>
                          <tr>
                            <td className="border border-orange-500 p-1 text-xs">4</td>
                            <td className="border border-orange-500 p-1 text-xs">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Dos matrices ⇒ tensor 3 D 2×2×2</p>
                </section>
            </div>

            {/* ----- Interactive playground ----- */}
            <div className="w-full max-w-3xl space-y-8">
                {/* Scalars */}
                <section className="bg-white p-4 rounded-lg shadow space-y-3">
                    <h3 className="text-lg font-semibold">Calculadora de escalares</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="number"
                            className="w-24 p-1 border rounded"
                            value={scalarA}
                            onChange={(e) => setScalarA(e.target.value)}
                            placeholder="a"
                        />
                        <select
                            className="p-1 border rounded"
                            value={scalarOp}
                            onChange={(e) => setScalarOp(e.target.value)}
                        >
                            <option value="+">+</option>
                            <option value="-">−</option>
                            <option value="×">×</option>
                            <option value="÷">÷</option>
                        </select>
                        <input
                            type="number"
                            className="w-24 p-1 border rounded"
                            value={scalarB}
                            onChange={(e) => setScalarB(e.target.value)}
                            placeholder="b"
                        />
                        <span className="text-xl font-bold">= {scalarResult}</span>
                    </div>
                </section>

                {/* Vectors */}
                <section className="bg-white p-4 rounded-lg shadow space-y-3">
                    <h3 className="text-lg font-semibold">Operaciones con vectores</h3>
                    <p className="text-xs text-gray-500">
                        Introduce componentes separadas por comas. Ej: 1,2,3
                    </p>
                    <div className="flex flex-col gap-2">
                        <input
                            className="p-1 border rounded"
                            value={vecA}
                            onChange={(e) => setVecA(e.target.value)}
                            placeholder="Vector A"
                        />
                        <VectorPreview vec={parsedVecA} />
                        <input
                            className="p-1 border rounded"
                            value={vecB}
                            onChange={(e) => setVecB(e.target.value)}
                            placeholder="Vector B"
                        />
                        <VectorPreview vec={parsedVecB} />
                        <div className="flex items-center gap-2">
                            <select
                                className="p-1 border rounded"
                                value={vecOp}
                                onChange={(e) => setVecOp(e.target.value)}
                            >
                                <option value="add">Suma</option>
                                <option value="dot">Producto punto</option>
                            </select>
                            <span className="font-medium">
                                Resultado: {fmtArray(vectorResult)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Matrices */}
                <section className="bg-white p-4 rounded-lg shadow space-y-3">
                    <h3 className="text-lg font-semibold">Operaciones con matrices</h3>
                    <p className="text-xs text-gray-500">
                        Escribe filas separadas por punto y coma y columnas por comas. Ej:
                        1,2;3,4
                    </p>
                    <div className="flex flex-col gap-2">
                        <input
                            className="p-1 border rounded"
                            value={matA}
                            onChange={(e) => setMatA(e.target.value)}
                            placeholder="Matriz A"
                        />
                        <MatrixPreview mat={parsedMatA} />
                        <input
                            className="p-1 border rounded"
                            value={matB}
                            onChange={(e) => setMatB(e.target.value)}
                            placeholder="Matriz B"
                        />
                        <MatrixPreview mat={parsedMatB} />
                        <div className="flex items-center gap-2">
                            <select
                                className="p-1 border rounded"
                                value={matOp}
                                onChange={(e) => setMatOp(e.target.value)}
                            >
                                <option value="add">Suma</option>
                                <option value="mul">Multiplicación</option>
                            </select>
                            <span className="font-medium">
                                Resultado: {fmtArray(matrixResult)}
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Algebra;
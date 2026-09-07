// ------------------------------------------------------------
// PASO 3 - TRANSFORMACIONES MATRICIALES 2D
// ------------------------------------------------------------

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL2 no está disponible en este navegador.");
}

// ------------------------------------------------------------
// 1. Preparar el área de renderizado
// ------------------------------------------------------------

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// ------------------------------------------------------------
// 2. Geometría original del triángulo
//    IMPORTANTE: estos vértices ya no se modificarán para mover,
//    rotar o escalar el objeto.
// ------------------------------------------------------------

const vertices = new Float32Array([
    0.0, 0.35,
    -0.35, -0.35,
    0.35, -0.35
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// ------------------------------------------------------------
// 3. Vertex Shader
//    Recibe una matriz 3x3 llamada uModelMatrix.
// ------------------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 uModelMatrix;

void main() {
    vec3 posicionLocal = vec3(aPosition, 1.0);
    vec3 posicionTransformada = uModelMatrix * posicionLocal;

    gl_Position = vec4(
        posicionTransformada.xy,
        0.0,
        1.0
    );
}
`;

// ------------------------------------------------------------
// 4. Fragment Shader
// ------------------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision highp float;

out vec4 outColor;

void main() {
    outColor = vec4(1.0, 0.75, 0.1, 1.0);
}
`;

// ------------------------------------------------------------
// 5. Compilar shaders
// ------------------------------------------------------------

function crearShader(gl, tipo, codigoFuente) {
    const shader = gl.createShader(tipo);

    gl.shaderSource(shader, codigoFuente);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("Error al compilar shader:\n" + error);
    }

    return shader;
}

const vertexShader = crearShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = crearShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);

// ------------------------------------------------------------
// 6. Crear programa WebGL
// ------------------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
        "Error al enlazar programa:\n" + gl.getProgramInfoLog(program)
    );
}

// ------------------------------------------------------------
// 7. Configurar atributo aPosition mediante VAO
// ------------------------------------------------------------

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

const positionLocation = gl.getAttribLocation(program, "aPosition");

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

// ------------------------------------------------------------
// 8. Funciones matemáticas: matrices 3x3
//    WebGL utiliza los datos en orden de columnas.
// ------------------------------------------------------------

function matrizIdentidad() {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
}

function matrizTraslacion(tx, ty) {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        tx, ty, 1
    ]);
}

function matrizRotacion(anguloRadianes) {
    const c = Math.cos(anguloRadianes);
    const s = Math.sin(anguloRadianes);

    return new Float32Array([
        c, s, 0,
        -s, c, 0,
        0, 0, 1
    ]);
}

function matrizEscala(sx, sy) {
    return new Float32Array([
        sx, 0, 0,
        0, sy, 0,
        0, 0, 1
    ]);
}

function multiplicarMat3(a, b) {
    const resultado = new Float32Array(9);

    for (let columna = 0; columna < 3; columna++) {
        for (let fila = 0; fila < 3; fila++) {

            let suma = 0;

            for (let k = 0; k < 3; k++) {
                suma +=
                    a[k * 3 + fila] *
                    b[columna * 3 + k];
            }

            resultado[columna * 3 + fila] = suma;
        }
    }

    return resultado;
}

// ------------------------------------------------------------
// 9. Parámetros de transformación
//    Cambie estos valores y observe el resultado.
// ------------------------------------------------------------

const tx = 0.30;
const ty = 0.10;

const anguloGrados = 35;
const anguloRadianes = anguloGrados * Math.PI / 180;

const sx = 1.20;
const sy = 0.80;

// ------------------------------------------------------------
// 10. Construir la matriz de modelo
//
//     M = T * R * S
//
//     El objeto:
//     1. se escala,
//     2. luego rota,
//     3. finalmente se traslada.
// ------------------------------------------------------------

const T = matrizTraslacion(tx, ty);
const R = matrizRotacion(anguloRadianes);
const S = matrizEscala(sx, sy);

const RS = multiplicarMat3(R, S);
const modelMatrix = multiplicarMat3(T, RS);

// ------------------------------------------------------------
// 11. Enviar la matriz al Vertex Shader
// ------------------------------------------------------------

gl.useProgram(program);

const modelMatrixLocation =
    gl.getUniformLocation(program, "uModelMatrix");

gl.uniformMatrix3fv(
    modelMatrixLocation,
    false,
    modelMatrix
);

// ------------------------------------------------------------
// 12. Renderizar
// ------------------------------------------------------------

gl.clear(gl.COLOR_BUFFER_BIT);

gl.bindVertexArray(vao);

gl.drawArrays(
    gl.TRIANGLES,
    0,
    3
);

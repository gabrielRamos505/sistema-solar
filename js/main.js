// ------------------------------------------------------------
// PASO 2 - PRIMER TRIÁNGULO CON WEBGL2
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
gl.clear(gl.COLOR_BUFFER_BIT);

// ------------------------------------------------------------
// 2. Definir los tres vértices del triángulo
//    Coordenadas NDC: valores entre -1 y 1
// ------------------------------------------------------------

const vertices = new Float32Array([
    0.0, 0.7,   // vértice superior
    -0.7, -0.7,   // vértice inferior izquierdo
    0.7, -0.7    // vértice inferior derecho
]);

// ------------------------------------------------------------
// 3. Crear y llenar el buffer de vértices
// ------------------------------------------------------------

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// ------------------------------------------------------------
// 4. Código del Vertex Shader
// ------------------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// ------------------------------------------------------------
// 5. Código del Fragment Shader
// ------------------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision highp float;

out vec4 outColor;

void main() {
    outColor = vec4(1.0, 0.75, 0.1, 1.0);
}
`;

// ------------------------------------------------------------
// 6. Función para compilar un shader
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
// 7. Crear y enlazar el programa WebGL
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
// 8. Configurar el atributo aPosition mediante un VAO
// ------------------------------------------------------------

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

const positionLocation = gl.getAttribLocation(program, "aPosition");

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation, // ubicación del atributo
    2,                // dos componentes: x, y
    gl.FLOAT,         // tipo de dato
    false,            // sin normalización
    0,                // stride
    0                 // offset
);

// ------------------------------------------------------------
// 9. Dibujar
// ------------------------------------------------------------

gl.useProgram(program);
gl.bindVertexArray(vao);

gl.drawArrays(
    gl.TRIANGLES,
    0,
    3
);

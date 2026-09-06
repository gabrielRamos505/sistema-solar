const canvas = document.getElementById("glCanvas");

const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL2 no está disponible en este navegador.");
}

gl.viewport(0, 0, canvas.width, canvas.height);

gl.clearColor(0.0, 0.2, 0.5, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

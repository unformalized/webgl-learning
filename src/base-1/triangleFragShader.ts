import { initWebGL } from "../util";
import vertexShader from "./triangle.vert";

const fragShader = /*glsl*/ `
precision mediump float;
// uniform 变量用于传递片元着色器变量
uniform float u_Width;
uniform float u_Height;

void main(){
  gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
}
`;

// 现在我们开始同时绘制多个点，WebGL 提供缓冲区对象，它可以一次性传入多个顶点数据
// 缓冲区对象是 WebGL 系统里的一块内存区域，用于保存顶点数据，供顶点着色器使用

const initVertexBuffer = (gl: WebGLRenderingContext, program: WebGLProgram) => {
  const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  const n = 3;

  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.error("Failed to create vertex buffer object!");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // 向缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(program, "a_Position");

  // 将缓冲区中的对象分配给 a_position
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // 连接 a_Position 变量和分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  return n;
};

export const run = () => {
  const el = document.getElementById("webgl") as HTMLCanvasElement;
  const gl = el.getContext("webgl");
  if (!gl) return;

  const program = initWebGL(gl, vertexShader, fragShader);
  if (!program) return;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const n = initVertexBuffer(gl, program);

  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }

  const u_Width = gl.getUniformLocation(program, "u_Width");
  const u_Height = gl.getUniformLocation(program, "u_Height");

  if (!u_Width || !u_Height) {
    console.log("Failed to get the storage location of u_Width or u_Height from webGL program");
    return;
  }
  gl.uniform1f(u_Width, el.width);

  gl.drawArrays(gl.TRIANGLES, 0, n);
};

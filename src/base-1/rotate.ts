import { initWebGL } from "../util";

const vertexShader = /*glsl*/ `
// attribute 用于传递顶点着色器变量数据
attribute vec4 a_Position;
uniform float u_CosB, u_SinB;

void main(){
    gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
    gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
    gl_Position.z = a_Position.z;
    gl_Position.w = 1.0;
}
`;
const fragShader = /*glsl*/ `
// attribute 用于传递顶点着色器变量数据
precision mediump float;
// uniform 变量用于传递片元着色器变量
uniform vec4 u_FragColor;

void main(){
    gl_FragColor = u_FragColor;
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
  const angle = 78;
  const radian = (Math.PI * angle) / 180;
  const sinB = Math.sin(radian);
  const cosB = Math.cos(radian);

  const n = initVertexBuffer(gl, program);

  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }

  const u_FragColor = gl.getUniformLocation(program, "u_FragColor");
  const u_CosB = gl.getUniformLocation(program, "u_CosB");
  const u_SinB = gl.getUniformLocation(program, "u_SinB");

  if (!u_FragColor || !u_CosB || !u_SinB) {
    console.log(
      "Failed to get the storage location of u_FragColor or u_CosB or u_SinB from webGL program"
    );
    return;
  }

  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  gl.uniform1f(u_CosB, cosB);
  gl.uniform1f(u_SinB, sinB);

  // gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
  gl.drawArrays(gl.TRIANGLES, 0, n);
};

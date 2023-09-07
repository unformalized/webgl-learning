import { initWebGL } from "../util";

const vertexShader = /*glsl*/ `
// attribute 用于传递顶点着色器变量数据
attribute vec4 a_Position;
attribute float a_PointSize;
attribute vec4 a_Color;
varying vec4 v_Color;

void main(){
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
    v_Color = a_Color;
}
`;

const fragShader = /*glsl*/ `
precision mediump float;
// 接受顶点着色器变量的数据
varying vec4 v_Color;

void main(){
    gl_FragColor = v_Color;
}
`;

// 现在我们开始同时绘制多个点，WebGL 提供缓冲区对象，它可以一次性传入多个顶点数据
// 缓冲区对象是 WebGL 系统里的一块内存区域，用于保存顶点数据，供顶点着色器使用

const initVertexBuffer = (gl: WebGLRenderingContext, program: WebGLProgram) => {
  // 将点的坐标和大小放在同一个缓存中
  const verticesSizeColor = new Float32Array(
    // prettier-ignore
    [
      // 坐标（2）大小（1）颜色（3）
      0.0, 0.5, 10.0, 1.0, 0.0, 0.0, // 第一个点
      -0.5, -0.5, 20.0, 0.0, 1.0, 0.0, // 第二个点
      0.5, -0.5, 30.0, 0.0, 0.0, 1.0, // 第三个点
    ]
  );
  const perSize = verticesSizeColor.BYTES_PER_ELEMENT;
  const n = 3;

  const vertexBuffer = gl.createBuffer();
  const sizeBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  if (!vertexBuffer || !sizeBuffer || !colorBuffer) {
    console.error("Failed to create vertex or size or color buffer object!");
    return -1;
  }

  // bindBuffer -> bufferData -> vertexAttribPointer -> enableVertexAttribArray 顺序不能乱，不能并行执行
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 向缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizeColor, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(program, "a_Position");
  // 将缓冲区中的对象分配给 a_position
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, perSize * 6, 0);
  // 连接 a_Position 变量和分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  const a_PointSize = gl.getAttribLocation(program, "a_PointSize");
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizeColor, gl.STATIC_DRAW);
  // 从 verticesSize buffer 中获取数据，已 perSize * 3 为一组，大小为 1，从每组的 perSize * 2 之后（偏移）取数据
  gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, perSize * 6, perSize * 2);
  gl.enableVertexAttribArray(a_PointSize);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  const a_Color = gl.getAttribLocation(program, "a_Color");
  gl.bufferData(gl.ARRAY_BUFFER, verticesSizeColor, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, perSize * 6, perSize * 3);
  gl.enableVertexAttribArray(a_Color);

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

  gl.drawArrays(gl.TRIANGLES, 0, n);
};

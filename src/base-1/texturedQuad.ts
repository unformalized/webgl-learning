import { initWebGL } from "../util";
import image from "../asserts/wallhaven-5gr5m7.jpg";

const vertexShader = /*glsl*/ `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;

void main() {
  gl_Position = a_Position;
  v_TexCoord = a_TexCoord;
}
`;

const fragShader = /*glsl*/ `
precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

void main(){
  gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}
`;

const initVertexBuffer = (gl: WebGLRenderingContext, program: WebGLProgram) => {
  const verticesTexCoords = new Float32Array(
    // prettier-ignore
    [
      // 顶点坐标 2， 纹理坐标 2
      -0.5, 0.5, 0.0, 1.0,
      -0.5, -0.5, 0.0, 0.0,
      0.5, 0.5, 1.0, 1.0,
      0.5, -0.5, 1.0, 0.0,
    ]
  );
  const perSize = verticesTexCoords.BYTES_PER_ELEMENT;
  const n = 4;

  const vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.error("Failed to create vertex buffer object!");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  // 向缓冲区写入数据
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(program, "a_Position");
  // 将缓冲区中的对象分配给 a_position
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, perSize * 4, 0);
  // 连接 a_Position 变量和分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  const a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
  // 将缓冲区中的对象分配给 a_position
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, perSize * 4, perSize * 2);
  // 连接 a_Position 变量和分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
};

const loadTexture = (
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  u_Sampler: WebGLUniformLocation,
  image: HTMLImageElement
) => {
  // 向 target 绑定纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 开启 0 号纹理单元
  gl.activeTexture(gl.TEXTURE0);

  // 1. webgl 纹理需要缩小时，采用线性插值采样
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // 2. webgl 纹理需要放大时，采用线性插值采样
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // 3. WebGL如果纹理坐标超出了s坐标的最大/最小值，直接取边界值
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // 4. WebGL如果纹理坐标超出了t坐标的最大/最小值，直接取边界值
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // 对纹理图像进行 y 轴反转
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // 配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // 将 0 号纹理传给着色器
  gl.uniform1i(u_Sampler, 0);
};

const initTextures = (gl: WebGLRenderingContext, n: number, program: WebGLProgram, src: string) => {
  const texture = gl.createTexture();
  if (!texture) {
    console.log("createTexture error");
    return false;
  }
  const u_Sampler = gl.getUniformLocation(program, "u_Sampler");
  if (!u_Sampler) {
    console.log("getUniformLocation can't get the u_Sampler variable");
    return false;
  }
  const image = new Image();

  image.onload = () => {
    console.log("loaded image");
    loadTexture(gl, texture, u_Sampler, image);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  };

  image.src = src;

  return true;
};

export const run = () => {
  const el = document.getElementById("webgl") as HTMLCanvasElement;
  const gl = el.getContext("webgl");
  if (!gl) return;

  const program = initWebGL(gl, vertexShader, fragShader);
  if (!program) return;

  const n = initVertexBuffer(gl, program);
  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }

  const success = initTextures(gl, n, program, image);
  if (!success) {
    console.log("Failed to initialize texture");
    return;
  }

  // gl.drawArrays(gl.TRIANGLES, 0, n);
};

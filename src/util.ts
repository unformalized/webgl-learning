export const getWebGLContext = () => {
  const el = document.getElementById("webgl") as HTMLCanvasElement;
  if (el) {
    const ctx = el.getContext("webgl");
    return ctx;
  }
};

export function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  // 创建 shader
  let shader = gl.createShader(type);
  if (!shader) return;
  // 传入源代码
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  // 获取 shader 状态
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  // 编译失败
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  // 创建 program
  const program = gl.createProgram();
  if (!program) return;
  // 传入 shader 对象
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // 链接 program
  gl.linkProgram(program);
  // 查看状态
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexSource
 * @param {string} fragmentSource
 */
export function initWebGL(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
) {
  // 根据源代码创建顶点着色器
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  if (!vertexShader) return;
  // 根据源代码创建片元着色器
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!fragmentShader) return;
  // 创建 WebGLProgram 程序
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return;
  gl.useProgram(program);
  return program;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 */
export function createTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture();
  // 绑定纹理数据
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // 设置纹理参数
  // 1. webgl 纹理需要缩小时，采用线性插值采样
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // 2. webgl 纹理需要放大时，采用线性插值采样
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // 3. WebGL如果纹理坐标超出了s坐标的最大/最小值，直接取边界值
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // 4. WebGL如果纹理坐标超出了t坐标的最大/最小值，直接取边界值
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

// 坐标变换
// 推导公式：

/**
 * 坐标变换
 * @param {number} l
 * @param {number} r
 * 推导公式：
 *    T
 * L     R
 *    B
 * 横坐标 x,
 * L <= x <= R,
 * 0 <= x - L <= R - L,
 * 0 <= (x - L) / (R - L) <= 1,
 * -1 <= 2 * (x - L) / (R - L) - 1 <= 1,
 * -1 <= (2 * (x - L) - R + L) / (R - L) <= 1,
 */
export const convertCoord = (l: number, r: number) => {
  return function (coord: number) {
    return (2 * coord) / (r - l) - (r + l) / (r - l);
  };
};

/**
 * 坐标变换的矩阵
 * @param {number} l 左
 * @param {number} r 右
 * @param {number} t 上
 * @param {number} b 下
 * @param {number} n 前
 * @param {number} f 后
 */
export function createProjectionMat(
  l: number,
  r: number,
  t: number,
  b: number,
  n: number,
  f: number
) {
  // prettier-ignore
  return [
    2 / (r - l), 0, 0, 0,
    0, 2 / (t - b), 0, 0,
    0, 0, 2 / (f - n), 0,
    -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1,
  ];
}

/**
 * 平移
 * @param {number} tx
 * @param {number} ty
 */
export function createTranslateMat(tx: number, ty: number) {
  // prettier-ignore
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, 0, 1
  ]
}

/**
 * 旋转
 * @param {number} rotate 角度
 */
export function createRotateMat(rotate: number) {
  rotate = (rotate * Math.PI) / 180;
  const cos = Math.cos(rotate);
  const sin = Math.sin(rotate);
  // prettier-ignore
  return [
    cos, sin, 0, 0,
    -sin, cos, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
}

/**
 * 缩放
 * @param {number} sx
 * @param {number} sy
 */
export function createScaleMat(sx: number, sy: number) {
  // prettier-ignore
  return [
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]
}

/**
 * 色相旋转矩阵
 * https://www.w3.org/TR/2018/WD-filter-effects-1-20181218/#huerotateEquivalent
 * @param {number} rotate
 */
export function createHueRotateMatrix(rotate: number) {
  const cos = Math.cos((rotate * Math.PI) / 180);
  const sin = Math.sin((rotate * Math.PI) / 180);
  // prettier-ignore
  return [
    0.213 + cos * 0.787 - sin * 0.213, 0.213 - cos * 0.213 + sin * 0.143, 0.213 - cos * 0.213 - sin * 0.787, 0.0,
    0.715 - cos * 0.715 - sin * 0.715, 0.715 + cos * 0.285 + sin * 0.14, 0.715 - cos * 0.715 + sin * 0.715, 0.0,
    0.072 - cos * 0.072 + sin * 0.928, 0.072 - cos * 0.072 - sin * 0.283, 0.072 + cos * 0.928 + sin * 0.072, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ]
}

/**
 * 创建 FrameBuffer 帧缓冲区，并设置颜色关联对象到
 * @param {WebGLRenderingContext} gl
 * @param {number} number
 * @param {number} width
 * @param {number} height
 */
export function createFramebufferTexture(
  gl: WebGLRenderingContext,
  number: number,
  width: number,
  height: number
) {
  const frameBuffers = [];
  const textures = [];
  for (let i = 0; i < number; i++) {
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    // 这里 texture 就是颜色关联对象，它代替颜色缓冲区
    const texture = createTexture(gl);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    // 将 frameBuffer 和 texture 关联起来
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
    texture && textures.push(texture);
    frameBuffer && frameBuffers.push(frameBuffer);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return [frameBuffers, textures];
}

import { initWebGL } from "../util";
import vertexShader from "./point.vert";
import fragShader from "./point.frag";

const g_points: number[][] = [];
const g_colors: number[][] = [];
const handleClick = (
  ev: MouseEvent,
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  a_Position: number,
  u_FragColor: WebGLUniformLocation
) => {
  console.log("click");
  const x = ev.clientX;
  const y = ev.clientY;
  const rect = canvas.getBoundingClientRect();
  const a_x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  const a_y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  console.log(a_x, a_y);
  g_points.push([a_x, a_y]);
  if (a_x > 0.0 && a_y > 0.0) {
    g_colors.push([1.0, 0.0, 0.0, 1.0]);
  } else if (a_x < 0.0 && a_y < 0.0) {
    g_colors.push([0.0, 1.0, 0.0, 1.0]);
  } else {
    g_colors.push([0.0, 0.0, 1.0, 1.0]);
  }
  gl.clear(gl.COLOR_BUFFER_BIT);

  g_points.forEach(([x, y], idx) => {
    const color = g_colors[idx];
    gl.vertexAttrib3f(a_Position, x, y, 0.0);
    gl.uniform4fv(u_FragColor, new Float32Array(color));

    // 为什么每次都需要使用 drawArrays 绘制
    // 因为 webGL 系统中的绘制操作是在颜色缓冲区中进行绘制，每次绘制后会将颜色缓冲区中值清空
    gl.drawArrays(gl.POINTS, 0, 1);
  });
};

export const run = () => {
  const el = document.getElementById("webgl") as HTMLCanvasElement;
  const gl = el.getContext("webgl");
  if (!gl) return;

  const program = initWebGL(gl, vertexShader, fragShader);
  if (!program) return;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const a_Position = gl.getAttribLocation(program, "a_Position");
  const a_PointSize = gl.getAttribLocation(program, "a_PointSize");
  const u_FragColor = gl.getUniformLocation(program, "u_FragColor");

  if (a_Position < 0 || a_PointSize < 0 || !u_FragColor) {
    console.log(
      "Failed to get the storage location of a_Position, a_PointSize or u_FragColor from webGL program"
    );
    return;
  }

  el.onmousedown = (e) => handleClick(e, gl, el, a_Position, u_FragColor);

  // gl.vertexAttrib3fv(a_Position, new Float32Array([]))
  // gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
  gl.vertexAttrib1f(a_PointSize, 10.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};

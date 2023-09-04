precision mediump float;
// uniform 变量用于传递片元着色器变量
uniform vec4 u_FragColor;

void main(){
    gl_FragColor = u_FragColor;
}
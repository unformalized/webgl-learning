// attribute 用于传递顶点着色器变量数据
attribute vec4 a_Position;
uniform vec4 u_Transform;

void main(){
    gl_Position = a_Position + u_Transform;
}
precision mediump float;

uniform sampler2D u_imageTarget;
uniform sampler2D u_imageMask;
uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
  vec4 m = texture2D(u_imageMask, v_texCoord);
  vec4 c = texture2D(u_imageTarget, v_texCoord);
  gl_FragColor = vec4(c.rgb * m.r, m.a);
}
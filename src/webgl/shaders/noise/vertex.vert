
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main()
{
    vUv = uv;
    vNormal = normal;
    vec3 transformed = vec3( position );
    vec4 mvPosition = vec4( transformed, 1.0 );
    vViewPosition = - mvPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
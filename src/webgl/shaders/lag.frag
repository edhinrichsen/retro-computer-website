#define LAG 0.5
#define LAG_INVERSE 0.5

uniform sampler2D uDiffuse;
uniform sampler2D uLagTex;
varying vec2 vUv;

void main()
{
    vec4 Diffuse = texture2D(uDiffuse, vUv);
    vec4 LagTex = texture2D(uLagTex, vUv);

    gl_FragColor = (Diffuse * LAG_INVERSE) + (LagTex * LAG);            
}
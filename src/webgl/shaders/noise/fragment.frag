        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uRand;
        varying vec2 vUv;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            float r = rand(vUv*uTime);
            // color.rgb + uTint;
            // gl_FragColor = color;
            gl_FragColor = color + (vec4(r,r,r,0) * uRand);
        }
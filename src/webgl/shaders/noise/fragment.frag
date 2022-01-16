#define PI 3.1415926538

#define LINE_SIZE 150.0
#define LINE_STRENGTH 0.02

#define NOISE_STRENGTH 0.15

uniform sampler2D uDiffuse;
uniform sampler2D uLastFrame;
uniform float uTime;
uniform float uProgress;
varying vec2 vUv;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}


float squareWave(float x){
    return (
         (4.0/PI * sin(PI*LINE_SIZE*x))
        +(4.0/PI * 1.0/3.0 * sin(3.0*PI*LINE_SIZE*x))
        +(4.0/PI * 1.0/5.0 * sin(5.0*PI*LINE_SIZE*x))
    )*LINE_STRENGTH;
}

vec4 progress(){
     if (vUv.y < uProgress && vUv.y > uProgress - 0.2) {
        return vec4(0.1,0.1,0.1,0.5) * (uProgress - vUv.y) ;
    }
        else {return vec4(0,0,0,0);}
}

void main()
        {
            vec4 color = texture2D(uDiffuse, vUv) + texture2D(uLastFrame, vUv);
            float r = rand(vUv*uTime);
            // color.rgb + uTint;
            // gl_FragColor = color;

            
            vec4 p = progress();
            gl_FragColor = color  +  (vec4(r,r,r,0) * (p.a + NOISE_STRENGTH)) + squareWave(vUv.y);

            // gl_FragColor = texture2D(uDiffuse, vUv);

            // if (vUv.y > sin(uTime) && vUv.y < sin(uTime) + 0.1 ) {
            //     gl_FragColor += vec4(0.1,0.1,0.1,0);
            // }
            
        }
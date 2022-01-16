#define PI 3.1415926538

#define LINE_SIZE 150.0
#define LINE_STRENGTH 0.02

#define NOISE_STRENGTH 0.15

uniform sampler2D uDiffuse;
uniform sampler2D uLagTex;
varying vec2 vUv;


void main()
        {
            vec4 Diffuse = texture2D(uDiffuse, vUv);
            vec4 LagTex = texture2D(uLagTex, vUv);
        
            gl_FragColor = LagTex;

            // gl_FragColor = texture2D(uDiffuse, vUv);

            // if (vUv.y > sin(uTime) && vUv.y < sin(uTime) + 0.1 ) {
            //     gl_FragColor += vec4(0.1,0.1,0.1,0);
            // }
            
        }
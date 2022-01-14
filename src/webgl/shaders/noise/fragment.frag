#define PI 3.1415926538

#define LINE_SIZE 150.0
#define LINE_STRENGTH 0.02

#define NOISE_STRENGTH 0.15

uniform sampler2D uDiffuse;
uniform sampler2D uMatcap;
uniform float uTime;
uniform float uProgress;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;

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
            vec4 color = texture2D(uDiffuse, vUv);
            float r = rand(vUv*uTime);
            // color.rgb + uTint;
            // gl_FragColor = color;

            
            vec4 p = progress();
            


    vec3 normal = normalize( vNormal );
    vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

   vec4 matcapColor = texture2D( uMatcap, uv ) * 0.05;

    // gl_FragColor = matcapColor;

    gl_FragColor = matcapColor + color  +  (vec4(r,r,r,0) * (p.a + NOISE_STRENGTH)) + squareWave(vUv.y);
    // gl_FragColor = matcapColor;

    // gl_FragColor = vec4(normalize( vNormal ), 1);
            // if (vUv.y > sin(uTime) && vUv.y < sin(uTime) + 0.1 ) {
            //     gl_FragColor += vec4(0.1,0.1,0.1,0);
            // }
            
        }
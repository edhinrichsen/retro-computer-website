#extension GL_OES_standard_derivatives : enable
precision mediump float;
varying vec3 vNewPos;
varying vec3 vOldPos;

varying float vRandom;
        void main()
        {
            // gl.getExtension('OES_standard_derivatives');
            // d(vPos);
            float oldPos = length(dFdx(vOldPos)) * length(dFdy(vOldPos));
        
            float newPos = length(dFdx(vNewPos)) * length(dFdy(vNewPos));

            float col = (oldPos/newPos) * 1.0;
            
            // gl_FragColor = vec4(vRandom, 0.0, 1.0, 1.0);
            // texture2D()
            gl_FragColor = vec4(col, col,col, 1.0);
        }
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;

        uniform float uTime;

        uniform vec4 uWindDirMin; // = 3.14/4.0
        uniform vec4 uWindDirMax; // = 3.14/3.0

        uniform vec4 uWaveLenMin; //= 0.1
        uniform vec4 uWaveLenMax; // = 0.15

        uniform vec4 uAmplitudeMin; // = 0.05
        uniform vec4 uAmplitudeMax; // = 0.1

        uniform vec4 uSlopeMin; // = 0.05
        uniform vec4 uSlopeMax; // = 0.7

        uniform vec4 uSpeed;
        uniform vec4 uFlutterSpeed;

        attribute vec3 position;
        attribute float aRandom;

        varying float vRandom;
        varying vec3 vNewPos;
        varying vec3 vOldPos;

    

        vec3 wave(int i)
        {
            vec3 pos = vec3(position);


            float Flutter = (0.3*sin(uTime*uFlutterSpeed[i]))+(0.2*sin((uTime/0.4)*uFlutterSpeed[i]) + 0.5);

            float WindDir = (uWindDirMin[i] * (1.0-Flutter)) + (uWindDirMax[i] * Flutter);
            float WindX = cos(WindDir);
            float WindY = sin(WindDir);

            float WaveLen = (uWaveLenMax[i] * (1.0-Flutter)) +  (uWaveLenMin[i] * Flutter);

            
            float Amplitude = (uAmplitudeMin[i] * (1.0-Flutter)) + (uAmplitudeMax[i] * Flutter);


            float W = 2.0/WaveLen;
            float yMovement = (uTime*uSpeed[i]) + WindX*pos.x*W + WindY*pos.y*W;


            float Slope = (uSlopeMin[i] * (1.0-Flutter)) + (uSlopeMax[i] * Flutter);

            float Q = Slope/(W * Amplitude);

            float x = Q * Amplitude * WindX * cos(yMovement*2.0);
            float y = Q * Amplitude * WindY * cos(yMovement*2.0);

            float z = Amplitude * sin(yMovement*2.0);


            return vec3(x,y,z);
        }

        void main()
        {
            vec4 pos = vec4(position + wave(1)  + wave(0) + wave(2)+ wave(3)      ,1.0);
            // pos.z += sin(pos.x*10.0 - uTime)*0.1;
            // pos.z += sin(pos.y*5.0 - uTime)*0.1;
            // pos.z+= aRandom * sin(pos.y*5.0 - uTime) * 0.2;

            vRandom = aRandom;
            vOldPos = position;
            vNewPos = pos.xyz;

            // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vNewPos,1.0);
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vOldPos,1.0);

            
        }
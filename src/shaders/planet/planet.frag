precision highp float;
#pragma glslify: noise2d = require(glsl-noise/simplex/2d)
#define M_PI 3.1415926535

float normalnoise( in vec2 p)
{
    return (noise2d(p) + 1.) * 0.5;
}

float noise(vec2 p)
{
 	const int steps = 1;
    float scale = float(steps);
	float displace = 0.4;
	for (int i = 0; i < steps; i++) {
        displace = normalnoise(p * scale + displace);
        scale *= 0.5;
    }
	return normalnoise(p + displace);
}

float norm(in float i){
	return (i + 1.) * 0.5;
}

float fbm(vec2 p)
{
  float res = 0.0, fre = 1.0, amp = 1.0, div = 0.0;
  for( int i = 0; i < 4; ++i )
  {
    res += amp * noise( p * fre );
    div += amp;
    amp *= 0.5;
    fre *= 2.;
  }
  res /= div;
  return res;
}

//Light setup
vec3 light = vec3(5.0, 5.0, 5.0);

//Object setup
vec4 sph1 = vec4( 0.0, 0.0, 0.0, 1.0);
//Functions 

float iSphere(in vec3 ro, in vec3 rd, in vec4 sph)
{
	//sphere at origin has equation |xyz| = r
	//sp |xyz|^2 = r^2.
	//Since |xyz| = ro + t*rd (where t is the parameter to move along the ray),
	//we have ro^2 + 2*ro*rd*t + t^2 - r2. This is a quadratic equation, so:
	vec3 oc = ro - sph.xyz; //distance ray origin - sphere center
	
	float b = dot(oc, rd);
	float c = dot(oc, oc) - sph.w * sph.w; //sph.w is radius
	float h = b*b - c; //Commonly known as delta. The term a is 1 so is not included.
	
	float t;
	if(h < 0.0) 
		t = -1.0;
	else
		t = (-b - sqrt(h)); //Again a = 1.
	return t;
}

//Get sphere normal.
vec3 nSphere(in vec3 pos, in vec4 sph )
{
	return (pos - sph.xyz)/sph.w;
}

float intersect(in vec3 ro, in vec3 rd, out float resT)
{
	resT = 1000.0;
	float id = -1.0;
	float tsph = iSphere(ro, rd, sph1); //Intersect with a sphere.
	
	if(tsph > 0.0)
	{
		id = 1.0;
		resT = tsph;
	}
	return id;
}

mat4 translate(vec3 v) {
	return mat4(1.0, 0.0, 0.0, v.x,0.0, 1.0, 0.0, v.y,0.0, 0.0, 1.0, v.z,0.0, 0.0, 0.0, 1.0);
}

mat4 rotateX(float theta) {
	float cosTheta = cos(theta);
	float sinTheta = sin(theta);
	return mat4(1.0, 0.0, 0.0, 0.0,0.0, cosTheta, -sinTheta, 0.0,0.0, sinTheta, cosTheta, 0.0,0.0, 0.0, 0.0, 1.0);
}

mat4 rotateY(float theta) {
	float cosTheta = cos(theta);
	float sinTheta = sin(theta);
	return mat4(cosTheta, 0.0, sinTheta, 0.0,0.0, 1.0, 0.0, 0.0,-sinTheta, 0.0, cosTheta, 0.0,0.0, 0.0, 0.0, 1.0);
}

mat4 rotateZ(float theta) {
	float cosTheta = cos(theta);
	float sinTheta = sin(theta);
	return mat4(cosTheta, -sinTheta, 0.0, 0.0,sinTheta, cosTheta, 0.0, 0.0,0.0, 0.0, 1.0, 0.0,0.0, 0.0, 0.0, 1.0);
}

uniform vec2 u_resolution;
uniform float u_scale;
uniform float u_offset;
uniform float u_landscale;
uniform float u_cloudscale;
uniform vec4 u_landstart;
uniform vec4 u_landstop;
uniform vec4 u_oceanstart;
uniform vec4 u_oceanstop;
uniform vec4 u_cloudcolor;
uniform float u_landthreshold;
uniform float u_cloudthreshold;
uniform vec2 u_rotation;
uniform vec4 u_backgroundcolor;
uniform float u_time;
uniform vec2 u_mouse;

void main()
{
   //pixel coordinates from 0 to 1
	float aspectRatio = u_resolution.x/u_resolution.y;
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float noiseLand = fbm(uv * (u_scale + u_landscale) + u_offset);
    float noiseClouds = fbm(uv * (u_scale + u_cloudscale) + u_offset);
    vec2 mouse0To2PI = u_mouse.xy/u_resolution.xy*2.0*M_PI;

	vec4 color;
    
    if(noiseLand > u_landthreshold)
    {
        color = mix(u_landstart, u_landstop, normalnoise(uv * u_scale + u_offset));
    } 
    else 
    {
        color = mix(u_oceanstart, u_oceanstop, normalnoise(uv * u_scale + u_offset));
    }
    
    if(noiseClouds > u_cloudthreshold)
    {
    	color = mix(color, u_cloudcolor, normalnoise(uv * u_cloudscale + u_offset));    
    }
	
	//generate a ray with origin ro and direction rd
	vec4 ro = vec4(0.0, 0.0, 1.5, 1.0);
	vec3 rd = normalize(vec3( (-1.0+2.0*uv) * vec2(aspectRatio, 1.0), -1.0));	
	mat4 rotY = rotateY(u_rotation.y);
	mat4 rotX = rotateX(u_rotation.x);
	// mat4 rotY = rotateY(u_rotation.y * u_time * 0.1);
	// mat4 rotX = rotateX(u_rotation.x + u_time * 0.1);
	// mat4 rotY = rotateY(mouse0To2PI.x);
	// mat4 rotX = rotateX(mouse0To2PI.y);
	mat4 translateIn = translate(-ro.xyz);
	mat4 translateOut = translate(ro.xyz);
	mat4 compound = translateIn * rotX * rotY * translateOut;
	ro *= compound;
	light.xyz = (vec4(light.xyz, 1.0) * compound).xyz;

	//intersect the ray with scene
	float t;
	float id = intersect(ro.xyz, rd, t);
	
	vec4 col = u_backgroundcolor;
	//Need some lighting and, so, normals.
	if(id > 0.5 && id < 1.5)
	{
		//If we hit the sphere
		vec3 pos = ro.xyz + t*rd;
		vec3 nor = nSphere(pos, sph1);
		float dif = max(0.0, dot(nor, normalize(light - pos))); //diffuse.
		//ao = 0.5 * (dot(nor, nPlane(pos)) + 1.0); complete formula. The one above is simplified.
		col = vec4(color.x, color.y, color.z, 1.) * dif + vec4(0., 0., 0., 1.);
    }

	gl_FragColor = sqrt(col);
}
/*
export const MESH_ANNOTATIONS: {[key: string]: number[]} = {
  silhouette: [
    10,  338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58,  132, 93,  234, 127, 162, 21,  54,  103, 67,  109
  ],

  lipsUpperOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  lipsLowerOuter: [146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  lipsUpperInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
  lipsLowerInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],

  rightEyeUpper0: [246, 161, 160, 159, 158, 157, 173],
  rightEyeLower0: [33, 7, 163, 144, 145, 153, 154, 155, 133],
  rightEyeUpper1: [247, 30, 29, 27, 28, 56, 190],
  rightEyeLower1: [130, 25, 110, 24, 23, 22, 26, 112, 243],
  rightEyeUpper2: [113, 225, 224, 223, 222, 221, 189],
  rightEyeLower2: [226, 31, 228, 229, 230, 231, 232, 233, 244],
  rightEyeLower3: [143, 111, 117, 118, 119, 120, 121, 128, 245],

  rightEyebrowUpper: [156, 70, 63, 105, 66, 107, 55, 193],
  rightEyebrowLower: [35, 124, 46, 53, 52, 65],

  leftEyeUpper0: [466, 388, 387, 386, 385, 384, 398],
  leftEyeLower0: [263, 249, 390, 373, 374, 380, 381, 382, 362],
  leftEyeUpper1: [467, 260, 259, 257, 258, 286, 414],
  leftEyeLower1: [359, 255, 339, 254, 253, 252, 256, 341, 463],
  leftEyeUpper2: [342, 445, 444, 443, 442, 441, 413],
  leftEyeLower2: [446, 261, 448, 449, 450, 451, 452, 453, 464],
  leftEyeLower3: [372, 340, 346, 347, 348, 349, 350, 357, 465],

  leftEyebrowUpper: [383, 300, 293, 334, 296, 336, 285, 417],
  leftEyebrowLower: [265, 353, 276, 283, 282, 295],

  midwayBetweenEyes: [168],

  noseTip: [1],
  noseBottom: [2],
  noseRightCorner: [98],
  noseLeftCorner: [327],

  rightCheek: [205],
  leftCheek: [425]
};
*/


class FacePaint {
  static get EYE_VERTICES() {
    return [
      // LEFT EYE
      133, 173, 157, 158, 
      159, 160, 161, 246,  
      33,   7, 163, 144, 
      145, 153, 154, 155, 
      // RIGHT EYE
      362, 398, 384, 385, 
      386, 387, 388, 466, 
      263, 249, 390, 373,
      374, 380, 381, 382
    ];
  }

  static get MOUTH_VERTICES() {
    return [
		78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
		95, 88, 178, 87, 14, 317, 402, 318, 324,
		61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
		146, 91, 181, 84, 17, 314, 405, 321, 375
    ];
  }
	_addCamera() {
		this._camera = new THREE.OrthographicCamera(
			this._halfW,
			-this._halfW,
			-this._halfH,
			this._halfH,
			1, 1000
		);
		this._camera.position.x = this._halfW;
		this._camera.position.y = this._halfH;
		this._camera.position.z = -600;
		this._camera.lookAt(
			this._halfW,
			this._halfH,
			0
		);
	}
  
  set blendMode(val) {
    this._renderer.domElement.style.mixBlendMode = val;
  }

	_addLights() {
		const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
		this._scene.add(light);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(this._halfW, this._halfH * 0.5, -1000).normalize();
		this._scene.add(directionalLight);
	}

	_addGeometry() {
		this._geometry = new THREE.BufferGeometry();

		/**Para borrar imagen de los ojos */
		const EV = FacePaint.EYE_VERTICES;
		for(let i = TRIANGULATION.length - 1; i > -1; i-=3) {
		const a = TRIANGULATION[i];
		const b = TRIANGULATION[i - 1];
		const c = TRIANGULATION[i - 2];
		if(EV.indexOf(a) !== -1 ||
			EV.indexOf(b) !== -1 ||
			EV.indexOf(c) !== -1) {
				TRIANGULATION.splice(i - 2, 3);
			}
		}
		/**Para borrar imagen de los ojos */

		this._geometry.setIndex(TRIANGULATION);
		this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionBufferData, 3));
		this._geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
		this._geometry.computeVertexNormals();
	}

	_addMaterial() {
		this._textureLoader = new THREE.TextureLoader();
		const texture = this._textureLoader.load(this._textureFilePath);
		// set the "color space" of the texture
		texture.encoding = THREE.sRGBEncoding;

		// reduce blurring at glancing angles
		texture.anisotropy = 16;
		const alpha = 0.4;
		const beta = 0;
		this._material = new THREE.MeshPhongMaterial({
			map: texture,
			color: new THREE.Color(0xffffff),
			specular: new THREE.Color(beta * 0.2, beta * 0.2, beta * 0.2),
			reflectivity: beta,
			shininess: Math.pow(2, alpha * 10),
		});
	}

	_setupScene() {
		this._scene = new THREE.Scene();
		this._addCamera();
		this._addLights();
		this._addGeometry();
		this._addMaterial();
		this._mesh = new THREE.Mesh(this._geometry, this._material);
		this._scene.add(this._mesh);
	}
  
  async updateTexture(url, isVideo) {
		let texture;
		if(this._video) {
			this._video.pause();
		}
		if(isVideo) {
			this._video = document.querySelector(`video[src="${url}"]`);
			this._video.play();
			texture = new THREE.VideoTexture( this._video );
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
		} else {
			texture = await this._textureLoader.loadAsync(url);	
		}
		
		this._material.map = texture;
	}

	render(positionBufferData) {

		this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionBufferData, 3));
		this._geometry.attributes.position.needsUpdate = true;

		this._renderer.render(this._scene, this._camera);

	}

	constructor({
    id,
		textureFilePath,
		w,
		h
	}) {
		this._renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			canvas: document.querySelector(`#${id}`)
		});
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(w, h);
		this._halfW = w * 0.5;
		this._halfH = h * 0.5;
		this._textureFilePath = textureFilePath;
		this._setupScene();
	}
}

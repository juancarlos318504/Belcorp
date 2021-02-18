(function () {

	const shareButtons = document.getElementsByClassName("smd");
	const alert = document.getElementById("alert");
	for (i = 0; i < shareButtons.length; ++i) {
		shareButtons[i].addEventListener("click", function(){
			alert.style.display = 'block'
		}, false);
	};



	var carousel = document.querySelector('.carousel');
	var background = document.querySelector('#background');
	var interfaz = document.querySelector('#interfaz');
	var entries = [{
		handle: 'Labial Rojo',
		url: 'https://www.cromantic.com/labial-moisturizing-rosy-go-round/p',
		entry: './assets/Rojo.png',
		background: 'hsl(35, 60%, 50%)',
		color: 'red'
	}, {
		handle: 'Labial Azul',
		url: 'https://www.cromantic.com/31-eyeliner-pencil-bys-sky-blue/p',
		entry: './assets/Azul.png',
		background: 'hsl(0, 40%, 15%)',
		color: 'blue'
	}, {
		handle: 'Labial Verde',
		url: 'https://www.cromantic.com/labial-maybelline-color-sensacional-in-bloom-barely-bloom/p',
		entry: './assets/Verde.png',
		background: 'hsl(198, 5%, 50%)',
		color: 'green'
	}, {
		handle: 'Labial Negro',
		url: 'https://www.cromantic.com/labial-mate-whipped-5-g--red-my-mind/p',
		entry: './assets/Negro.png',
		background: 'radial-gradient(hsl(243, 40%, 26%), hsl(243, 60%, 17%))',
		color: 'black'
	}/*, {
		handle: 'Jamini Roy',
		url: 'https://en.wikipedia.org/wiki/Jamini_Roy#Style',
		entry: './assets/jamini-mother-mask.jpg',
		background: 'radial-gradient(rgb(132, 0, 0), rgb(87, 0, 0))'
	}*/];

	var videoFormats = ['mov', 'm4v', 'mp4'];
	// var imageFormats = ['png', 'jpg'];
	var assets = [];

	for (var i = 0; i < entries.length; i++) {
		var obj = entries[i];
		var el;
		if (videoFormats.indexOf(obj.entry.split('.')[2]) > -1) {
			el = document.createElement('video');
			el.setAttribute('playsinline', true);
			el.setAttribute('loop', true);
			el.setAttribute('muted', true);
			el.setAttribute('autoplay', true);
			el.setAttribute('preload', 'auto');
			assets.push(new Promise(res => {
				el.onloadeddata = res;
			}));
		} else {
			el = document.createElement('img');
			assets.push(new Promise(res => {
				el.onload = res;
			}));
		}
		el.src = obj.entry;
		el.classList.add('texture');
		el.setAttribute('id', obj.handle)
		carousel.appendChild(el);

		var colorE = document.createElement('div');
		colorE.setAttribute('class', "color-selector")
		interfaz.appendChild(colorE);
		colorE.style.backgroundColor = entries[i].color;

		const index = i;
		colorE.addEventListener("click", ()=>{
			console.log(index)
			updateTexture(index);
			//faceCanvas.updateTexture(entries[i].entry, false);
			
		});
	}

	var flkty = new Flickity(carousel, {
		// hash: true,
		dragThreshold: 1,
		selectedAttraction: 0.2,
		friction: 0.8,
		wrapAround: true
	});

	function updateTexture(index) {
		var url = entries[index].entry;
		var isVideo = videoFormats.indexOf(url.split('.')[2]) > -1;
		faceCanvas.updateTexture(url, isVideo);
		background.style.background = entries[index].background;
		if ('url' in entries[index]) {
			artist.style.pointerEvents = 'all';
			artist.href = entries[index].url;
		} else {
			artist.style.pointerEvents = 'none';
			artist.href = '#';
		}
		artist.textContent = entries[index].handle;
	}
	flkty.on('change', updateTexture);
	//const toggleBtn = document.querySelector('#visibilityToggle');
	//const toggleBtnLabel = document.querySelector('#visibilityToggle > span');

	/*function toggleWebcamVisibility(e) {
		toggleBtn.classList.toggle('on');
		webcam.classList.toggle('visible');
		if (toggleBtn.classList.contains('on')) {
			toggleBtnLabel.textContent = 'Webcam visible';
		} else {
			toggleBtnLabel.textContent = 'Webcam hidden';
		}
	}
	toggleBtn.addEventListener('click', toggleWebcamVisibility);*/
	const webcam = document.querySelector('#webcam');
	let model, faceCanvas, w, h;
	//const loaderMsg = document.querySelector('#loaderMsg');

	var artist = document.querySelector('#artist');

	async function renderPredictions(t) {
    requestAnimationFrame(renderPredictions);
		//loaderMsg.textContent = 'Buscando Rostro';
		const predictions = await model.estimateFaces(webcam);

		if (predictions.length > 0) {
			const positionBufferData = predictions[0].scaledMesh.reduce((acc, pos) => acc.concat(pos), []);
			if (!faceCanvas) {
				const props = {
					id: 'faceCanvas',
					textureFilePath: entries[0].entry,
					w,
					h
				}
				faceCanvas = new FacePaint(props);
				updateTexture(flkty.selectedIndex);
				document.querySelector('#loader').style.display = 'none';
				return;
			}
			faceCanvas.render(positionBufferData);
		}
	}
	async function main() {
		try {
			
			//loaderMsg.textContent = 'Cargando Cámara Web';
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false
			});
			webcam.srcObject = stream;
			await new Promise(function (res) {
				webcam.onloadedmetadata = function () {
					w = webcam.videoWidth;
					h = webcam.videoHeight;
					res();
				}
			});

			webcam.height = h;
			webcam.width = w;
			webcam.setAttribute('autoplay', true);
			webcam.setAttribute('muted', true);
			webcam.setAttribute('playsinline', true);
			webcam.play();
			//loaderMsg.textContent = 'Cargando Datos';
			// Load the MediaPipe facemesh model.
			model = await facemesh.load({
				maxContinuousChecks: 5,
				detectionConfidence: 0.9,
				maxFaces: 1,
				iouThreshold: 0.3,
				scoreThreshold: 0.75
			});
			//loaderMsg.textContent = 'Cargando Datos';
			await Promise.all(assets);
			renderPredictions();
		} catch (e) {
			alert(e);
			console.error(e);
		}
	}
	tf.env().set('WEBGL_CPU_FORWARD', false);
	main();
})();

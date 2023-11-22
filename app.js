function initStats() {
	var stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.getElementById("Stats-output").append( stats.domElement );
	return stats;
}


// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

// Create an empty scene
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0xDDDDDD, 0.065);
// scene.fog = new THREE.Fog( 0xDDDDDD, 10, 40);
var stats = initStats();
var clock = new THREE.Clock();
clock.start();
// Create a basic perspective camera
var camera = new THREE.OrthographicCamera( -10 * (16 / 9), 10 * (16 / 9), 10, -10, 1, 1000 );
// var camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.y = 10;

var axes = new THREE.AxisHelper( 20 );
scene.add(axes);

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({antialias:true});

// Configure renderer clear color
renderer.setClearColor("#dcf0fa");

// Configure renderer size
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;

// Append Renderer to DOM
// document.body.appendChild( renderer.domElement );


// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

var planeGeometry = new THREE.PlaneGeometry(200,20,1,1);
var planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
var plane = new THREE.Mesh(planeGeometry,planeMaterial);
plane.rotation.x=-0.5*Math.PI;
plane.position.y = -1;

 scene.add(plane);
// Create a Cube Mesh with basic material
var geometry = new THREE.BoxGeometry( 1, 1, 5 );
var material = new THREE.MeshLambertMaterial( { color: "#433F81" } );
var cube = new THREE.Mesh( geometry, material );
var cube2 = new THREE.Mesh( geometry, material );

cube.position.x = -16;
cube2.position.x = 16;

const spgeometry = new THREE.SphereGeometry(1, 32, 16); 
const spmaterial = new THREE.MeshLambertMaterial( { color: 0xff5577 } ); 
const sphere = new THREE.Mesh( spgeometry, spmaterial );
scene.add( sphere );

var spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( -40, 60, -10 );
scene.add( spotLight );

var ambientLight = new THREE.AmbientLight(0x0c0c0c);
scene.add(ambientLight);

// Add cube to Scene
scene.add( cube );
scene.add( cube2 );
// Render Loop

plane.receiveShadow = true;
cube.castShadow = true;
cube2.castShadow = true;
spotLight.castShadow = true;
spotLight.shadow.mapSize.set( 16392, 16392);
document.addEventListener( 'mousedown', onClick, false );
var which = 0;

var listener = new THREE.AudioListener();
camera.add(listener);
var paddle1_sound = new THREE.Audio(listener);
var paddle2_sound = new THREE.Audio(listener);
var wall = new THREE.Audio(listener);
var point_loss = new THREE.Audio(listener);
var backgroundMusic = new THREE.Audio(listener);
var audioLoader = new THREE.AudioLoader();
audioLoader.load('sounds/pong/paddle1.wav', function(buffer) {
	paddle1_sound.setBuffer(buffer);
});
audioLoader.load('sounds/pong/paddle2.wav', function(buffer) {
	paddle2_sound.setBuffer(buffer);
  });
  audioLoader.load('sounds/pong/wall.wav', function(buffer) {
	wall.setBuffer(buffer);
  });
  audioLoader.load('sounds/pong/point_loss.wav', function(buffer) {
	point_loss.setBuffer(buffer);
  });
  audioLoader.load('sounds/pong/music.mp3', function(buffer) {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true); // Set to loop
    backgroundMusic.setVolume(1); // Set volume (0.0 to 1.0)
    backgroundMusic.play();
  });

function onClick( e )
{
	if (which == 0)
		which = 1;
	else
		which = 0;
}

var controls = new function()
{
	this.rotationSpeed = 1.;
	this.bouncingSpeed = 1.;
	this.addCube = function()
	{
		var cubeSize = Math.ceil((Math.random() * 3));
		var cubeGeometry = new THREE.CubeGeometry(cubeSize,cubeSize,cubeSize);
		var cubeMaterial = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff });
		var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		cube.castShadow = true;
		cube.name = "cube-" + scene.children.length;
		cube.position.x= Math.round((Math.random() * 20)) - 10;
		cube.position.y= Math.round((Math.random() * 2));
		cube.position.z= Math.round((Math.random() * 20)) - 10;
		scene.add(cube);
	}
	this.removeCube = function()
	{
		var allChildren = scene.children;
		var lastObject = allChildren[allChildren.length-1];
		if (lastObject instanceof THREE.Mesh)
		{
			scene.remove(lastObject);
			this.numberOfObjects = scene.children.length;
		}
	}
}

var keys = {};
document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
	console.log(event.key);
});

document.addEventListener('keyup', function (event) {
    keys[event.key] = false;
});


var gui = new dat.GUI();
gui.add(controls, 'rotationSpeed',0,10);
gui.add(controls, 'bouncingSpeed',0,5);
gui.add(controls, 'addCube');
gui.add(controls, 'removeCube');

// scene.overrideMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var cameraSpeed = 0.1;
var ballSpeed = 0.1;
var dx = ballSpeed;
var dz = ballSpeed;
camera.lookAt(scene.position);

function checkCollision(mesh1, mesh2) {
    var box1 = new THREE.Box3().setFromObject(mesh1);
    var box2 = new THREE.Box3().setFromObject(mesh2);

    return box1.intersectsBox(box2);
}

var score1 = 0;
var score2 = 0;

function movepaddleRight(obj) {
	if (keys['ArrowUp'])
	{
		obj.position.z -= 0.1;
	}
	if (keys['ArrowDown'])
	{
		obj.position.z += 0.1;
	}
	if (obj.position.z > 7)
	{
		obj.position.z = 7;
	}
	if (obj.position.z < -7)
	{
		obj.position.z = -7;
	}
  }

  function movepaddleLeft(obj) {
	if (keys['w'])
	{
		obj.position.z -= 0.1;
	}
	if (keys['s'])
	{
		obj.position.z += 0.1;
	}
	if (obj.position.z > 7)
	{
		obj.position.z = 7;
	}
	if (obj.position.z < -7)
	{
		obj.position.z = -7;
	}
  }

  function updateScore()
  {
	var myDiv = document.getElementById("Score");
	myDiv.innerHTML = score1 + " - " + score2;
  }

  function resetBall(ball)
  {
	updateScore();
	ball.position.x = 0;
	ball.position.z = 0;
	var pause = clock.getElapsedTime();
	while (clock.getElapsedTime() - pause < 1)
	{}
	ballSpeed = 0.1;
  }

  function moveBall(ball)
  {
	ball.position.x += dx;
	ball.position.z += dz;
	if (checkCollision(ball, cube))
	{
		paddle1_sound.play();
		ball.position.x = -14;
		ballSpeed *= 1.02;
		dx *= -1.;
		dz = Math.random() * Math.abs(dx) * 2 - Math.abs(dx);
		
	}
	if (checkCollision(ball, cube2))
	{
		paddle2_sound.play();
		ball.position.x = 14;
		ballSpeed *= 1.02;
		dx *= -1.;
		dz = Math.random() * Math.abs(dx) * 2 - Math.abs(dx);
	}
	if (ball.position.z > 9)
	{
		wall.play();
		ball.position.z = 9;
		dz *= -1;
	}
	else if (ball.position.z < -9)
	{
		wall.play();
		ball.position.z = -9;
		dz *= -1;
	}
	else if (ball.position.x > 18)
	{
		point_loss.play();
		score2++;
		resetBall(ball);
	}
	else if (ball.position.x < -18)
	{
		point_loss.play();
		score1++;
		resetBall(ball);
	}
	var tmp = Math.sqrt(dx * dx + dz * dz);
	if (tmp != 0.)
	{
		dx = (dx / tmp) * ballSpeed;
		dz = (dz / tmp) * ballSpeed;
	}
  }

  sphere.position.x = 0;
  sphere.position.z = 0;

var render = function ()
{
		movepaddleRight(cube2);
		movepaddleLeft(cube);
		moveBall(sphere);
		if (keys[' '])
		{
			resetBall(sphere);
		}
	camera.updateProjectionMatrix();
	stats.update();
	requestAnimationFrame( render );
    renderer.render(scene, camera);
};

document.getElementById("WebGL-output").appendChild(renderer.domElement);
resetBall(sphere);
render(scene, camera);

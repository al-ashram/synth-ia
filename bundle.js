/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	(__webpack_require__(1));
	(__webpack_require__(2));
	(__webpack_require__(3));
	(__webpack_require__(4));
	(__webpack_require__(5));


/***/ },
/* 1 */
/***/ function(module, exports) {

	function BufferLoader(context, urlList, callback) {
	  this.context = context;
	  this.urlList = urlList;
	  this.onload = callback;
	  this.bufferList = new Array();
	  this.loadCount = 0;
	}

	BufferLoader.prototype.loadBuffer = function(url, index) {
	  // Load buffer asynchronously
	  var request = new XMLHttpRequest();
	  request.open("GET", url, true);
	  request.responseType = "arraybuffer";

	  var loader = this;

	  request.onload = function() {
	    // Asynchronously decode the audio file data in request.response
	    loader.context.decodeAudioData(
	      request.response,
	      function(buffer) {
	        if (!buffer) {
	          alert('error decoding file data: ' + url);
	          return;
	        }
	        loader.bufferList[index] = buffer;
	        if (++loader.loadCount == loader.urlList.length)
	          loader.onload(loader.bufferList);
	      },
	      function(error) {
	        console.error('decodeAudioData error', error);
	      }
	    );
	  }

	  request.onerror = function() {
	    alert('BufferLoader: XHR error');
	  }

	  request.send();
	}

	BufferLoader.prototype.load = function() {
	  for (var i = 0; i < this.urlList.length; ++i)
	  this.loadBuffer(this.urlList[i], i);
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();

	function startBuffer(scene){
	  scene.forEach(function(instrument){
	    initInstrument(instrument);
	  });
	}

	function initInstrument(instrument) {
	  var files = [
	        'audio/'+instrument+'/note1.mp3',
	        'audio/'+instrument+'/note2.mp3',
	        'audio/'+instrument+'/note3.mp3',
	        'audio/'+instrument+'/note4.mp3',
	        'audio/'+instrument+'/note5.mp3',
	        'audio/'+instrument+'/note6.mp3',
	        'audio/'+instrument+'/note7.mp3',
	        'audio/'+instrument+'/note8.mp3',
	        'audio/'+instrument+'/note9.mp3',
	        'audio/'+instrument+'/note10.mp3',
	        'audio/'+instrument+'/note11.mp3',
	        'audio/'+instrument+'/note12.mp3'
	  ]
	  bufferLoader = new BufferLoader(context, files, function(bufferlist){
	    sounds[instrument] = bufferlist

	  });
	  bufferLoader.load()
	}

	var sounds = {}

	function playNote(note, instrument, volume, player) {
	  var source = context.createBufferSource();
	  var gainNode = context.createGain();
	  source.buffer = sounds[instrument][note - 1];
	  gainNode.gain.value = volume;
	  source.connect(gainNode);
	  gainNode.connect(compressor);
	  compressor.connect(context.destination);
	  source.start(0);
	  currentAudio[player].sound = ""
	}

	var compressor = context.createDynamicsCompressor();
	compressor.threshold.value = -20;
	compressor.knee.value = 25;
	compressor.ratio.value = 12;
	compressor.reduction.value = -30;
	compressor.attack.value = 0;
	compressor.release.value = .2;

	function triggerNotes () {
	  if (currentAudio) {
	    Object.keys(currentAudio).forEach(function(key){
	      var player = currentAudio[key]
	      if (player.sound){
	        playNote(player.sound, player.instrument, player.volume, player.player)
	      }
	    })
	    playerAudio = null;
	  }
	}
	var changeCount = 0;
	var instrumentCounter = {};

	function playSynthia(tempo){
	  for (var key in rhythmCounter) {
	    rhythmCounter[key] += tempo;
	    if (rhythmCounter[key] >= synthia[key].tempo) {
	      rhythmCounter[key] = 0;
	      var count = instrumentCounter[synthia[key].instrument];
	      count > 7 ? count = 0 : null
	      var note = noteArray[count]
	      count++
	      instrumentCounter[synthia[key].instrument] = count
	      changeCount++
	      if (changeCount === 512) {
	        changeCount = 0;
	      }
	      // synthia playNote function
	      if (synthia[key].state) {
	        var source = context.createBufferSource();
	        var gainNode = context.createGain();
	        source.buffer = sounds[synthia[key].instrument][note];
	        gainNode.gain.value = synthia[key].volume;
	        source.connect(gainNode);
	        gainNode.connect(compressor);
	        compressor.connect(context.destination);
	        source.start(0);
	      }
	    }
	  }
	}

	// var strokeCount = 0
	function startMetronome(start,tempo,noteArray){

	  // init synthia's rhythmCounter
	  time = 0,
	  elapsed = '0.0';
	  function instance() {
	    time += tempo;
	    elapsed = Math.floor(time / tempo) / 10;
	    if(Math.round(elapsed) == elapsed) { elapsed += '.0'; }
	    var diff = (new Date().getTime() - start) - time;
	    window.setTimeout(instance, (tempo - diff));
	    if (Object.keys(sounds).length === scene.length) {
	      triggerNotes();
	      playSynthia(tempo);
	      // strokeCount++
	    // if (strokeCount === 4) {
	    //   strokeIt();
	    //   strokeCount = 0
	    // }
	     
	    }
	    // requestAnimationFrame(playerLoop)
	    // clearInterval(playerLoop);
	    // playerLoop = setInterval(startTrail, 25);
	  }
	  window.setTimeout(instance, tempo);
	  scene.forEach(function(instrument) {
	    instrumentCounter[instrument] = 0;
	  });
	}


/***/ },
/* 3 */
/***/ function(module, exports) {

	var currentNote;
	var playerLoop;
	var mainSVG;
	var currentX;
	var currentY;
	var prevX;
	var prevY;

	var frameHeight;
	var frameWidth;
	var changingHeight;
	var maxBarHeight;
	var minBarHeight;
	var barWidth;
	var lowerLimit;
	var upperLimit;
	var numberOfNotes;

	var down = false;
	var clickAndReleased = false;
	var fadeOutCounter = 0;
	var fadeInCounter = 0;
	var fadeOut;

	function strokeIt(){
	  var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
	  $('svg line').css('stroke-width', .5).css('stroke', '#8C001A');
	  setTimeout(function(){ $('svg line').css('stroke-width', .5).css('stroke', 'grey'); }, 125);
	};

	function createNyan(id, cat, x, y ){
	  mainSVG.append("image")
	  .attr("id", "nyan-cat" + id)
	  .attr("xlink:href", "../images/" + cat)
	  .attr("height", 100)
	  .attr("width", 100)
	  .attr("x", x)
	  .attr("y", y)
	}

	function killNyan(id) {
	  mainSVG.select('image[id="nyan-cat' + id + '"]').remove();
	}

	// nyan render function
	function nyans() {
	  for (var key in mice) {
	    mainSVG.select('#nyan-cat' + mice[key].playerId).attr("y", snappyTransition(Math.min(mice[key].currentY, frameHeight)) - 50)
	        .attr("x",  mice[key].currentX - 50);
	  }
	}

	function startInterval(id){
	  function generateTrail(x, y, height){
	  var rect = mainSVG.append("rect");
	  var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
	  rect.style("stroke", randomColor)
	    .style("stroke-width", 4)
	    .attr("width", 1)
	    .attr("height", height)
	    .attr("x", x)
	    .attr("y", y)
	    // .attr("ry", 5)
	    .transition()
	    .ease("linear")
	    .duration(2000)
	    // .attr('y', mice[id].currentY - mice[id].height / 2)
	    .attr("x", -50)
	    .remove()
	  }
	  var trail =  setInterval(function(){
	    var oldY = mice[id].currentY;
	    changingHeight = setBarHeight();
	    generateTrail(mice[id].currentX - 50, mice[id].currentY - mice[id].height / 2, mice[id].height);
	    if (fadeOutCounter > 0) {
	      fadeOutCounter -= 1;
	    }
	    if (fadeInCounter < 5) {
	      fadeInCounter += 1;
	    }
	  }, 31.25);
	  return trail;
	}

	function setBarHeight() {
	  if (down) {
	    if ((minBarHeight * Math.pow(2, fadeInCounter)) < (maxBarHeight)) {
	      return minBarHeight * Math.pow(2, fadeInCounter);
	    } else {
	      return maxBarHeight;
	    }
	  } else if (fadeOutCounter > 0) {
	    return maxBarHeight * Math.pow(0.80, -(fadeOutCounter - 10));
	  } else {
	    return minBarHeight;
	  }
	}

	function snappyTransition(y) {
	  var noteAreaHeight = (frameHeight / 12);
	  for (var i = 1; i <= 12; i++) {
	    if (y <= noteAreaHeight * i) {
	      return noteAreaHeight / 2 * (2 * i - 1);
	    }
	  }
	}

	$(function() {

	  frameWidth = document.getElementById('main-frame').clientWidth;
	  frameHeight = document.getElementById('main-frame').clientHeight;
	  // console.log(frameWidth + 'x' + frameHeight)
	  maxBarHeight = frameHeight * 0.15;
	  minBarHeight = frameHeight * 0.01;
	  barWidth = frameHeight * 0.005;
	  lowerLimit = frameWidth * 0.6;
	  upperLimit = frameWidth * 0.8;
	  numberOfNotes = 12;

	  mainSVG = d3.select("#main-frame")
	    .append("svg")
	    .attr("width", frameWidth)
	    .attr("height", frameHeight)

	  //music ladder
	  for (var i = 1; i < 12; i++) {
	    mainSVG.append("line")
	      .style("stroke", "gray")
	      .style("stroke-width", 0.5)
	      .attr("x1", 0)
	      .attr("y1", frameHeight / 12 * i)
	      .attr("x2", frameWidth)
	      .attr("y2", frameHeight / 12 * i);
	  }

	  // update current mouse X, Y to pass for visualization
	  $('#main-frame').on('mousemove', function(e) {
	    prevX = currentX;
	    prevY = currentY;
	    currentX = e.pageX - $('#main-frame').offset().left;
	    currentY = e.pageY - $('#main-frame').offset().top;
	    // mainSVG.select('#nyan-cat' + playerId).attr("y", snappyTransition(Math.min(currentY, frameHeight)) - 50)
	    //   .attr("x", prevX - 50);
	    setCurrentNote(currentY);
	    // console.log(currentX + ' x ' + currentY);
	  });

	  function reverseNoteOrder(note){
	    return (-1 * (note - numberOfNotes))
	  }

	  function setCurrentNote(y) {
	      var spaceBetweenLines = Math.round(frameHeight/numberOfNotes);
	      var aNote = Math.floor(y/spaceBetweenLines);
	      currentNote = reverseNoteOrder(aNote);
	    }

	  $('body').on('keydown', function(event) {
	    // the keys are / Z X C V / A S D F / Q W E R /
	    var keycodes = [90, 88, 67, 86, 65, 83, 68, 70, 81, 87, 69, 82];
	    var noteAreaHeight = (frameHeight / 12);
	    for (var i = 0; i <= 12; i++) {
	      if (keycodes.indexOf(event.keyCode) === (-1 * (i - 12))) {
	        prevY = currentY;
	        currentY = noteAreaHeight / 2 * (2 * i - 1);
	        // mainSVG.select('#nyan-cat' + playerId).attr("y", currentY - 50)
	        // sound wave gen
	        down = true;
	        fadeInCounter = 0;
	      }
	    }
	  });

	  // sound wave gen
	  $('body').on('keyup', function(event) {
	    var keycodes = [90, 88, 67, 86, 65, 83, 68, 70, 81, 87, 69, 82];
	    if (keycodes.indexOf(event.keyCode) != -1) {
	      down = false;
	      clickAndReleased = true;
	      fadeOutCounter = 10;
	    }
	  })

	  $(document).on('mousedown', function(e) {
	    down = true;
	    fadeInCounter = 0;
	  });

	  $(document).on('mouseup', function(e) {
	    down = false;
	    clickAndReleased = true;
	    fadeOutCounter = 10;
	  });
	});


/***/ },
/* 4 */
/***/ function(module, exports) {

	var playerId = 0;
	var currentAudio;
	var playerAudio;
	var currentInstrument;
	var synthia;
	var scene = [];
	var noteArray;
	var rhythmCounter = {};
	var mouseCount;
	var mice = {};
	var trailers = {};


	$(function(){
	  var socket = io();
	  currentInstrument = '';

	  // // emit scene data
	  var sceneName = (window.location.pathname).slice(1);
	  socket.emit('scene', sceneName);


	  // receive playerId from server
	  socket.on('assignPlayerId', function(data){
	    if (playerId === 0){
	      playerId = data.id;
	    }
	  });

	  // gets scene info
	  socket.on('sceneData', function(data){
	    scene = data;
	    var randNum = Math.floor(Math.random() * data.length);
	    currentInstrument = data[randNum];

	    // buffer intruments
	    startBuffer(scene);

	    // set player instrument names
	    var playerButtons = $('.player-instruments');
	    var count = 0;
	    for(var i=0; i<playerButtons.length; i++){
	      var element = playerButtons.eq(i);
	      element.text(data[count].slice(6));
	      count += 1;
	    }
	    // set random current instrument element's focus
	    if (!($('.player-instruments').hasClass('focus'))) {
	      $('.player-instruments:contains('+ currentInstrument.slice(6) +')').addClass('focus');
	    }
	    var synthiaButtons = $('.synthia-instruments');
	    var count = 0;
	    for(var i=0; i<synthiaButtons.length; i++){
	      var element = synthiaButtons.eq(i);
	      element.text(data[count].slice(6));
	      count += 1;
	    }
	  });

	  socket.on('createNyan', function(data){
	    for (var key in data) {
	      if (!$('#nyan-cat' + key).length) {
	        createNyan(key, data[key], currentX, currentY);
	      }
	      if (!trailers.hasOwnProperty(key)){
	        trailers[key] = startInterval(key);
	      }
	    }
	  });

	  socket.on('killNyan', function(data){
	    killNyan(data);
	    clearInterval(trailers[data]);
	    delete trailers[data];
	  });

	  // gets tempo from server to keep syncopation
	  var init = true
	  socket.on('tempo', function(data){
	    if (init) {
	      startMetronome(data[0],data[1]);
	      init = false;
	    }
	  });

	  //change Note Array
	  socket.on('changeSynthia', function(data){
	    noteArray = data;
	  });

	  // gets current game state of all notes in queue
	  socket.on('currentAudio', function(data){
	    currentAudio = data;
	  });

	  // gets synthia's notes when joining
	  socket.on('synthiaNotes', function(data){
	    synthia = data
	    if (Object.keys(rhythmCounter).length === 0) {
	      for (var key in synthia) {
	        rhythmCounter[key] = synthia[key].tempo;
	      }
	    }
	    if (isSynthiaOn(data)){
	      $('.synthia-state > button').removeClass('focus');
	      $('#on').addClass('focus');
	    } else {
	      $('.synthia-state > button').removeClass('focus');
	      $('#off').addClass('focus');
	    }
	    hasSynthiaInstrumentsOn(data);
	  });

	  function isSynthiaOn(synthia){
	    for (var key in synthia){
	      if (!synthia[key].state){
	        return false;
	      }
	      return true;
	    }
	  }

	  function hasSynthiaInstrumentsOn(synthia){
	    $('button.synthia-instruments').removeClass('focus');
	    for (var key in synthia){
	      if (synthia[key].state){
	        $('button.synthia-instruments:contains('+ synthia[key].instrument.slice(6) +')').addClass('focus');
	      }
	    }
	  }

	  // turn synthia on/off
	  $('#on').on('click', function(){
	    for (var key in synthia) {
	      synthia[key].state = true;
	    }
	    socket.emit('synthiaOn', [sceneName, synthia]);
	  });

	  $('#off').on('click', function(){
	    for (var key in synthia) {
	      synthia[key].state = false;
	    }
	    socket.emit('synthiaOff', [sceneName, synthia]);
	  });

	  // player mouse tracker
	  setInterval(function(){
	    socket.emit('mousePosition', { scene: sceneName, playerId: playerId, currentX: currentX, currentY: currentY, height: changingHeight });
	  }, 10);

	  socket.on('otherPlayerPositions', function(data){
	    mice[data.playerId] = data;
	    nyans();
	  });

	  // synthia instrument control
	  $('#synthia-instruments button').on('click', function(){
	    if (!$(this).hasClass('focus')) {
	      for (var key in synthia) {
	      if (sceneName + '-' + $(this).text() === synthia[key].instrument) {
	        synthia[key].state = true;
	      }
	    }
	    } else {
	      for (var key in synthia) {
	        if (sceneName + '-' + $(this).text() === synthia[key].instrument) {
	          synthia[key].state = false;
	        }
	      }
	    }
	    socket.emit('synthiaInstrumentControl', [sceneName, synthia]);
	  });

	  // mouse position
	  $('#main-frame').on('click', function(){
	    var note = currentNote;
	    playerAudio = { scene: sceneName, sound: note, instrument: currentInstrument, player: playerId, volume: 1 }
	    socket.emit('playerInput', playerAudio );
	  });

	  // 12 notes for 12 keys on the board
	  $('body').on('keydown', function(event){
	    // the keys are / Z X C V / A S D F / Q W E R /
	    var keycodes = [90,88,67,86,65,83,68,70,81,87,69,82];
	    if (keycodes.indexOf(event.keyCode) != -1){
	      // socket.emit('mousePosition', { scene: sceneName, playerId: playerId, currentX: currentX, currentY: currentY, height: changingHeight });
	      var note = keycodes.indexOf(event.keyCode) + 1;
	      if (!playerAudio){
	        playerAudio = { scene: sceneName, sound: note, instrument: currentInstrument, player: playerId, volume: 1 };
	        socket.emit('playerInput', playerAudio );
	      } else {
	        if (playerAudio.sound != note){
	          playerAudio = { scene: sceneName, sound: note, instrument: currentInstrument, player: playerId, volume: 1 };
	          socket.emit('playerInput', playerAudio );
	        }
	      }
	    }
	  });
	});


/***/ },
/* 5 */
/***/ function(module, exports) {

	$(function(){
	// console.log('wtf')


	  // controls keyboard visual
	  var $keys = $(".key")
	  function playKeys(){
	    $keys.each(function(index,element){
	      setTimeout(function(){
	        $($keys[index-1]).removeClass('keydown')
	        $($keys[index]).addClass('keydown')
	      if (index === $keys.length-1){
	        playKeys();
	      }
	      },100 * index);
	    });
	  };

	  playKeys();
	});


/***/ }
/******/ ]);
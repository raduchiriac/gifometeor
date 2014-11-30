var rayjs = {};

Template.walkerScreen.rendered = function() {
  // -------------------------------------------------- //
  // Trigonometry Helper Functions                      //
  //                                                    //
  // To achieve the best performance, these functions   //
  // could be supplemented with look-up tables.         //
  //                                                    //
  // -------------------------------------------------- //

  var trig = {};

  trig.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };

  trig.degrees = function(radians) {
    return radians * 180 / Math.PI;
  };

  trig.sin = function(degrees) {
    return Math.sin(trig.radians(degrees));
  };

  trig.cos = function(degrees) {
    return Math.cos(trig.radians(degrees));
  };

  trig.tan = function(degrees) {
    return Math.tan(trig.radians(degrees));
  };

  // -------------------------------------------------- //
  // RayJS Engine                                       //
  // -------------------------------------------------- //

  rayjs.engine = {
    tileSize: 64,
    cyclesPerSecond: 0
  };

  rayjs.engine.initialise = function() {
    console.log('rayjs.engine.initialise');
    var engine = rayjs.engine;

    engine.cyclesPerSecond = rayjs.engine.cyclesPerSecond;
    rayjs.map.initialise();
    rayjs.controller.initialise();
    rayjs.mainCanvas.initialise();

    engine.cycle();
  };

  rayjs.engine.cycle = function() {
    // enterFrame
    // console.log('rayjs.engine.cycle');
    var startTime = new Date().getTime();
    var engine = rayjs.engine;
    var camera = rayjs.camera;

    camera.move();

    rayjs.mainCanvas.prepare();

    engine.castRays();

    var finishTime = new Date().getTime();
    var timeLapsed = finishTime - startTime; // in milliseconds.

    engine.cyclesPerSecond = (timeLapsed >= 33) ? Math.floor(1000 / timeLapsed) : 30;

    if (timeLapsed >= 33) {
      // Our target is ~30 CPS, so if a cycle takes more than 34ms, move straight on.
      engine.cycle();
    } else {
      setTimeout(rayjs.engine.cycle, 33 - timeLapsed);
    }

  };

  rayjs.engine.castRays = function() {
    // enterFrame
    // console.log('rayjs.engine.castRays');

    var engine = rayjs.engine;
    var camera = rayjs.camera;
    var map = rayjs.map;

    var mainCanvas = rayjs.mainCanvas;

    var castAngle = camera.rotation - 30;
    castAngle = (castAngle < 0) ? 360 + castAngle : castAngle;

    var column = 0;

    while (column < 400) {

      var horizontalIntersection = engine.findHorizontalIntersection(castAngle);
      var verticalIntersection = engine.findVerticalIntersection(castAngle);
      var closestIntersection = null;

      if (horizontalIntersection.distance <= verticalIntersection.distance) {
        closestIntersection = horizontalIntersection;
      } else {
        closestIntersection = verticalIntersection;
      }

      var projectedHeight = engine.tileSize / closestIntersection.distance * 277;
      projectedHeight *= 2;

      var top = 200 - Math.floor(projectedHeight / 2);
      var textureX = 0;

      textureX = (closestIntersection.orientation == "horizontal") ? closestIntersection.positionX : closestIntersection.positionY;
      textureX %= rayjs.engine.tileSize;
      textureX += (closestIntersection.orientation == "horizontal") ? rayjs.engine.tileSize : 0;

      var textureY = map.getBlock(closestIntersection.blockX, closestIntersection.blockY) * rayjs.engine.tileSize * 3;

      mainCanvas.drawTexturedSlice(column * 2, top, 2, projectedHeight, textureX, textureY);

      castAngle += (60 / 320);
      castAngle = (castAngle > 360) ? castAngle - 360 : castAngle;

      column++;
    }

  };


  rayjs.engine.findHorizontalIntersection = function(castAngle) {
    // enterFrame : while 640
    // console.log('rayjs.engine.findHorizontalIntersection');

    var engine = rayjs.engine;
    var camera = rayjs.camera;
    var map = rayjs.map;

    var firstX = 0;
    var firstY = 0;

    firstY = Math.floor(camera.positionY / engine.tileSize) * (engine.tileSize);
    firstY += (castAngle > 0 && castAngle <= 180) ? engine.tileSize : -1;

    firstX = Math.abs(firstY - camera.positionY) / trig.tan(castAngle);
    firstX *= (castAngle > 0 && castAngle <= 180) ? 1 : -1;

    firstX += camera.positionX;

    var stepX = 0;
    var stepY = 0;

    stepX = Math.abs(engine.tileSize / trig.tan(castAngle));
    stepX *= (castAngle > 90 && castAngle <= 270) ? -1 : 1;

    stepY = engine.tileSize;
    stepY *= (castAngle > 0 && castAngle <= 180) ? 1 : -1;

    var currentX = firstX;
    var currentY = firstY;
    var blockX = Math.floor(currentX / engine.tileSize);
    var blockY = Math.floor(currentY / engine.tileSize);

    while (!map.blocked(blockX, blockY)) {
      currentX += stepX;
      currentY += stepY;
      blockX = Math.floor(currentX / engine.tileSize);
      blockY = Math.floor(currentY / engine.tileSize);
    }

    var distance = Math.abs(camera.positionY - currentY) / trig.sin(castAngle);
    distance = Math.abs(distance);
    distance *= trig.cos(castAngle - camera.rotation);

    if (castAngle == 0 || castAngle == 180) {
      distance = 9999999;
    }

    return {
      orientation: "horizontal",
      positionX: Math.floor(currentX),
      positionY: Math.floor(currentY),
      blockX: blockX,
      blockY: blockY,
      distance: distance
    };
  };


  rayjs.engine.findVerticalIntersection = function(castAngle) {
    // enterFrame : while 640
    // console.log('rayjs.engine.findVerticalIntersection');

    var engine = rayjs.engine;
    var camera = rayjs.camera;
    var map = rayjs.map;

    var firstX = 0;
    var firstY = 0;

    firstX = Math.floor(camera.positionX / engine.tileSize) * (engine.tileSize);
    firstX += (castAngle > 90 && castAngle <= 270) ? -1 : rayjs.engine.tileSize;

    firstY = Math.abs(firstX - camera.positionX) * trig.tan(castAngle);
    firstY *= (castAngle > 90 && castAngle <= 270) ? -1 : 1;
    firstY += camera.positionY;

    var stepX = 0;
    var stepY = 0;

    stepX = engine.tileSize;
    stepX *= (castAngle > 90 && castAngle <= 270) ? -1 : 1;

    stepY = Math.abs(engine.tileSize * trig.tan(castAngle));
    stepY *= (castAngle > 0 && castAngle <= 180) ? 1 : -1;

    var currentX = firstX;
    var currentY = firstY;

    var blockX = Math.floor(currentX / engine.tileSize);
    var blockY = Math.floor(currentY / engine.tileSize);

    while (!map.blocked(blockX, blockY)) {
      currentX += stepX;
      currentY += stepY;
      blockX = Math.floor(currentX / engine.tileSize);
      blockY = Math.floor(currentY / engine.tileSize);
    }

    var distance = Math.abs(camera.positionY - currentY) / trig.sin(castAngle);
    distance = Math.abs(distance);
    distance *= trig.cos(castAngle - camera.rotation);

    if (castAngle == 90 || castAngle == 270) {
      distance = 9999999;
    }

    return {
      orientation: "vertical",
      positionX: Math.floor(currentX),
      positionY: Math.floor(currentY),
      blockX: blockX,
      blockY: blockY,
      distance: distance
    };
  };

  // -------------------------------------------------- //
  // RayJS Camera                                       //
  // -------------------------------------------------- //

  rayjs.camera = {
    positionX: 80,
    positionY: 80,
    rotation: 90,

    directionOfMovement: 0, // 1 forward, -1 backward, 0 no movement
    directionOfRotation: 0, // 1 clockwise, -1 counter-clockwise, 0 no rotation

    rateOfMovement: 10,
    rateOfRotation: 5
  };

  rayjs.camera.move = function() {
    // enterframe

    var engine = rayjs.engine;
    var camera = rayjs.camera;
    var map = rayjs.map;

    if (camera.directionOfRotation != 0) {
      camera.rotation += camera.rateOfRotation * camera.directionOfRotation;
      camera.rotation = (camera.rotation < 0) ? 360 + camera.rotation : camera.rotation;
      camera.rotation = (camera.rotation > 360) ? camera.rotation - 360 : camera.rotation;
    }

    if (camera.directionOfMovement != 0) {
      var displacementX = trig.cos(camera.rotation) * camera.rateOfMovement;
      var displacementY = trig.sin(camera.rotation) * camera.rateOfMovement;

      var newX = camera.positionX + (displacementX * camera.directionOfMovement);
      var newY = camera.positionY + (displacementY * camera.directionOfMovement);

      newX = (newX < 0) ? 0 : newX;
      newX = (newX > map.width * engine.tileSize) ? map.width * engine.tileSize : newX;

      newY = (newY < 0) ? 0 : newY;
      newY = (newY > map.height * engine.tileSize) ? map.height * engine.tileSize : newY;

      var newBlockX = Math.floor(newX / engine.tileSize);
      var newBlockY = Math.floor(newY / engine.tileSize);

      if (!camera.collision(newX, camera.positionY)) {
        camera.positionX = newX;
      }

      if (!camera.collision(camera.positionX, newY)) {
        camera.positionY = newY;
      }
    }
  };


  rayjs.camera.collision = function(x, y) {
    var cameraBlockX = x / rayjs.engine.tileSize;
    var cameraBlockY = y / rayjs.engine.tileSize;
    var checkBlockX = 0;
    var checkBlockY = 0;

    for (var i = -0.1; i <= 0.1; i += 0.2) {
      checkBlockX = Math.floor(cameraBlockX + i);
      for (var j = -0.1; j <= 0.1; j += 0.2) {
        checkBlockY = Math.floor(cameraBlockY + j);
        if (rayjs.map.blocked(checkBlockX, checkBlockY)) {
          return true;
        }
      }
    }
    return false;
  }



  // -------------------------------------------------- //
  // RayJS Map                                          //
  // -------------------------------------------------- //

  rayjs.map = {
    width: 0,
    height: 0,
    data: null
  };


  var mazeDirs = [1, 2, 4, 8];
  var mazeOpdirs = [2, 1, 8, 4];
  var mazeDxs = [0, 0, 1, -1];
  var mazeDys = [-1, 1, 0, 0];

  var mazeWidth = 30;
  var mazeHeight = 30;

  var mazeCells = new Array(mazeWidth);

  function genMaze(x, y) {
    var index = Math.round(Math.random() * 4);

    for (var i = 0; i < 4; ++i) {
      index++;
      index %= 4;

      var nx = x + mazeDxs[index];
      var ny = y + mazeDys[index];

      if ((nx >= 0) && (nx < mazeWidth) && (ny >= 0) && (ny < mazeHeight) && mazeCells[nx][ny] == 0) {
        mazeCells[x][y] |= mazeDirs[index];
        mazeCells[nx][ny] |= mazeOpdirs[index];
        genMaze(nx, ny);
      }
    }
  }

  function printMaze01() {

    var newM = [];
    var line = [];

    for (var i = 0; i < mazeHeight; i++) {

      line = [];

      for (var j = 0; j < mazeWidth; j++) {
        if ((mazeCells[j][i] & 1) == 0) {
          line.push("1");
          line.push("1");
        } else {
          line.push("1");
          line.push("0");
          line.push("0");
        }
      }

      line.push("1");
      newM.push(line);

      line = [];

      for (var j = 0; j < mazeWidth; j++) {

        if ((mazeCells[j][i] & 8) == 0) {
          line.push("1");
          line.push("0");
          line.push("0");
        } else {
          line.push("0");
          line.push("0");
          line.push("0");
          line.push("0");
        }
      }

      line.push("1");
      newM.push(line);
    }

    line = [];

    for (var j = 0; j < mazeWidth; j++) {
      line.push("1");
      line.push("1");
    }

    line.push("1");
    newM.push(line);

    return newM;
  }

  function initMaze() {
    for (var i = 0; i < mazeWidth; i++) {
      mazeCells[i] = new Array(mazeHeight);
    }

    for (var i = 0; i < mazeCells.length; i++) {
      for (var j = 0; j < mazeCells[i].length; j++) {
        mazeCells[i][j] = 0;
      }
    }
  }

  rayjs.map.initialise = function() {

    initMaze();
    genMaze(0, 0);

    rayjs.map.data = printMaze01();

    var map = rayjs.map;

    if (map.data != null && map.data.length > 0 && map.data[0] != null && map.data[0].length > 0) {
      map.width = map.data[0].length;
      map.height = map.data.length;
    }
    console.log(rayjs.map.data);
  };

  rayjs.map.blocked = function(x, y) {
    var map = rayjs.map;

    if (x < 0 || x >= map.width || y < 0 || y >= map.height)
      return true;

    return (map.data[Math.floor(y)][Math.floor(x)] != 0);
  };

  rayjs.map.getBlock = function(x, y) {
    var map = rayjs.map;

    if (x < 0 || x >= map.width || y < 0 || y >= map.height)
      return 0;

    return map.data[Math.floor(y)][Math.floor(x)];

  };

  rayjs.controller = {
    upKeyCode: 38,
    downKeyCode: 40,
    rightKeyCode: 39,
    leftKeyCode: 37

  };

  rayjs.controller.initialise = function() {

    if (typeof rayjs.camera != "undefined" && rayjs.camera != null) {

      document.onkeydown = function(e) {
        e = e || window.event;

        var controller = rayjs.controller;
        var camera = rayjs.camera;

        switch (e.keyCode) {

          case controller.upKeyCode:
            camera.directionOfMovement = 1;
            break;

          case controller.downKeyCode:
            camera.directionOfMovement = -1;
            break;

          case controller.rightKeyCode:
            camera.directionOfRotation = 1;
            break;

          case controller.leftKeyCode:
            camera.directionOfRotation = -1;
            break;
        }
      };

      document.onkeyup = function(e) {

        e = e || window.event;

        var controller = rayjs.controller;
        var camera = rayjs.camera;

        switch (e.keyCode) {

          case controller.upKeyCode:
          case controller.downKeyCode:

            camera.directionOfMovement = 0;
            break;

          case controller.rightKeyCode:
          case controller.leftKeyCode:

            camera.directionOfRotation = 0;
            break;

        }
      };

    }

  };

  // -------------------------------------------------- //
  // RayJS Main Canvas                                 //
  // -------------------------------------------------- //

  rayjs.mainCanvas = {
    width: 0,
    height: 0,
    context: null

  };

  rayjs.mainCanvas.initialise = function() {

    var engine = rayjs.engine;
    var map = rayjs.map;

    var mainCanvas = rayjs.mainCanvas;
    var mainCanvasElement = $("#mainCanvas");

    mainCanvas.width = 400;
    mainCanvas.height = 400;

    mainCanvasElement[0].width = mainCanvas.width;
    mainCanvasElement[0].height = mainCanvas.height;

    mainCanvasElement.width(mainCanvas.width);
    mainCanvasElement.height(mainCanvas.height);

    mainCanvas.context = mainCanvasElement[0].getContext("2d");

  };

  rayjs.mainCanvas.prepare = function() {

    var engine = rayjs.engine;
    var camera = rayjs.camera;
    var map = rayjs.map;

    var mainCanvas = rayjs.mainCanvas;
    var context = mainCanvas.context;

    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    //  context.fillStyle = "rgba(100,32,32,1.0)";
    //  context.fillRect(0, 0, mainCanvas.width, Math.floor(mainCanvas.height/2));

    mainCanvas.drawSky();

    context.fillStyle = "rgba(63,63,63,1.0)";
    context.fillRect(0, Math.floor(mainCanvas.height / 2), mainCanvas.width, Math.floor(mainCanvas.height / 2));


  };

  rayjs.mainCanvas.drawSlice = function(x, y, w, h, color) {

    var mainCanvas = rayjs.mainCanvas;
    var context = mainCanvas.context;

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 0.5;
    context.moveTo(x, y);
    context.lineTo(x + w, y + h);
    context.closePath();
    context.stroke();

  };

  rayjs.mainCanvas.drawTexturedSlice = function(x, y, w, h, tx, ty) {
    var mainCanvas = rayjs.mainCanvas;
    var context = mainCanvas.context;

    // draw texture
    context.drawImage(textureWalls, tx, ty, 1, rayjs.engine.tileSize, x, y, w, h);

    // draw color
    // context.fillStyle = "rgba(100,0,255," + (Math.random() * 255) + ")"; // < ---- interesting
    // context.fillStyle = "rgba(100,0,255,250)";
    // context.fillRect(x, y, w, h);
  };

  rayjs.mainCanvas.drawSky = function() {
    var mainCanvas = rayjs.mainCanvas;
    var context = mainCanvas.context;

    var width = skyImage.width * (mainCanvas.height / skyImage.height) * 2;
    var left = (rayjs.camera.rotation % 360) / 360 * -width;

    context.save();
    context.drawImage(skyImage, left, 0, width, mainCanvas.height);

    if (left < width - mainCanvas.width) {
      context.drawImage(skyImage, left + width, 0, width, mainCanvas.height);
    }

    var ambient = 100;

    if (ambient > 0) {
      context.fillStyle = '#ffffff';
      context.globalAlpha = ambient * 0.1;
      context.fillRect(0, mainCanvas.height * 0.5, mainCanvas.width, mainCanvas.height * 0.5);
    }

    context.restore();
  };

  var textureWalls = new Image();
  textureWalls.src = "img/walls.png";
  var skyImage = new Image();
  skyImage.src = "img/sky1.jpg";

  rayjs.engine.initialise();
};

Template.walkerScreen.events({
  'touchstart .icon-up-nav': function(evt) {
    evt.preventDefault();
    rayjs.camera.directionOfMovement = 1;
  },
  'touchstart .icon-down-nav': function(evt) {
    evt.preventDefault();
    rayjs.camera.directionOfMovement = -1;
  },
  'touchstart .icon-left-nav': function(evt) {
    evt.preventDefault();
    rayjs.camera.directionOfRotation = -1;
  },
  'touchstart .icon-right-nav': function(evt) {
    evt.preventDefault();
    rayjs.camera.directionOfRotation = 1;
  },
  'touchend': function(evt) {
    evt.preventDefault();
    rayjs.camera.directionOfMovement = 0;
    rayjs.camera.directionOfRotation = 0;
  }
});
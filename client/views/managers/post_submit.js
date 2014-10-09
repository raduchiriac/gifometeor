// once the postSubmit template is rendered (hidden),
// ask the user for access to the webcam

var cameraStream;
Template.postSubmit.rendered = function() {

  var streaming = false, //	used to watch for camera activation
    video = document.querySelector('#video'),
    canvas = document.querySelector('#canvas'),
    ctx = canvas.getContext('2d'),
    width = 200,
    height = 200;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#F6F4F0";
  ctx.font = "100px Arial";
  ctx.fillText("?", 50, 100);

  window.scrollTo(0, document.body.scrollHeight);

  navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

  // create ObjectURL from stream and play
  navigator.getMedia({
      video: true,
      audio: false
    },
    function(stream) {
      cameraStream = stream;
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
      }
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );



  //	once camera is active, arrange the chat window
  video.addEventListener('canplay', function(ev) {
    if (!streaming) {
      document.querySelector('#canvas').style.display = "none";
      document.querySelector('#video').style.display = "inline";
      video.width = width;
      video.height = height;
      streaming = true;
    }
  }, false);
};


//form submit handler to take pic & save text
Template.postSubmit.events({
  'submit form': function(e) {
    e.preventDefault();

    var createdgif;
    var video = document.querySelector('#video');
    var snap = document.querySelector('#canvas').getContext('2d').drawImage(video, 0, 0, 160, 120);
    gifshot.createGIF({
      cameraStream: cameraStream,
      keepCameraOn: true,
      text: '#MeteorDay'
    }, function(obj) {
      if (!obj.error) {
        var image = obj.image;
        //  animatedImage = document.createElement('img');
        // animatedImage.src = image;
        // document.body.appendChild(animatedImage);
        createdgif = image;

        var post = {
          room: location.pathname.substring(1, 10),
          message: $(e.target).find('[name=message]').val(),
          //photo: canvas.toDataURL('image/png'),
          photo: createdgif,
          submitted: new Date()
        };

        document.getElementById('chats-end').scrollIntoView();

        document.querySelector('#chatform').reset();

        Meteor.call('post', post, function(error, id) {
          if (error)
            return alert(error.reason);
        });

      }
    });

  }
});
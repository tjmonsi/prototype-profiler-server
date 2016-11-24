var admin = require("firebase-admin");
var Vision = require('@google-cloud/vision');

// Instantiate a vision client
var vision = Vision();

admin.initializeApp({
  credential: admin.credential.cert("config/firebase.json"),
  databaseURL: "https://prototype-profiler.firebaseio.com",
  storageBucket: "prototype-profiler.appspot.com",
  databaseAuthVariableOverride: {
    uid: "my-service-worker"
  }
});

var db = admin.database();
var ref = db.ref("/images");
ref.on("child_added", function(snapshot) {
  var obj = snapshot.val();
  var inputFile = obj.url;
  var uid = obj.uid;
  var email = obj.email;
  var key = snapshot.key;

  console.log(obj)
  
  vision.detectFaces(inputFile, function (err, faces) {
    if (err) {
      console.log(err)
    }
    
    console.log(faces);
    for (var i in faces) {
      db.ref('/processed_images/' + key + '/faces/' + i).set(faces[i]);
    }
  });

  

  setTimeout(function() {
    db.ref('/processed_images/' + key + '/data').set({
      uid: uid,
      email: email,
      dateTaken: admin.database.ServerValue.TIMESTAMP
    });
    admin.database().ref("/images/"+key).remove();
  }, 5000)
});
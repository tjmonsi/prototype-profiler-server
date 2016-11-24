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
    for (var i in faces) {
      db.ref('/processed_images/' + key + '/faces/' + i).set(faces[i]);
    }
  });
  
  vision.detectLabels(inputFile, { verbose: true }, function (err, labels) {
    if (err) {
      console.log(err)
    }

    for (var i in labels) {
      db.ref('/processed_images/' + key + '/labels/' + i).set(labels[i]);
    }
  });

  
  vision.detectText(inputFile, { verbose: true }, function(err, text) {
    if (err) {
      console.log(err)
    }
    console.log(text)
    for (var i in text) {
      db.ref('/processed_images/' + key + '/text/' + i).set(text[i]);
    }
  })

  
  

  setTimeout(function() {
    db.ref('/processed_images/' + key + '/data').set({
      uid: uid,
      email: email,
      dateTaken: admin.database.ServerValue.TIMESTAMP
    });
    admin.database().ref("/images/"+key).remove();
  }, 5000)
});
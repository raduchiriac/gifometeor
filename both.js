Posts = new Meteor.Collection("posts");
Mimes = new Mongo.Collection("mimes");
Personas = new Mongo.Collection("personas");

Meteor.publish("mimes", function() {
  return Mimes.find(); // everything
});
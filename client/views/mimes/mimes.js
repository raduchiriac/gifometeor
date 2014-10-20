Meteor.subscribe("mimes");

Template.mimes.helpers({
  mimes: function() {
    return Mimes.find();
  }
});
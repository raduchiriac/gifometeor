Meteor.startup(function() {
  if (!Mimes.find().count()) {
    Mimes.insert({
      name: "Rob",
      image: "",
      description: "Love 2"
    });
    Mimes.insert({
      name: "Maria",
      image: "",
      description: "Comm 1"
    });
    Mimes.insert({
      name: "Phil",
      image: "",
      description: "Idea 12"
    });
  }
});
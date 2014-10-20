Meteor.publish('posts', function(currentroom) {
    return Posts.find({
        room: currentroom
    });
});

Meteor.publish("mimes", function() {
    return Mimes.find();
});
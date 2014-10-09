Meteor.publish('posts', function(currentroom){
	return Posts.find({room: currentroom});
});
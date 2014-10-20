Template.anyVine.helpers({
  vine: function() {
    return Session.get('anyVineObject');
  }
});

Template.anyVine.rendered = function() {
  Meteor.call('getAnyVine', '1134095340316880896', function(err, res) {
    var anyVineObject = JSON.parse(res.content).data.records;
    Session.set('anyVineObject', anyVineObject[0])
  })
};
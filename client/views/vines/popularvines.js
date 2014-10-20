Template.popularVines.helpers({
  vines: function() {
    return Session.get('popularVinesArray');
  }
});

Template.popularVines.rendered = function() {
  Meteor.call('getPopularVines', function(err, res) {
    var vinesArray = res.data.records;
    Session.set('popularVinesArray', vinesArray)
  })
};
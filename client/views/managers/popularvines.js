Template.popularvines.helpers({
  vines: function() {
    return Session.get('vinesArray');
  }
});


Meteor.call('getPopularVines', function(err, res) {
  var vinesArray = JSON.parse(res.content).data.records;
  Session.set('vinesArray', vinesArray)
})
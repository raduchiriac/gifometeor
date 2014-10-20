var JSONbig = Meteor.npmRequire('json-bigint');

Meteor.methods({
  getPopularVines: function() {
    this.unblock();
    try {
      var vines = Async.runSync(function(done) {
        HTTP.call("GET", "https://api.vineapp.com/timelines/popular", function(err, data) {
          done(null, data);
        });
      });
      return JSONbig.parse(vines.result.content);
    } catch (e) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range.
      return e.message;
    }
  },
  getAnyVine: function(postId) {
    this.unblock();
    try {
      return HTTP.call("GET", "https://api.vineapp.com/timelines/posts/" + postId);
    } catch (e) {
      return e.message;
    }
  }
});
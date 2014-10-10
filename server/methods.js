Meteor.methods({
  getPopularVines: function() {
    this.unblock();
    try {
      return HTTP.call("GET", "https://api.vineapp.com/timelines/popular");
    } catch (e) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range.
      return e.message;
    }
  }
});
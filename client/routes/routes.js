Iron.utils.debug = true;

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: '404'
});

Router.map(function() {
  this.route('mimes', {
    path: '/'
  });
  this.route('anyVine', {
    // get parameter via this.params
    path: '/vine/:_id',
    data: function() {
      return {
        postId: this.params._id
      };
    }
  });
  this.route('persona', {
    path: '/persona/:_id'
  });
});
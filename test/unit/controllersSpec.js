'use strict';

/* jasmine specs for controllers go here */

describe('share test', function(){
  beforeEach(module('share'));
  it('should ....', inject(function(share, $rootScope) {
    console.log('test');
    // var curatedStreams = share.curatedStreamResource.get(function(){
    //   console.log(curatedStreams);
    // });
    // var channels = share.getChannels.query({'apikey':'apikey'},function(){},function(response){
    //     if(response.status==401){
    //         window.location='login.html';
    //     }
    //     // console.log(response);
    // });
    var channels = new share.getChannels();
    channels.$save();
    console.log(channels);
  }));
  describe('resource test', function(){
    beforeEach(module('ngResource'));
    it('should ....', inject(function($resource) {
      $resource('http://localhost:9090/channels?apikey=apikey').get(function(){
        console.log('res');
      });
    }));
    
  })
});

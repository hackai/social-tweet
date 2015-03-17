'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

  beforeEach(function() {
    browser().navigateTo('zootrock_app/index.html#apikey=apikey');
  });
  it('should show modal', function(){
    element('.signup').click();
    sleep(0.5);
    expect(element('#complete-signup-modal').prop('class')).toContain('in');
  });
  describe('curated stream', function(){
    beforeEach(function(){
      expect(element('.curated-stream-list').count()).toEqual(0);
      element('.channel-select option:eq(2)').click();
    })
    it('should refresh curated streams', function(){
      // sleep(2);
      // sleep(2);
      expect(element('.curated-stream-item').count()).toBeGreaterThan(0);
    })
    it('should trigger actions after selected the curated stream', function(){
      element('.curated-stream-item input:eq(2)').click();
    })
  })

});

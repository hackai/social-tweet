angular.module('App.controllers', ['App']).controller('IndexCtrl', [
  '$scope',
  '$rootScope',
  '$resource',
  '$cookies',
  '$location',
  '$window',
  'share',
  'config',
  function ($scope, $rootScope, $resource, $cookies, $location, $window, share, config) {
    // If the hash can get a apikey, put the apikey to cookie.
    $scope.config = config;
    var apikey = getParameterByName('apikey', $window.location.search) || getCookie('apikey');
    if (apikey == null || apikey == '')
      $('#login-modal').modal('show');
    if (apikey != null && apikey.length > 2) {
      setCookie('apikey', apikey, 30);
      $scope.apikey = getCookie('apikey');
      $scope.user = share.getUser.get({ 'apikey': $scope.apikey }, function () {
        $rootScope.user = $scope.user;
        window.Intercom('boot', {
          app_id: '23fe6d3ff4097040b2f797abe2279364c12b65e9',
          email: $scope.user.email,
          user_id: $scope.user.id,
          user_hash: $scope.user.interComHash
        });
        console.log($scope.user);
      }, function (response) {
        if (response.status == 401) {
          $('#login-modal').modal('show');
        }
      });
    }
    //delete all space.
    $scope.trimStr = function (str) {
      str = str.replace(/\s+/g, '');
      return str;
    };
  }
]).controller('Header', [
  '$scope',
  '$rootScope',
  'share',
  function ($scope, $rootScope, share) {
    $scope.apikey = getCookie('apikey');
    $('.signup').click(function () {
      $('#complete-signup-modal').modal('show');
    });
    $scope.$on('updateUser', function (event, args) {
      $scope.user = args.user;
      window.Intercom('update', {
          app_id: '23fe6d3ff4097040b2f797abe2279364c12b65e9',
          email: $scope.user.email,
          user_id: $scope.user.id,
          user_hash: $scope.user.interComHash
        });
    });
    $scope.signout = function () {
      share.Signout.get({ apikey: $scope.apikey }, function () {
        window.location = '/';
      });
    };
  }
]).controller('baseChannelCtrl', [
  '$scope',
  '$rootScope',
  'share',
  'config',
  function ($scope, $rootScope, share, configs) {
    $scope.configs = configs;
    var apikey = getCookie('apikey');
    $scope.baseChannels = share.Channels.query({ 'apikey': apikey }, function (response) {
      _t.push({ start: 'Settings Tutorial' });
      $scope.initChannelList();
    });
    $scope.showSettingsTutorial = function(){
      _t.push({ start: 'Settings Tutorial', config:{force: true}});
    };
    $scope.$on('addChannel', function (event, args) {
      var params = {};
      params.apikey = apikey;
      params.type = args.type;
      if(params.type == 'facebookpage'){
        params.accessToken = args.accessToken;
        params.pageId = args.pageId;
        params.pageName = args.pageName;
      }
      var newChannel = share.Channels.save(params, function () {
          $scope.baseChannels.push(newChannel);
          $scope.baseChannelId = newChannel.id;
          $rootScope.$broadcast('channelChanged', {
            baseChannelId: newChannel.id,
            baseChannel: newChannel
          });
          if (args.callback)
            args.callback(newChannel);
        });
    });
    $scope.$on('channelChanged', function (event, args) {
      $scope.activated = args.baseChannel.active;
      $scope.updateActivated = false;
      $scope.activateErrors = [];
    });
    $scope.channelChanged = function () {
      for (var i = 0; i < $scope.baseChannels.length; i++) {
        if ($scope.baseChannels[i].id == $scope.baseChannelId) {
          $scope.baseChannel = $scope.baseChannels[i];
          break;
        }
      }
      $rootScope.$broadcast('channelChanged', {
        baseChannelId: $scope.baseChannel.id,
        baseChannel: $scope.baseChannel
      });
    };
    $rootScope.updateActivate = function () {
      $scope.activateErrors = [];
      if ($rootScope.channel == null)
        $scope.activateErrors.push({ error: 'No Channel Selected' });
      if ($rootScope.user == null)
        $scope.activateErrors.push({ error: 'No User Selected' });
      if ($rootScope.allStreams == null)
        $scope.activateErrors.push({ error: 'No Streams Selected' });
      // if ($rootScope.channel.active == false || $rootScope.channel.active == null) {
      if ($rootScope.user.timezone == null)
        $scope.activateErrors.push({ error: 'No timezone selected' });
      if ($rootScope.channel.maxPostsPerDay == null || !($rootScope.channel.maxPostsPerDay > 0 && $rootScope.channel.maxPostsPerDay <= 100)) {
        $scope.activateErrors.push({ error: 'Invalid Max Posts Per Day' });
      }
      if ($rootScope.channel.startTime == null || (parseInt($rootScope.channel.startTime.split(':')[0], 10) < 0 || parseInt($rootScope.channel.startTime.split(':')[0], 10) > 24) || (parseInt($rootScope.channel.startTime.split(':')[1], 10) < 0 || parseInt($rootScope.channel.startTime.split(':')[1], 10) > 60) || (parseInt($rootScope.channel.endTime.split(':')[0], 10) < 0 || parseInt($rootScope.channel.endTime.split(':')[0], 10) > 24) || (parseInt($rootScope.channel.endTime.split(':')[1], 10) < 0 || parseInt($rootScope.channel.endTime.split(':')[1], 10) > 60))
        $scope.activateErrors.push({ error: 'Invalid Channel Post Time' });
      var totalStreamPercent = 0;
      _.each($rootScope.allStreams, function (stream) {
        if (stream.type == 'recurring' || stream.percentOfPosts == null)
          return;
        totalStreamPercent += parseInt(stream.percentOfPosts, 10);
      });
      if (parseInt(totalStreamPercent, 10) != 100)
        $scope.activateErrors.push({ error: 'The Sum of the Stream Percentage should equal to 100%' });
      // }
      if ($scope.activateErrors.length != 0)
        return;
      share.ActivateChannel.update({
        id: $rootScope.channel.id,
        action: 'activate',
        apikey: apikey
      }, function (response) {
        if (response.success == true) {
          $scope.updateActivated = true;
          $scope.activated = true;
        } else {
          $scope.activated = false;
          console.log(response.error);
          if (response.error && response.error.requiredPlan) {
            $scope.currentSettings = response.error.currentSettings;
            $scope.requiredPlan = response.error.requiredPlan;
            $('#select-plan-modal').modal('show');
          }
        }
        $rootScope.channel.active = $scope.activated;
      });
    };
    $scope.showPayPage = function () {
      $('#select-plan-modal').modal('hide');
      $('#plan-subscription-modal').off('shown.bs.modal');
      if ($scope.requiredPlan && $scope.requiredPlan.name == 'custom') {
        $('#custom-plan-ticket-modal').modal('show');
        share.Tickets.save({apikey:apikey, type:'custom-plan'});
      } else {
        $('#plan-subscription-modal').on('shown.bs.modal', function () {
          $(this).find('iframe').attr('src', $scope.configs.restUrl + 'plan/subscribe/' + $scope.requiredPlan.id + '?apikey=' + apikey);
        });
        $('#plan-subscription-modal').modal('show');
      }
    };
    $scope.addChannel = function () {
      $('#select-plan-modal').modal('hide');
      $('#add-channel-modal').modal('show');
    };
    $scope.getBaseChannel = function (item) {
      return item;
    };
    $scope.initChannelList = function () {
      if ($scope.baseChannels != null && $scope.baseChannels.length != 0) {
        var baseChannel;
        if (getCookie('authChannel') == 'true') {
          baseChannel = $scope.baseChannels[$scope.baseChannels.length - 1];
          console.log(baseChannel);
        } else
          baseChannel = $scope.baseChannels[0];
        _.each($scope.baseChannels, function (channel) {
          if (channel.id != null && channel.id == getCookie('authChannel'))
            baseChannel = channel;
        });
        $scope.baseChannelId = baseChannel.id;
        $rootScope.$broadcast('channelChanged', {
          baseChannelId: baseChannel.id,
          baseChannel: baseChannel
        });  // $('#left-pane-tab a[href="#settings"]').tab('show');
      }
      setCookie('authChannel', null);
    };
    $scope.$on('deactivateChannel', function (event, args) {
      if ($scope.activated)
        share.ActivateChannel.update({
          id: $rootScope.channel.id,
          action: 'deactivate',
          apikey: apikey
        }, function (response) {
          $scope.activated = false;
          $rootScope.channel.active = false;
        });
    });
    $scope.getChannelType = function(){
      if(this.baseChannel.type == 'rss')
        return 'RSS';
      if(this.baseChannel.type == 'twitter')
        return 'Twitter';
      if(this.baseChannel.type == 'facebook')
        return 'Facebook';
      if(this.baseChannel.type == 'facebookpage')
        return 'Facebook Page';
    };
    var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == 'attachEvent' ? 'onmessage' : 'message';
    // Listen to message from child IFrame window
    eventer(messageEvent, function (e) {
      if (e.data == 'success') {
        $('#plan-subscription-modal').modal('hide');
        $scope.updateActivate();
      }  // console.log(e); // Do whatever you want to do with the data got from IFrame in Parent form.
    }, false);  // $(this).find('iframe').attr('src', configs.restUrl+'plan/subscribe/2?apikey='+apikey);
  }
]).controller('User', [
  '$scope',
  '$rootScope',
  'share',
  function ($scope, $rootScope, share) {
    var apikey = getCookie('apikey');
    $scope.user = share.getUser.get({ 'apikey': apikey }, function (response) {
      console.log(response);
      if (response.status == 401) {
        window.location = '/';
      }
      $rootScope.user = $scope.user;
      if ($scope.user.email == null || $scope.user.timezone == null)
        $('#complete-signup-modal').modal('show');  // if(scope.user.email == null){
                                                    // }
    });
    $scope.updateUser = function () {
      $scope.form.tried = true;
      if ($scope.form.$invalid)
        return;
      $scope.user.$update({ apikey: apikey }, function () {
        $rootScope.$broadcast('updateUser', { user: $scope.user });
        $rootScope.user = $scope.user;
      });
    };
    $scope.updateTimezone = function () {
      console.log($scope.user.timezone);  // $scope.user.timezone = $scope.timezone;
    };
  }
]).controller('Signup', [
  '$scope',
  '$rootScope',
  'share',
  '$location',
  function ($scope, $rootScope, share, $location) {
    var apikey = getCookie('apikey');
    $scope.updateUser = function () {
      $scope.form.tried = true;
      if ($scope.form.$invalid)
        return;
      $scope.user.$update({ apikey: apikey }, function () {
        $rootScope.$broadcast('updateUser', { user: $scope.user });
        $rootScope.user = $scope.user;
        $('#complete-signup-modal').modal('hide');
      });
      if ($scope.followTwitter == true) {
        share.FollowTwitter.save({
          token: getParameterByName('token', $location.hash()),
          tokenSecret: getParameterByName('tokenSecret', $location.hash())
        });
      }
    };
  }
]).controller('ChannelPreference', [
  '$scope',
  '$rootScope',
  'share',
  '$timeout',
  function ($scope, $rootScope, share, $timeout) {
    var apikey = getCookie('apikey');
    $scope.restUrl = share.RestApiUrl;
    $scope.$on('channelChanged', function (event, args) {
      $scope.channel = args.baseChannel;
      $rootScope.channel = $scope.channel;
      $scope.formatTime();
    });
    $scope.$on('updateChannel', function (event, args){
      $scope.channel = args.baseChannel;
      $rootScope.channel = $scope.channel;
    });
    $scope.updateChannel = function (callback) {
      if ($scope.form.$invalid)
        return;
      if ($scope.endTimeHour * 60 + $scope.endTimeMin - ($scope.startTimeHour * 60 + $scope.startTimeMin) < 60) {
        $scope.form.invalidTime = true;
        return;
      } else
        $scope.form.invalidTime = false;
      $scope.formatTime(true);
      $scope.channel.$update({ apikey: apikey }, callback);
      $rootScope.channel = $scope.channel;
    };
    function padDigits(number, digits) {
      return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }
    $scope.updateTime = function () {
      // if ($scope.startTimeHour == '' || $scope.startTimeMin == '' || $scope.endTimeHour == '' || $scope.endTimeMin == '' || (parseInt($scope.startTimeHour, 10) < 0 || parseInt($scope.startTimeHour, 10) > 24) || (parseInt($scope.startTimeMin, 10) < 0 || parseInt($scope.startTimeMin, 10) > 60) || (parseInt($scope.endTimeHour, 10) < 0 || parseInt($scope.endTimeHour, 10) > 24) || (parseInt($scope.endTimeMin, 10) < 0 || parseInt($scope.endTimeMin, 10) > 60))
      //   return alert('Invalid Channel Post Time');
      // $scope.channel.startTime = ($scope.startTimeHour == null ? '00' : $scope.startTimeHour) + ':' + ($scope.startTimeMin == null ? '00' : $scope.startTimeMin);
      // $scope.channel.endTime = $scope.endTimeHour + ':' + $scope.endTimeMin;
      $scope.updateChannel();
    };
    $scope.authorize = function () {
      setCookie('authChannel', $scope.channel.id, 1);
      if($scope.channel.type == 'facebookpage'){
        setCookie('authFacebookPageChannel', $scope.channel.id, 1);
        window.location = share.RestApiUrl + 'auth/' + $scope.channel.type + '/signin?apikey=' + apikey;
        return;
      }
      window.location = share.RestApiUrl + 'auth/' + $scope.channel.type + '/' + $scope.channel.id + '/signin?apikey=' + apikey;
    };
    $scope.updateMaxPostsPerDay = function () {
      $scope.channel.maxPostsPerDay = $scope.maxPostsPerDay;
    };
    $scope.formatTime = function (reverse) {
      if (reverse == true) {
        $scope.channel.startTime = padDigits($scope.startTimeHour, 2) + ':' + padDigits($scope.startTimeMin, 2);
        $scope.channel.endTime = padDigits($scope.endTimeHour, 2) + ':' + padDigits($scope.endTimeMin, 2);
        return;
      }
      if ($scope.channel.startTime) {
        $scope.startTimeHour = $scope.channel.startTime.split(':')[0];
        $scope.startTimeMin = $scope.channel.startTime.split(':')[1];
      }
      if ($scope.channel.endTime) {
        $scope.endTimeHour = $scope.channel.endTime.split(':')[0];
        $scope.endTimeMin = $scope.channel.endTime.split(':')[1];
      }
    };
    $scope.deactivate = function () {
      if ($scope.channel.active == false)
        return $rootScope.$broadcast('deactivateChannel', {
          id: $scope.channel.id,
          action: 'deactivate'
        });
      if ($scope.channel.active == true)
        $scope.channel.active = false;
    };
  }
]).controller('NewChannel', [
  '$scope',
  '$rootScope',
  'share',
  '$window',
  '$location',
  function ($scope, $rootScope, share, $window, $location) {
    var apikey = getCookie('apikey');
    var actionAfterCreateNewChannel = function () {
      $('#left-pane-tab a[href="#curated"]').tab('show');
      $('#add-channel-modal button.close').click();
    };
    $scope.createTwitterChannel = function () {
      var url = share.RestApiUrl + 'auth/twitter/signin?apikey=' + apikey;
      if ($scope.followTwitter == true)
        url += '&follow=true';
      //use for select the last channel when direct back
      setCookie('authChannel', true, 1);
      window.location = url;
      actionAfterCreateNewChannel();
    };
    $scope.createFacebookProfileChannel = function () {
      var url = share.RestApiUrl + 'auth/facebook/signin?apikey=' + apikey;
      //use for select the last channel when direct back
      setCookie('authChannel', true, 1);
      window.location = url;
      actionAfterCreateNewChannel();
    };
    $scope.createRssChannel = function () {
      $rootScope.$broadcast('addChannel', { type: 'rss' });
      actionAfterCreateNewChannel();
    };
    $scope.createFacebookPageChannel = function (){
      setCookie('authFacebookPageChannel', 'new', 1);
      var url = share.RestApiUrl + 'auth/facebookpage/signin?apikey=' + apikey;
      window.location = url;
    };
    $scope.addFacebookPageChannel = function(){
      $('#add-facebook-page-channel-modal').modal('hide');
      //check if it is an update
      if($scope.authFacebookPageChannel && $scope.authFacebookPageChannel != 'null' && $scope.authFacebookPageChannel != 'new'){
        console.log(getCookie('authFacebookPageChannel'), $rootScope);
        // $rootScope.$broadcast('updateChannel', {
        //   id: getCookie('authFacebookPageChannel'), 
        //   type: 'facebookpage',
        //   accessToken: this.facebookPage.accessToken,
        //   pageId: this.facebookPage.pageId,
        //   pageName: this.facebookPage.pageName
        // });
        if($rootScope.channel.type == 'facebookpage' && $rootScope.channel.id == $scope.authFacebookPageChannel){
          $rootScope.channel.accessToken = this.facebookPage.accessToken;
          $rootScope.channel.pageId = this.facebookPage.pageId;
          $rootScope.channel.pageName = this.facebookPage.pageName;
          $rootScope.channel.$update({apikey:apikey});
        }
        return;
      }
       
      $rootScope.$broadcast('addChannel', { 
        type: 'facebookpage',
        accessToken: this.facebookPage.accessToken,
        pageId: this.facebookPage.pageId,
        pageName: this.facebookPage.pageName
      });
    };
    $scope.authFacebookPageChannel = getCookie('authFacebookPageChannel');
    setCookie('authFacebookPageChannel', null);
    var facebookPagesJsonString = getParameterByName('pages', $window.location.search);
    if(facebookPagesJsonString && $scope.authFacebookPageChannel && $scope.authFacebookPageChannel != 'null'){
      $scope.facebookPages = JSON.parse(facebookPagesJsonString);
      $('#add-facebook-page-channel-modal').modal('show');
    }
  }
]).controller('CuratedStream', [
  '$scope',
  '$rootScope',
  'share',
  '$location',
  function ($scope, $rootScope, share, $location) {
    $scope.$on('channelChanged', function (event, args) {
      var apikey = getCookie('apikey');
      $scope.baseChannelId = args.baseChannelId;
      $scope.curatedStreams = share.curated.get({
        baseChannelId: $scope.baseChannelId,
        apikey: apikey
      });
    });
    $scope.changeSubscription = function () {
      $rootScope.$broadcast('streamSubscriptionChanged', {
        baseChannelId: $scope.baseChannelId,
        stream: this.item,
        action: this.item.ownedByChannel == true ? 'add' : 'remove'
      });
      $scope.countSelectedInGroup($scope.value);
    };
    $scope.countSelectedInGroup = function (streams) {
      var count = 0;
      if (streams == null)
        return;
      for (var i = 0; i < streams.length; i++) {
        if (streams[i].ownedByChannel == true)
          count++;
      }
      return count;
    };
  }
]).controller('SelectedStreams', [
  '$scope',
  '$rootScope',
  'share',
  '$location',
  function ($scope, $rootScope, share, $location) {
    var apikey = getCookie('apikey');
    $scope.$on('channelChanged', function (event, args) {
      $scope.baseChannelId = args.baseChannelId;
      $scope.allStreams = share.Streams.query({
        baseChannelId: $scope.baseChannelId,
        apikey: apikey
      }, function () {
        $rootScope.allStreams = $scope.allStreams;
        $rootScope.$broadcast('loadedStreams', {});
      });
    });
    $scope.$on('streamSubscriptionChanged', function (events, args) {
      if (args.stream == null)
        return;
      if (args.action == 'add') {
        var totalPercent = _.reduce($scope.allStreams, function (memo, stream) {
            if (stream.percentOfPosts == null)
              stream.percentOfPosts = 0;
            return memo + stream.percentOfPosts;
          }, 0);
        args.stream.percentOfPosts = totalPercent >= 100 ? 0 : 100 - totalPercent;
        var stream = share.Streams.save({
            apikey: apikey,
            type: args.stream.type || 'curated',
            id: args.stream.id,
            baseChannelId: $scope.baseChannelId
          }, args.stream, function () {
            $scope.allStreams.push(stream);
            $rootScope.allStreams = $scope.allStreams;
            $scope.updatePreview();
            if (args.callback)
              args.callback(stream);
            setTimeout(function () {
              $('#stream-perc-' + stream.id).focus();
            }, 500);
          });
      }
      if (args.action == 'remove') {
        var deleteIdx;
        for (var i = 0; i < $scope.allStreams.length; i++) {
          var streamToDelete = $scope.allStreams[i];
          if (streamToDelete.CuratedStreamId != null && streamToDelete.CuratedStreamId == args.stream.id) {
            deleteIdx = i;
            streamToDelete.$delete({
              type: 'curated',
              apikey: apikey
            }, function () {
              $scope.updatePreview();
              if (args.callback)
                args.callback();
            });
            $scope.allStreams.splice(deleteIdx, 1);
          }
          if (streamToDelete.id != null && streamToDelete.id == args.stream.id) {
            deleteIdx = i;
            streamToDelete.$delete({ apikey: apikey }, function () {
              $scope.updatePreview();
              if (args.callback)
                args.callback();
            });
            $scope.allStreams.splice(deleteIdx, 1);
          }
          $rootScope.allStreams = $scope.allStreams;
        }
      }
    });
    $scope.changeStreamConfig = function (stream) {
      console.log(stream);
      stream.apikey = apikey;
      share.Streams.update(stream, function () {
        $scope.updatePreview();
      });
    };
    $scope.updatePreview = function () {
      console.log('update preview');
      $rootScope.$broadcast('updateStreams');
    };
    $scope.toggleEye = function () {
      console.log($rootScope.allStreams);
      console.log(this);
      $rootScope.$broadcast('toggleEye', { streams: $scope.allStreams });
    };
  }
]).controller('PostPreview', [
  '$scope',
  '$rootScope',
  'share',
  '$location',
  '$timeout',
  function ($scope, $rootScope, share, $location, $timeout) {
    var apikey = getCookie('apikey');
    $scope.$on('channelChanged', function (event, args) {
      $scope.baseChannelId = args.baseChannelId;
      $scope.updatePreview();
    });
    $scope.updatePreview = function () {
      $('#sample-refresh').addClass('fa-spin');
      $scope.previewPosts = share.PreviewPosts.query({
        id: $scope.baseChannelId,
        apikey: apikey
      }, function () {
        $('#sample-refresh').removeClass('fa-spin');
      });
    };
    $scope.$on('updateStreams', function (event, args) {
    });
    $scope.isFiltered = function () {
      for (var key in $rootScope.allStreams) {
        if ($rootScope.allStreams[key].id == this.item.stream.details.id && $rootScope.allStreams[key].eye == false)
          return true;
      }
      return false;
    };
    $scope.isImgUrl = function () {
      if (this.item.imageURL == null)
        return false;
      if (this.item.imageURL.indexOf('.jpg') != -1 || this.item.imageURL.indexOf('.png') != -1 || this.item.imageURL.indexOf('.gif') != -1)
        return true;
    };
  }
]).controller('RecurringStream', [
  '$scope',
  '$rootScope',
  'share',
  '$location',
  function ($scope, $rootScope, share, $location) {
    var apikey = getCookie('apikey');
    $scope.$on('channelChanged', function (event, args) {
      $scope.baseChannel = args.baseChannel;
    });
    $scope.$on('loadedStreams', function (event, args) {
      var recurringStreams = _.filter($rootScope.allStreams, function (stream) {
          if (stream.type == 'recurring')
            return true;
        });
      if (recurringStreams == null || recurringStreams.length == 0)
        $scope.recurringStream = share.Streams.save({
          apikey: apikey,
          baseChannelId: $scope.baseChannel.id,
          type: 'recurring'
        }, function () {
          $rootScope.allStreams.push($scope.recurringStream);
          $scope.fetchItems();
        });
      else {
        $scope.recurringStream = recurringStreams[0];
        $scope.fetchItems();
      }
    });
    $scope.fetchItems = function () {
      $scope.recurringStreamItems = share.RecurringStreamItems.query({
        streamId: $scope.recurringStream.id,
        apikey: apikey
      });
    };
    $scope.updateRecurringStream = function () {
      $scope.recurringStream.$update({ apikey: apikey });
    };
    $scope.addRecurringStreamItem = function () {
      $scope.form.tried = true;
      if ($scope.form.$invalid)
        return;
      // if ($scope.item == null || $scope.item.text == null || $scope.item.text == '')
      //   return alert(' Enter the text for your post');
      // if ($scope.item.text.length > 139 && $scope.baseChannel.type == 'twitter')
      //   return alert('Character count must not exceed 140 characters');
      var item = share.RecurringStreamItems.save({
          text: $scope.item.text,
          active: true,
          streamId: $scope.recurringStream.id,
          apikey: apikey
        }, function () {
          $scope.item.text = '';
          $scope.recurringStreamItems.push(item);
          $scope.form.tried = false;
        });
    };
    $scope.updateRecurringStreamItem = function () {
      console.log(this.item);
      share.RecurringStreamItems.update({ apikey: apikey }, this.item);
    };
    $scope.removeRecurringStreamItem = function () {
      var itemId = this.item.id;
      share.RecurringStreamItems.delete({ apikey: apikey }, this.item, function () {
        for (var i = 0; i < $scope.recurringStreamItems.length; i++) {
          if ($scope.recurringStreamItems[i].id == itemId) {
            $scope.recurringStreamItems.splice(i, 1);
            break;
          }
        }
      });
    };
  }
]).controller('KeyphraseStreams', [
  '$scope',
  '$rootScope',
  'share',
  function ($scope, $rootScope, share) {
    var apikey = getCookie('apikey');
    $scope.$on('channelChanged', function (event, args) {
      $scope.baseChannel = args.baseChannel;
    });
    $scope.errors = [];
    $scope.$on('loadedStreams', function (event, args) {
      var keyphraseStreams = _.filter($rootScope.allStreams, function (stream) {
          if (stream.type == 'keyphrase')
            return true;
        });
      $scope.keyphraseStreams = keyphraseStreams;
    });
    $scope.addKeyphraseStream = function () {
      $scope.form.tried = true;
      if ($scope.phrase == null || $scope.phrase == '')
        return $scope.errors.push({ error: 'Must enter phrase' });
      var keyphraseStream = {
          type: 'keyphrase',
          baseChannelId: $scope.baseChannel.id,
          phrase: $scope.phrase,
          sentiment: $scope.sentiment,
          hashTagStatus: $scope.hashTagStatus,
          hashTags: $scope.hashTags
        };
      $rootScope.$broadcast('streamSubscriptionChanged', {
        action: 'add',
        stream: keyphraseStream,
        callback: function (stream) {
          $scope.phrase = null;
          $scope.errors = [];
          $scope.form.tried = false;
          $scope.keyphraseStreams.push(stream);
        }
      });  // var keyphraseStream = share.Streams.save(keyphraseStream, function(){
           //   $rootScope.allStreams.push(keyphraseStream);
           // });
    };
    $scope.updateKeyphraseStream = function () {
      share.Streams.update({ apikey: apikey }, this.keyphraseStream);
    };
    $scope.removeKeyphraseStream = function () {
      var streamId = this.keyphraseStream;
      console.log(streamId);
      $rootScope.$broadcast('streamSubscriptionChanged', {
        action: 'remove',
        stream: this.keyphraseStream,
        callback: function () {
          for (var i = 0; i < $scope.keyphraseStreams.length; i++) {
            if (streamId.id == $scope.keyphraseStreams[i].id) {
              $scope.keyphraseStreams.splice(i, 1);
              break;
            }
          }
        }
      });
    };
  }
]).controller('FilterSite', [
  '$scope',
  '$rootScope',
  'share',
  function ($scope, $rootScope, share) {
    var apikey = getCookie('apikey');
    $scope.$on('channelChanged', function (event, args) {
      $scope.baseChannel = args.baseChannel;
      $scope.filterSites = share.FilterSites.query({
        apikey: apikey,
        baseChannelId: $scope.baseChannel.id
      });
    });
    $scope.addFilterSite = function () {
      $scope.form.tried = true;
      if ($scope.form.$invalid)
        return;
      var filterSite = share.FilterSites.save({
          channelId: $scope.baseChannel.id,
          url: $scope.url,
          active: true,
          apikey: apikey
        }, function () {
          $scope.url = null;
          $scope.form.tried = false;
          $scope.filterSites.push(filterSite);
        });
    };
    $scope.updateFilterSite = function () {
      this.filterSite.$update({ apikey: apikey });
    };
    $scope.removeFilterSite = function () {
      for (key in $scope.filterSites) {
        if ($scope.filterSites[key].id == this.filterSite.id) {
          $scope.filterSites[key].$delete({ apikey: apikey }, function () {
            $scope.filterSites.splice(key, 1);
          });
          break;
        }
      }
    };
  }
]).controller('FilterTerm', [
  '$scope',
  '$rootScope',
  'share',
  function ($scope, $rootScope, share) {
    var apikey = getCookie('apikey');
    $scope.$on('channelChanged', function (event, args) {
      $scope.baseChannel = args.baseChannel;
      $scope.filterTerms = share.FilterTerms.query({
        apikey: apikey,
        baseChannelId: $scope.baseChannel.id
      });
    });
    $scope.addFilterTerm = function () {
      $scope.form.tried = true;
      if ($scope.form.$invalid)
        return;
      var filterTerm = share.FilterTerms.save({
          channelId: $scope.baseChannel.id,
          term: $scope.keyword,
          active: true,
          apikey: apikey
        }, function () {
          $scope.keyword = null;
          $scope.form.tried = false;
          $scope.filterTerms.push(filterTerm);
        });
    };
    $scope.updateFilterTerm = function () {
      this.filterTerm.$update({ apikey: apikey });
    };
    $scope.removeFilterTerm = function () {
      for (key in $scope.filterTerms) {
        if ($scope.filterTerms[key].id == this.filterTerm.id) {
          $scope.filterTerms[key].$delete({ apikey: apikey }, function () {
            $scope.filterTerms.splice(key, 1);
          });
          break;
        }
      }
    };
  }
]).controller('CustomStream', [
  '$scope',
  '$rootScope',
  'share',
  function ($scope, $rootScope, share) {
    var apikey = getCookie('apikey');
    $scope.selectedFeeds = [];
    $scope.$on('channelChanged', function (event, args) {
      $scope.baseChannel = args.baseChannel;
    });
    $scope.$on('loadedStreams', function (event, args) {
      var customStreams = _.filter($rootScope.allStreams, function (stream) {
          if (stream.type == 'custom')
            return true;
        });
      $scope.customStreams = customStreams;
    });
    $scope.showCustomStream = function () {
      $scope.customStream = this.customStream;
      if ($scope.customStream == null)
        $scope.customStream = { type: 'custom' };
      if ($scope.customStream.id)
        $scope.customStreamFeeds = share.CustomStreamFeeds.query({
          apikey: apikey,
          streamId: $scope.customStream.id
        }, function () {
          console.log($scope.customStreamFeeds);
        });
      $scope.newCustomFeed = {};
      // $scope.newCustomStreamForm.tried = false;
      $scope.newFeedForm.tried = false;
    };
    $scope.showNewCustomStream = function () {
      $scope.customStream = { type: 'custom' };
      $scope.newCustomFeed = {};
      $scope.customStreamFeeds = null;
      // $scope.newCustomStreamForm.tried = false;
      $scope.newFeedForm.tried = false;
    };
    $scope.addCustomStream = function () {
      // $scope.newCustomStreamForm.tried = true;
      if ($scope.customStream.id) return;

      $rootScope.$broadcast('streamSubscriptionChanged', {
        action: 'add',
        stream: $scope.customStream,
        callback: function (stream) {
          $scope.customStream = stream;
          $scope.customStreams.push(stream);
          $scope.customStreamFeeds = share.CustomStreamFeeds.query({
            apikey: apikey,
            streamId: $scope.customStream.id
          });
        }
      });
    };
    $scope.updateCustomStream = function () {
      this.customStream.$update({ apikey: apikey });
    };
    $scope.removeCustomStream = function () {
      var that = this;
      $rootScope.$broadcast('streamSubscriptionChanged', {
        action: 'remove',
        stream: this.customStream,
        callback: function () {
          for (var key in $scope.customStreams) {
            if ($scope.customStreams[key].id == that.customStream.id) {
              $scope.customStreams.splice(key, 1);
            }
          }
        }
      });
    };
    $scope.addCustomFeed = function () {
      $scope.newFeedForm.tried = true;
      if ($scope.newFeedForm.$invalid)
        return;
      $('#newFeedForm i.fa').addClass('fa-refresh fa-spin');
      var newCustomFeed = share.CustomStreamFeeds.save({
          apikey: apikey,
          streamId: $scope.customStream.id
        }, $scope.newCustomFeed, function (response) {
          $('#newFeedForm i.fa').removeClass('fa-refresh fa-spin');
          if (response.error)
            $scope.error = 'Invalid RSS Feed';
          else {
            $scope.error = null;
            $scope.newFeedForm.tried = false;
            $scope.newCustomFeed.rss = null;
            $scope.newCustomFeed.name = null;
            $scope.newCustomFeed.twitterHandle = null;
            $scope.customStreamFeeds.push(newCustomFeed);
          }
        });
    };
    $scope.selectCustomStreamFeed = function () {
      if (this.checked)
        $scope.selectedFeeds.push(this.customStreamFeed);
      if (!this.checked)
        for (var key in $scope.selectedFeeds) {
          if ($scope.selectedFeeds[key].id == this.customStreamFeed.id)
            $scope.selectedFeeds.splice(key, 1);
        }
    };
    $scope.removeCustomFeeds = function () {
      for (var selectedKey in $scope.selectedFeeds) {
        var selectedFeed = $scope.selectedFeeds[selectedKey];
        var selectedFeedId = $scope.selectedFeeds[selectedKey].id;
        selectedFeed.$delete({
          apikey: apikey,
          streamId: $scope.customStream.id,
          feedId: selectedFeed.id
        }, function () {
          for (var key in $scope.customStreamFeeds) {
            if ($scope.customStreamFeeds[key].id == null) {
              $scope.customStreamFeeds.splice(key, 1);
              break;
            }
          }
        });
      }
      $scope.selectedFeeds = [];
    };
  }
]).controller('Zoots', [
  '$scope',
  '$rootScope',
  'share',
  function ($scope, $rootScope, share) {
    var apikey = getCookie('apikey');
    $scope.baseChannels = share.Channels.query({ 'apikey': apikey }, function(){
      if($scope.baseChannels.length == 0)
        return;
      $scope.baseChannel = $scope.baseChannels[0];
      $scope.baseChannelId = $scope.baseChannel.id;
      $scope.channelChanged();
    });
    $scope.showZootTutorial = function(){
      _t.push({ start: 'Zoots Tutorial', config:{force: true}});
    };
    $scope.channelChanged = function () {
      for (var i = 0; i < $scope.baseChannels.length; i++) {
        if ($scope.baseChannels[i].id == $scope.baseChannelId) {
          $scope.baseChannel = $scope.baseChannels[i];
          $scope.historyItems = share.HistoryItems.query({
            apikey: apikey,
            channelId: $scope.baseChannel.id
          });
          break;
        }
      }
    };
    $scope.updateHistoryItem = function () {
      if(this.form.$invalid)
        return;
      this.historyItem.$update({apikey: apikey});
    };
    $scope.includeHistoryItem = function() {
      if(this.form.$invalid)
        return;
      this.historyItem.status = 'include';
      this.historyItem.$update({apikey: apikey});
    };
    $scope.skipHistoryItem = function() {
      if(this.form.$invalid)
        return;
      this.historyItem.status = 'skip';
      this.historyItem.$update({apikey: apikey});
    };
    $scope.pendingHistoryItem = function() {
      if(this.form.$invalid)
        return;
      this.historyItem.status = 'pending';
      this.historyItem.$update({apikey: apikey});
    };
    $scope.isImgUrl = function () {
      if (this.historyItem.imageURL == null)
        return false;
      if (this.historyItem.imageURL.indexOf('.jpg') != -1 || this.historyItem.imageURL.indexOf('.png') != -1 || this.historyItem.imageURL.indexOf('.gif') != -1)
        return true;
      return false;
    };
    $scope.getHistoryItemStatus = function(){
      if(this.historyItem.status == 'skip')
        return 'Skip';
      if(this.historyItem.status == 'pending')
        return 'Pending';
      if(this.historyItem.status == 'include')
        return 'Zoot it!';
    };
    $scope.removeImage = function(){
      this.historyItem.imageURL = null;
      this.historyItem.$update({apikey: apikey});
    };
    $scope.getChannelType = function(){
      if(this.baseChannel.type == 'rss')
        return 'RSS';
      if(this.baseChannel.type == 'twitter')
        return 'Twitter';
      if(this.baseChannel.type == 'facebook')
        return 'Facebook';
      if(this.baseChannel.type == 'facebookpage')
        return 'Facebook Page';
    };
  }
]);
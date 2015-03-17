//This share services is for crud form json.
angular.module('share', ['ngResource']).factory('share', function ($resource) {
  //var path = 'http://localhost:64561/';
  var path='http://184.172.34.106/rest/';
  return {
    RestApiUrl: path,
    Signout: $resource(path + 'signout'),
    Channels: $resource(path + 'channels/:type/:id', {
      id: '@id',
      type: '@type'
    }, { 'update': { method: 'PUT' } }),
    ActivateChannel: $resource(path + 'channels/:id/:action', {
      id: '@id',
      action: '@action'
    }, { 'update': { method: 'PUT' } }),
    curated: $resource(path + 'streams/curated/'),
    getUser: $resource(path + 'user', {}, { 'update': { method: 'PUT' } }),
    CuratedStream: $resource(path + 'streams/curated/:id', { id: '@id' }),
    Streams: $resource(path + 'streams/:type/:id', {
      id: '@id',
      type: '@type'
    }, { 'update': { method: 'PUT' } }),
    RecurringStreamItems: $resource(path + 'items/recurring/:id', { id: '@id' }, { 'update': { method: 'PUT' } }),
    CustomStreamFeeds: $resource(path + 'streams/custom/:streamId/feeds/:feedId', {
      streamId: '@streamId',
      feedId: '@feedId'
    }, { 'update': { method: 'PUT' } }),
    PreviewPosts: $resource(path + 'preview/:id', { id: '@id' }),
    FilterSites: $resource(path + 'filterSite/:filterSiteId', { filterSiteId: '@id' }, { 'update': { method: 'PUT' } }),
    FilterTerms: $resource(path + 'filterTerm/:filterTermId', { filterTermId: '@id' }, { 'update': { method: 'PUT' } }),
    FollowTwitter: $resource(path + 'follow/twitter'),
    HistoryItems: $resource(path + 'historyItems/:historyItemId', { historyItemId: '@id' }, { 'update': { method: 'PUT' } }),
    Tickets: $resource(path + 'tickets/:type', {type: '@type'})
  };
});
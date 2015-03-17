module.exports = function(config){
    config.set({


    basePath : '../',

    files : [
        'test/e2e/**/*.js',
        'js/ng/*.js'
    ],

    autoWatch : true,

    browsers : ['Chrome'],

    frameworks: ['ng-scenario'],

    // singleRun : true,

    proxies : {
      '/': 'http://localhost/~katat/'
    },

    plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-ng-scenario'
            ],

    junitReporter : {
      outputFile: 'test_out/e2e.xml',
      suite: 'e2e'
    }

})}


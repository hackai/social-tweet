// All JS goes here


// Channel dropdown JS
// var chData = [
//     {
//         text: "Twitter - @audreymelnik",
//         value: 1,
//         selected: false,
//         imageSrc: "img/twselect.png"
//     }
// ]
// $('.channel-select select').ddslick({
//     width: 259,
//     imagePosition: "left",
//     selected: 1,
//     defaultSelectedIndex: 1,
//     background: 'background: url(../img/channelselectbg.png);',
//     onSelected: function (data) {
//         console.log(data);
//     }
// });

// Curated Streams Tab JS
$('.collapse').on('show.bs.collapse', function () {
  $(this).prev('.panel-heading').find('.collapse-anchor span').addClass('expanded-arrow');
})
$('.collapse').on('hidden.bs.collapse', function () {
  $(this).prev('.panel-heading').find('.collapse-anchor span').removeClass('expanded-arrow');
})

// Hack to refresh Selected Stream Checkbox 
$('#sstream :checkbox, .cb-rf :checkbox').on('click',function(){
    $(this).siblings("span").toggleClass('tgl-cb');
})

// $(".selected-stream, .sample-posts").mCustomScrollbar({
//     scrollButtons:{
//         enable: Boolean
//     },
//     theme: 'dark-thick'
// });




$(document).ready(function () {
	$( 'p:empty' ).remove();
	$('.toggle').click(function() {
		if($(this).parent().parent().hasClass("open")) {
			$(this).parent().parent().removeClass("open");
			$(this).parent().parent().find(".faq-text").fadeOut("fast");
		} else {
			$(this).parent().parent().addClass("open");
			 $(this).parent().parent().find(".faq-text").fadeIn();
		}
	});
	$('#faq-expand').click(function() {
		$('.faq').each(function() {
 			$(this).removeClass("open");
			$(this).addClass("open");
		});
		$(".faq-text").fadeIn();
	});
	$('#faq-collapse').click(function() {
		$('.faq').each(function() {
 			$(this).removeClass("open");
		});
		$(".faq-text").fadeOut("fast");
	});
	$("#link-stories").click(function(event) {
		event.preventDefault();
		var targetOffset = $("#news").offset().top;
		$('html,body').animate({
			scrollTop: targetOffset
		}, 1000);
	});
	$("#link-press").click(function(event) {
		event.preventDefault();
		var targetOffset = $("#media").offset().top - 30;
		$('html,body').animate({
			scrollTop: targetOffset
		}, 1000);
	});
	$("#link-company").click(function(event) {
		event.preventDefault();
		var targetOffset = $("#announcements").offset().top - 30;
		$('html,body').animate({
			scrollTop: targetOffset
		}, 1000);
	});
 });
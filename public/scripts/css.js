$(function(){
	function w2h(width){
		 var height;
		 switch(width){
			case "195px":
				height = "100px";
				break;
			case "162px":
				height = "110px";
				break;
			case "125px":
				height = "120px";
				break;
			default:
				height = "100px";

		}
		return height;
	}
	var cardWidth;
	setTimeout(function(){
		cardWidth = $('.card').first().css('width');
		$('.card').css('height',w2h(cardWidth));
	},0)
	$(window).resize(function(){
		var newCardWidth = $('.card').first().css('width');
		if(newCardWidth!=cardWidth){
			$('.card').css('height',w2h(newCardWidth));
			cardWidth = newCardWidth;
		}
	});
});
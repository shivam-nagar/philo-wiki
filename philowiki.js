var tmp = 0;
function getWikiPage(url){
	if(url == "/wiki/Philosophy"){
		$("#result1").append(url.substring(6) + "<br>");
		$("#submitBtn").removeAttr("disabled");
		var temp = jsonList;
		jsonList = { 	"id": url.substring(6), 
						"name": url.substring(6), 
						children: [ temp ] 
					};
		//alert(jsonList);
		init(jsonList);
		return;
	}
	$("#result").load("http://en.wikipedia.org"+url,function(responseTxt,statusTxt,xhr){
		if(statusTxt=="success"){
			//alert("External content loaded successfully!");	
			
			if(url != "/wiki/Special:Random"){
				$("#result1").append('<a href="http://en.wikipedia.org'+url+'" target="_blank">'+url.substring(6) + "</a><br>");
				var temp = jsonList;
				if(tmp != 1){
					jsonList = { 	"id": url.substring(6), 
									"name": url.substring(6), 
									children: [ temp ] 
								};
				} else {
					jsonList = { 	"id": url.substring(6), 
									"name": url.substring(6), 
									children: [ ] 
								};
					tmp = 0;
				} 
			} else {
				tmp = 1;
			}
			getWikiPage(getNextLink());
		}
		if(statusTxt=="error")
			alert("Error: "+xhr.status+": "+xhr.statusText);
	});
}
function getNextLink(){
	var linkList = $("#result #mw-content-text p a");
	var returnURL = "";
	var mainClass;
	var parentTag;
	var test = 0;
	var doubt;
	var position;
	linkList.each(function(){
		mainClass = $(this).parent().parent().attr("id");
		parentTag = $(this).parent().get(0).tagName;
		//alert(mainClass + " - " + parentTag);
		if(mainClass == "mw-content-text" && parentTag == "P" && test == 0){
			position = $(this).parent().text().search($(this).text());
			if(position != -1){
				doubt = 0;
				for(var i=0;i<position;i++){
					if($(this).parent().text().charAt(i) == '(')
						doubt = doubt + 1;
					if($(this).parent().text().charAt(i) == ')')
						doubt = doubt - 1;
				}
			}
			if(doubt == 0) {
				returnURL = $(this).attr("href");
				//alert(returnURL);
				test = 1;
			}
		}
	});
	return returnURL;
}
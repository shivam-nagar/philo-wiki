var tmp = 0;
var first = 1;
function getWikiPage(url){
	if(url == "/wiki/Philosophy"){
		$("#result1").append(url.substring(6) + "<br>");
		$("#submitBtn").removeAttr("disabled");
		$("#showBtn").removeAttr("disabled");

		var temp = jsonList;
		jsonList = { 	"id": url.substring(6), 
						"name": url.substring(6), 
						children: [ temp ] 
					};
		if(first == 1){
			finalList = jsonList;
			first = 0;
		}
		jsonList = {};
		tmp = 1;
		found = false;
		//alert(jsonList);
		//init(jsonList);
		return;
	}
	$("#result").load("http://en.wikipedia.org"+url,function(responseTxt,statusTxt,xhr){
		if(statusTxt=="success"){
			//alert("External content loaded successfully!");
			if(url != "/wiki/Special:Random"){
				$("#result1").append('<a href="http://en.wikipedia.org'+url+'" target="_blank">'+url.substring(6) + "</a><br>");
				
				console.log("looking for "+url.substring(6));
				var el = traverse(finalList,url.substring(6));
				if(el){
					alert("matching at "+url.substring(6));
				}

				if(tmp != 1){
					var temp = jsonList;
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
var found = false;
function traverse(data,pk) {
    console.log(data["id"]); 

    if(data["id"] != undefined && data["id"] == pk && found == false) { 
        alert("Found "+pk);
        found = true;
        //alert(JSON.stringify(jsonList));
        //alert(JSON.stringify(finalList));
        data.children[data.children.length++] = (jsonList);
        //alert(JSON.stringify(finalList));
    }
    else if(data.children !== undefined){
    	for(var i=0;i<data.children.length;i++)
        	traverse(data.children[i], pk); //!! else use recursion to test a child property if present	
    } 
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
/**
 * Created with JetBrains WebStorm.
 * User: shivam
 * Date: 24/05/14
 * Time: 12:54 AM
 * To change this template use File | Settings | File Templates.
 */
var flag = true;
var parsed = false;
function resetGraph(){
    flag = true;
    jsonList = {};
    parsed = false;
}

function renderGraph(){
    $("#infovis").empty();
    init(finalList);
}

function traverse(data,pk) {
    if(parsed == true) return true
    if(data["id"] != undefined && data["id"] == pk) {
        console.log(JSON.stringify(jsonList))
        console.log(JSON.stringify(finalList))
        console.log(JSON.stringify(data))

        data.children[data.children.length++] = (jsonList);

        console.log("$$$ Found"+pk );
        console.log(JSON.stringify(data))
        console.log(JSON.stringify(jsonList))
        console.log(JSON.stringify(finalList))
        parsed = true
        return true;
    }
    else if(data.children !== undefined){
        for(var i=0;i<data.children.length;i++)
            traverse(data.children[i], pk); //!! else use recursion to test a child property if present
    }
    return false;
}

function pushToGraph(title,url,text){
    var temp = jsonList;
    if(traverse(finalList,title)){
        return
    }
    if(flag == true) {
        flag = false;
        jsonList = {
            "id": title,
            "name": title
        };
    } else {
        jsonList = {
            "id": title,
            "name": title,
            children: [ temp ]
        };
    }
}
function addTrace(trace) {
    $("#currentTrace").append($('<li class="list-group-item">'+trace+'</li>'))
    $("#currentTrace").scrollTop($("#currentTrace")[0].scrollHeight);
}

function enableActions() {
    $("#urlText").removeAttr("disabled")
    $(".btn").removeAttr("disabled")
}

function getWikiPage(title){
    var url = "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&redirects&page="+title
    $.ajax({
        dataType: "jsonp",
        url: url,
        crossDomain: true,
        success: function(json){
            var content = $('#result').html($('<div/>').html(json.parse.text['*']).find('p'));
            var next = getNextLink();
            pushToGraph(json.parse.title,json.parse.title,$('#result').html());
            addTrace(json.parse.title);
            if(next != "Philosophy") {
                getWikiPage(getNextLink());
            } else {
                pushToGraph("Philosophy","Philosophy","");
                if(parsed != true) finalList = jsonList;
                addTrace("Philosophy");
                enableActions();
                renderGraph();
            }
        }
    });
}
function getNextLink(){
    var linkList = $("#result p a");
    var returnURL = "";
    var parentTag;
    var test = 0;
    var doubt;
    var position;
    linkList.each(function(){
        if($(this).attr("title") == "Philosophy")  {
            returnURL = $(this).attr("title");
        } else {
            parentTag = $(this).parent().get(0).tagName;
            if(parentTag == "P" && test == 0){
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
                    returnURL = $(this).attr("title");
                    test = 1;
                }
            }
        }
    });
    return returnURL;
}


/**
 * Created with JetBrains WebStorm.
 * User: shivam
 * Date: 24/05/14
 * Time: 12:54 AM
 * To change this template use File | Settings | File Templates.
 */
var flag = true;
var parsed = false;
var jsonList = {};
var finalList = {};
var animateHandle;
var rotateAmt = 0;
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
        data.children[data.children.length++] = (jsonList);
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

$("#submitBtn").click(function(){
    resetGraph();
    var url = $("#urlText").val();
    $("#no-trace").remove();
    $("#displayed-items").append($('<span class="label label-primary">'+url+'</span>'))
    $("#displayed-items").scrollTop($("#displayed-items")[0].scrollHeight);
    getWikiPage(url);
    disableActions();
});

function disableActions() {
    animateHandle = setInterval(function(){
        rotateAmt +=10
        $("#trace-panelinfo span").css("transform","rotate("+rotateAmt+"deg)")
    }, 40);
    $("#urlText").attr("disabled","true")
    $(".btn").attr("disabled","true")
    $("#currentTrace").empty()
}

function markError(level) {
    $("#displayed-items span").last().removeClass("label-primary").addClass("label-"+level)
}

function addTrace(trace) {
    $("#currentTrace").append($('<li class="list-group-item">'+trace+'</li>'))
    $("#currentTrace").scrollTop($("#currentTrace")[0].scrollHeight);
}

function findLoop(currentNode){
    var list=[];
    $("#currentTrace li").each(function(){list.push(this.innerHTML);});
    if(list.indexOf(currentNode) >= 0) return true;
    else return false
}

function enableActions() {
    clearInterval(animateHandle);
    rotateAmt = 0;
    $("#trace-panelinfo span").css("transform","rotate("+rotateAmt+"deg)")
    $("#urlText").removeAttr("disabled");
    $(".btn").removeAttr("disabled");
    $("#urlText").val("");
}

function getWikiPage(title){
    var url = "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&redirects&page="+title
    $.ajax({
        dataType: "jsonp",
        url: url,
        crossDomain: true,
        success: function(json){
            if(json.error != undefined){
                addTrace("<span class='text-danger glyphicon glyphicon-remove-sign'></span> &nbsp; <span class='text-danger'>"+json.error.info+"</span>")
                markError("danger")
                enableActions()
                return
            }
            var content = $('#result').html($('<div/>').html(json.parse.text['*']).find('p'));
            var next = getNextLink();
            pushToGraph(json.parse.title,json.parse.title,$('#result').html());
            if(next != "Philosophy") {
                if(findLoop(json.parse.title)){
                  addTrace("<span class='text-danger glyphicon glyphicon-retweet'></span> &nbsp; <span class='text-danger'>Loop found at: "+json.parse.title+"</span>")
                  markError("warning")
                  enableActions();
                } else {
                    addTrace(json.parse.title);
                    getWikiPage(getNextLink());
                }
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

function random_character() {
    var chars = "abcdefghijklmnopqurstABCDEFGHIJKLMNOPQURSTUVW";
    return chars.substr( Math.floor(Math.random() * chars.length), 1);
}

function checkIfEmpty() {
    if($("#add-btns li div button").length <= 0) {
        $("#add-btns").append($('<li><div class="btn-group small"><button type="button" class="btn btn-warning btn-sm" onclick="loadSuggestions()">Add more Suggestions</button></div></li>'))
    }
}

function loadSuggestions() {
    var query = "http://en.wikipedia.org/w/api.php?action=query&list=search&srprop=sectiontitle&format=json&srlimit=20&srsearch="+random_character()
    $.ajax({
        dataType: "jsonp",
        url: query,
        crossDomain: true,
        success: function(json){
            var objList = JSON.parse(JSON.stringify(json))["query"]["search"];
            var fullList = []
            $("#add-btns").empty()
            for(i=0;i<objList.length;i++)  {
                if(objList[i]["title"].length > 20) continue;
                fullList[i] = objList[i]["title"]
                $("#add-btns").append($('<li><div class="btn-group small"><button type="button" class="btn btn-primary btn-sm">'+fullList[i]+'</button></div></li>'))
            }
            $("#add-btns li div button").click(function() {
                $("#urlText").val(this.innerHTML);
                $("#submitBtn").click();
                this.parentNode.parentNode.remove();
                checkIfEmpty();
            });

        }
    });
}
loadSuggestions();
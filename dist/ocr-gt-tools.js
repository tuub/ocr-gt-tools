function isElementInViewport(el){var rect=el.getBoundingClientRect();return rect.top>=0&&rect.left>=0}function compileTemplates(){window.templates={},$("*[id^='tpl-']").each(function(){var $this=$(this),tplId=$this.attr("id").replace(/^tpl-/,"");window.templates[tplId]=Handlebars.compile($this.html())})}function getImageWidth(el){return"IMG"===el.tagName||(el=$(el).find("img")[0])?el.clientWidth:-1}function escapeNewline(str){return str.replace(/^\n*/,"").replace(/\n*$/,"").replace(/\n/g,"<br>")}function unescapeNewline(str){return str.replace(/^(<br>)*/,"").replace(/(<br>)*$/,"").replace(/<br>/g,"\n")}function loadGtEditLocation(url){url&&$.ajax({type:"POST",url:UISettings.cgiUrl+"?action=create",data:{data_url:url},beforeSend:function(xhr){$("#file-correction").addClass("hidden")},success:function(res){$("#dropzone").addClass("hidden"),window.ocrGtLocation=res,window.location.hash=window.ocrGtLocation.imageUrl,$("#raw-html").load(Utils.uncachedURL(window.ocrGtLocation.correctionUrl),function(response,status,xhr){$.ajax({type:"GET",url:Utils.uncachedURL(window.ocrGtLocation.commentsUrl),error:function(x,e){window.alert(x.status+" FEHLER aufgetreten: \n"+e)},success:function(response,status,xhr){Utils.parseLineComments(response,window.ocrGtLocation),addCommentFields(),$("#file-correction").removeClass("hidden"),onScroll()}})}),$("#zoom-in").removeClass("hidden"),$("#zoom-out").removeClass("hidden"),$("#save_button").removeClass("hidden")},error:function(x,e){window.alert(x.status+" FEHLER aufgetreten: \n"+e)}})}function saveGtEditLocation(){return window.ocrGtLocation.changed?($("#wait_save").addClass("wait").removeClass("hidden"),$("#disk").addClass("hidden"),window.ocrGtLocation.transliterations=$("li.transcription div").map(function(){return escapeNewline($(this).html())}).get(),window.ocrGtLocation.lineComments=$("li.line-comment div").map(function(){return escapeNewline($(this).html())}).get(),window.ocrGtLocation.pageComment=escapeNewline($(".page-comment div").html()),console.log(window.ocrGtLocation.pageComment),console.log(window.ocrGtLocation.transliterations),console.log(window.ocrGtLocation.lineComments),void $.ajax({type:"post",url:UISettings.cgiUrl+"?action=save",data:window.ocrGtLocation,success:markSaved,error:function(x,e){window.alert(x.status+" FEHLER aufgetreten")}})):void console.log("Nothing changed.")}function markChanged(){window.ocrGtLocation.changed=!0,$("#save_button").removeClass("disabled"),updateCommentButtonColor()}function markSaved(){window.ocrGtLocation.changed=!1,$("#wait_save").removeClass("wait").addClass("hidden"),$("#disk").removeClass("hidden"),$("#save_button").addClass("disabled")}function addCommentFields(){$("#file-correction").empty(),$("#raw-html table").each(function(curLine){var $this=$(this),line={id:curLine,title:$this.find("td")[0].innerHTML,imgSrc:$this.find("img")[0].getAttribute("src"),transcription:unescapeNewline($this.find("td")[2].innerHTML),comment:unescapeNewline(window.ocrGtLocation.lineComments[curLine])},$line=$(window.templates.line(line));$(":checkbox",$line).on("change",function(){$(this).closest(".row").toggleClass("selected")}),$("#file-correction").append($line)}),$("#page-info").html(window.templates.page(window.ocrGtLocation)),$("#wait-load").removeClass("hidden"),$(".show-line-comment").on("click",toggleLineComment),$(".hide-line-comment").on("click",toggleLineComment),$(".add-comment").on("click",addComment),updateCommentButtonColor()}function zoomIn(e){e.stopPropagation(),$("#file-correction img").each(function(){Utils.scaleHeight(this,UISettings.zoomInFactor)})}function zoomOut(e){e.stopPropagation(),$("#file-correction img").each(function(){Utils.scaleHeight(this,UISettings.zoomOutFactor)})}function zoomReset(e){e.stopPropagation(),$("#file-correction img").each(function(){Utils.scaleHeight(this,1)})}function updateCommentButtonColor(){$(".line").each(function(){var $line=this,$lineComment=$(".line-comment div[contenteditable]",$line);$lineComment.html().match(/\S/)?$(".show-line-comment",$line).removeClass("btn-default").addClass("btn-info"):$(".show-line-comment",$line).addClass("btn-default").removeClass("btn-info")})}function toggleLineComment(){var target=$(this).attr("data-target");$(target).toggleClass("hidden"),$("*[data-target='#"+target+"']").toggleClass("hidden")}function hideLineComment(){var target=$(this).attr("data-target");$(target).addClass("hidden"),$(".hide-line-class[data-target='#"+target+"']").addClass("hidden"),$(".show-line-class[data-target='#"+target+"']").removeClass("hidden")}function hideAllLineComments(){$(".hide-line-comment").each(hideLineComment),onScroll()}function showLineComment(){var target=$(this).attr("data-target");$(target).removeClass("hidden"),$(".hide-line-class[data-target='#"+target+"']").removeClass("hidden"),$(".show-line-class[data-target='#"+target+"']").addClass("hidden")}function showAllLineComments(){$(".show-line-comment").each(showLineComment),onScroll()}function addMultiComment(){var tag="#"+$(this).attr("data-tag");$(".selected .line-comment").each(function(){addTagToElement($("div[contenteditable]",$(this)),tag)})}function addComment(){var target=$($(this).attr("data-target")).find("div[contenteditable]"),tag="#"+$(this).attr("data-tag");addTagToElement($(target),tag)}function addTagToElement($target,tag){-1==$target.html().indexOf(tag)&&($target.html().match(/^.*\S.*$/)&&$target.append("\n"),$target.append(tag),$target.append("\n"),markChanged())}function sortRowsByWidth(order){var order=order||1;$("#file-correction").append($("#file-correction .row").sort(function(a,b){var aWidth=getImageWidth(a),bWidth=getImageWidth(b);return(aWidth-bWidth)*order}).detach())}function sortRowsByLine(order){var order=order||1;$("#file-correction").append($("#file-correction .row").sort(function(a,b){var aLine=$(a).find(".select-col").attr("data-target").replace(/[^\d]/g,""),bLine=$(b).find(".select-col").attr("data-target").replace(/[^\d]/g,"");return(aLine-bLine)*order}).detach())}function confirmExit(e){return window.ocrGtLocation&&window.ocrGtLocation.changed?(window.alert("Ungesicherte Inhalte vorhanden, bitte zuerst speichern!"),"Ungesicherte Inhalte vorhanden, bitte zuerst speichern!"):void 0}function onHashChange(){var cHash=window.location.hash;window.ocrGtLocation&&window.ocrGtLocation.changed?confirmExit():""!==cHash&&loadGtEditLocation(cHash.substring(1))}function getUrlFromDragEvent(e){var elem=e.originalEvent.dataTransfer.getData("text/html"),url=$(elem).find("img").addBack("img").attr("src");return url||(url=$(elem).find("a").addBack("a").attr("href")),url||(url=e.originalEvent.dataTransfer.getData("text/plain")),url}function onScroll(){var done=!1,cur=0,total=0;$("table").each(function(){total+=1,done||isElementInViewport(this)&&(cur=1+parseInt(this.getAttribute("data-line-number")),done=!0)}),$("#currentLine").html(cur+" / "+total)}function setupDragAndDrop(){$(document).bind("drop dragover",function(e){e.preventDefault()}),$(document).bind("dragenter",function(e){e.preventDefault(),$("#file-correction").addClass("hidden"),$("#dropzone").removeClass("hidden")}).bind("dragend",function(e){e.preventDefault(),$("#file-correction").removeClass("hidden"),$("#dropzone").addClass("hidden")}),$("#dropzone").bind("dragover dragenter",function(e){e.preventDefault(),$("#dropzone").addClass("droppable").removeClass("hidden")}).bind("dragenter",function(e){e.stopPropagation()}).bind("dragleave",function(e){e.preventDefault(),$("#dropzone").removeClass("droppable").addClass("hidden")}).bind("drop",function(e){if(e.preventDefault(),window.ocrGtLocation&&window.ocrGtLocation.changed)window.alert("Ungesicherte Inhalte vorhanden, bitte zuerst speichern!");else{var url=getUrlFromDragEvent(e);url?loadGtEditLocation(url):window.alert("Konnte keine URL erkennen.")}})}function toggleSelectMode(){$(".selected").toggleClass("selected"),$(".select-col").toggleClass("hidden"),$("#select-bar").toggleClass("hidden")}var UISettings={zoomInFactor:1.4,zoomOutFactor:.8,cgiUrl:"../ocr-gt-tools.cgi"},Utils={};Utils.parseLineComments=function(txt,target){for(var lines=txt.split(/\n/),lineComments=[],i=0;i<lines.length;i++){var lineComment=lines[i].replace(/^\d+:\s*/,"");lineComment=unescapeNewline(lineComment),lineComments.push(lineComment)}target.pageComment=lineComments[0],target.lineComments=lineComments.slice(1)},Utils.scaleHeight=function(el,factor){var curHeight=el.getAttribute("height")||el.offsetHeight;el.hasAttribute("data-original-height")||el.setAttribute("data-original-height",curHeight);var originalHeight=el.getAttribute("data-original-height"),newHeight=1==factor?originalHeight:curHeight*factor;el.setAttribute("height",newHeight)},Utils.uncachedURL=function(url){return url+"?nocache="+Date.now()},$(function(){compileTemplates(),window.onhashchange=onHashChange,window.onbeforeunload=confirmExit,window.onscroll=onScroll,setupDragAndDrop(),$("#save_button").on("click",saveGtEditLocation),$("#zoom-in").on("click",zoomIn),$("#zoom-out").on("click",zoomOut),$("#zoom-reset").on("click",zoomReset),$("#file-correction").on("input",markChanged),$("#page-info").on("input",markChanged),$('button[data-target="#history-modal"]').on("click",function(){$.ajax({url:UISettings.cgiUrl+"?action=history&mine=true",type:"json",success:function(data){for(var i=0;i<data.length;i++)$("#history-modal tbody").append(window.templates.historyItem(data[i]))},error:function(x,e){window.alert(x.status+" FEHLER aufgetreten")}})}),$('button[data-target="#cheatsheet-modal"]').on("click",function(){$.ajax({url:"special-chars.json",type:"json",success:function(data){var keys=Object.keys(data);$("#cheatsheet-modal .cheatsheet").empty();for(var i=0;i<keys.length;i++){var key=keys[i];data[key].id=key,$("#cheatsheet-modal .cheatsheet").append(window.templates.cheatsheetEntry(data[key]))}},error:function(x,e){console.log(x),window.alert(x.status+" FEHLER aufgetreten")}})}),$("#expand_all_comments").on("click",showAllLineComments),$("#collapse_all_comments").on("click",hideAllLineComments),$("#toggle-select").on("click",toggleSelectMode),$(".add-multi-comment").on("click",addMultiComment),$(".set-view").on("click",function(){$(".line *").addClass("view-hidden");var selectors=$(this).attr("data-target");$.each(selectors.split(/\s*,\s*/),function(idx,selector){".line-comment"===selector&&showAllLineComments(),console.log(selector),$(selector).removeClass("view-hidden"),$(selector).parents().removeClass("view-hidden")})}),$("#sort-line").on("click",function(){sortRowsByLine(1)}),$("#sort-line-desc").on("click",function(){sortRowsByLine(-1)}),$("#sort-width").on("click",function(){sortRowsByWidth(1)}),$("#sort-width-desc").on("click",function(){sortRowsByWidth(-1)}),onHashChange()});
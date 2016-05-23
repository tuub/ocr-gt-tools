function CheatsheetView($el,model){var self=this;self.model=model,self.$el=$el,self.rendering=!1,self.$el.find('input[type="text"]').on("keydown",function(e){e.keyCode<32||e.ctrlKey||e.altKey?self.filter=null:self.filter=String.fromCharCode(e.keyCode),self.applyFilter(),$(this).val("")})}function httpError(xhr){notie.alert(3,"HTTP Fehler "+xhr.status+":\n<pre style='text-align: left'>"+xhr.responseText+"</pre>"),WaitingAnimation.stop()}function compileTemplates(){window.templates={},$("*[id^='tpl-']").each(function(){var $this=$(this),tplId=$this.attr("id").replace(/^tpl-/,"");window.templates[tplId]=Handlebars.compile($this.html())})}function loadGtEditLocation(url){url&&$.ajax({type:"GET",url:UISettings.cgiUrl+"?action=create&imageUrl="+url,beforeSend:function(xhr){$("#file-correction").addClass("hidden"),WaitingAnimation.start()},success:function(res){$("#dropzone").addClass("hidden"),window.ocrGtLocation=res,console.log(window.ocrGtLocation),window.location.hash=window.ocrGtLocation.url["thumb-url"],window.setTimeout(function(){$("#raw-html").load(Utils.uncachedURL(window.ocrGtLocation.url["correction-url"]),function(response,status,xhr){$.ajax({type:"GET",url:Utils.uncachedURL(window.ocrGtLocation.url["comment-url"]),error:httpError,success:function(response,status,xhr){Utils.parseLineComments(response,window.ocrGtLocation),addCommentFields(),$("#file-correction").removeClass("hidden"),$("ul.navbar-nav li").removeClass("disabled"),$.each(window.ocrGtLocation.pages,function(index,pageObj){$("#page-index").append('<li><a href="#'+pageObj.url+'">'+pageObj.page+"</a></li>")}),onScroll(),WaitingAnimation.stop()}})})},1),$("#zoom-in").removeClass("hidden"),$("#zoom-out").removeClass("hidden"),$("#save_button").removeClass("hidden")},error:httpError})}function saveGtEditLocation(){return window.ocrGtLocation.changed?($("#wait_save").addClass("wait").removeClass("hidden"),$("#disk").addClass("hidden"),window.ocrGtLocation.transcriptions=$("li.transcription div").map(function(){return Utils.encodeForServer($(this).html())}).get(),window.ocrGtLocation.lineComments=$("li.line-comment div").map(function(){return Utils.encodeForServer($(this).html())}).get(),window.ocrGtLocation.pageComment=Utils.encodeForServer($("#page-comment div").html()),void $.ajax({type:"POST",url:UISettings.cgiUrl+"?action=save",data:window.ocrGtLocation,success:markSaved,error:httpError})):void notie.alert(2,"Nothing changed.",1)}function markChanged(){window.ocrGtLocation.changed=!0,$("#save_button").removeClass("disabled"),updateCommentButtonColor()}function markSaved(){window.ocrGtLocation.changed=!1,$("#wait_save").removeClass("wait").addClass("hidden"),$("#disk").removeClass("hidden"),$("#save_button").addClass("disabled"),$(".line div[contenteditable]").each(function(){$(this).html(Utils.encodeForBrowser(Utils.encodeForServer($(this).html())))}),notie.alert(1,"Gespeichert",1)}function addCommentFields(){$("#file-correction").empty(),$("#raw-html table").each(function(curLine){var $this=$(this),line={id:curLine,title:$this.find("td")[0].innerHTML,imgSrc:$this.find("img")[0].getAttribute("src"),transcription:Utils.encodeForBrowser($this.find("td")[2].innerHTML),comment:Utils.encodeForBrowser(window.ocrGtLocation.lineComments[curLine])},$line=$(window.templates.line(line));$(":checkbox",$line).on("click",function(e){$(this).closest(".row").toggleClass("selected"),e.stopPropagation()}),$(".select-col",$line).on("click",function(e){$(this).find(":checkbox").click()}),$(".transcription div[contenteditable]",$line).on("keydown",function(e){13==e.keyCode&&e.preventDefault()}),$("div[contenteditable]",$line).on("blur",function(e){$(this).html(Utils.encodeForBrowser(Utils.encodeForServer($(this).html())))}),$("#file-correction").append($line)}),$("#right-sidebar").html(window.templates.rightSidebar(window.ocrGtLocation)),$(".show-line-comment").on("click",toggleLineComment),$(".hide-line-comment").on("click",toggleLineComment),$(".add-comment").on("click",addComment),updateCommentButtonColor(),reduceViewToSelectors(UISettings.defaultViews)}function zoomIn(e){e.stopPropagation(),$("#file-correction img").each(function(){Utils.scaleHeight(this,UISettings.zoomInFactor)})}function zoomOut(e){e.stopPropagation(),$("#file-correction img").each(function(){Utils.scaleHeight(this,UISettings.zoomOutFactor)})}function zoomReset(e){e.stopPropagation(),$("#file-correction img").each(function(){Utils.scaleHeight(this,1)})}function updateCommentButtonColor(){$(".line").each(function(){var $line=this,$lineComment=$(".line-comment div[contenteditable]",$line),lineCommentId=$(".line-comment",$line).attr("id");$lineComment.text().match(/\S/)?$(".show-line-comment[data-target='#"+lineCommentId+"']").removeClass("btn-default").addClass("btn-info"):$(".show-line-comment[data-target='#"+lineCommentId+"']").addClass("btn-default").removeClass("btn-info")})}function toggleLineComment(){var target=$(this).attr("data-target");$(target).toggleClass("view-hidden"),$("*[data-target='#"+target+"']").toggleClass("hidden")}function addMultiComment(){var tag="#"+$(this).attr("data-tag");$(".selected .line-comment").each(function(){addTagToElement($("div[contenteditable]",$(this)),tag)})}function addComment(){var target=$($(this).attr("data-target")).find("div[contenteditable]"),tag="#"+$(this).attr("data-tag");addTagToElement($(target),tag)}function addTagToElement($target,tag){$target.html($target.html().trim()),-1==$target.html().indexOf(tag)&&($target.html().match(/\S/)&&$target.append("\n"),$target.append(tag),$target.append("\n"),$target.parent().removeClass("hidden"),markChanged())}function sortRowsByWidth(order){var order=order||1;$("#file-correction").append($("#file-correction .row").sort(function(a,b){var aWidth=Utils.getImageWidth(a),bWidth=Utils.getImageWidth(b);return(aWidth-bWidth)*order}).detach())}function sortRowsByLine(order){var order=order||1;$("#file-correction").append($("#file-correction .row").sort(function(a,b){var aLine=$(a).attr("id").replace(/[^\d]/g,""),bLine=$(b).attr("id").replace(/[^\d]/g,"");return(aLine-bLine)*order}).detach())}function changeSelection(action){$(".select-col").each(function(){var $this=$(this),isSelected=$this.closest(".row").hasClass("selected");"select"!==action||isSelected?"unselect"===action&&isSelected?$this.trigger("click"):"toggle"===action&&$this.trigger("click"):$this.trigger("click")})}function reduceViewToSelectors(selectors){$(".lines-col .panel *").addClass("view-hidden");for(var i=0;i<selectors.length;i++)$(selectors[i]).removeClass("view-hidden").parents().removeClass("view-hidden")}function confirmExit(e){return window.ocrGtLocation&&window.ocrGtLocation.changed?(notie.alert(2,"Ungesicherte Inhalte vorhanden, bitte zuerst speichern!",5),"Ungesicherte Inhalte vorhanden, bitte zuerst speichern!"):void 0}function onHashChange(){var cHash=window.location.hash;window.ocrGtLocation&&window.ocrGtLocation.changed?confirmExit():""!==cHash&&loadGtEditLocation(cHash.substring(1))}function onScroll(){var done=!1,cur=0,total=0;$("table").each(function(){total+=1,done||Utils.isElementInViewport(this)&&(cur=1+parseInt(this.getAttribute("data-line-number")),done=!0)}),$("#currentLine").html(cur+" / "+total)}function setupDragAndDrop(){$(document).bind("drop dragover",function(e){e.preventDefault()}),$(document).bind("dragenter",function(e){e.preventDefault(),$("#file-correction").addClass("hidden"),$("#dropzone").removeClass("hidden")}).bind("dragend",function(e){e.preventDefault(),$("#file-correction").removeClass("hidden"),$("#dropzone").addClass("hidden")}),$("#dropzone").bind("dragover dragenter",function(e){e.preventDefault(),$("#dropzone").addClass("droppable").removeClass("hidden")}).bind("dragenter",function(e){e.stopPropagation()}).bind("dragleave",function(e){e.preventDefault(),$("#dropzone").removeClass("droppable").addClass("hidden")}).bind("drop",function(e){if(e.preventDefault(),window.ocrGtLocation&&window.ocrGtLocation.changed)notie.alert(2,"Ungesicherte Inhalte vorhanden, bitte zuerst speichern!",2);else{var url=Utils.getUrlFromDragEvent(e);url?loadGtEditLocation(url):notie.alert(3,"Konnte keine URL erkennen.")}})}function toggleSelectMode(){$(".selected").toggleClass("selected"),$(".select-col").toggleClass("hidden"),$(".button-col").toggleClass("hidden"),$("#select-bar").toggleClass("hidden")}function onPageLoaded(){compileTemplates(),window.onhashchange=onHashChange,window.onbeforeunload=confirmExit,window.onscroll=onScroll,setupDragAndDrop(),$("#save_button").on("click",saveGtEditLocation),$("#zoom-in").on("click",zoomIn),$("#zoom-out").on("click",zoomOut),$("#zoom-reset").on("click",zoomReset),$("#file-correction").on("input",markChanged),$("#right-sidebar").on("input",markChanged),$('button[data-target="#history-modal"]').on("click",function(){$.ajax({url:UISettings.cgiUrl+"?action=history&mine=true",dataType:"json",success:function(data){for(var i=0;i<data.length;i++)$("#history-modal tbody").append(window.templates.historyItem(data[i]))},error:httpError})}),window.cheatsheetView=new CheatsheetView($("#cheatsheet-modal"),UISettings["special-chars"]),window.cheatsheetView.render(),$("#toggle-select").on("click",toggleSelectMode),$("#select-bar .close").on("click",toggleSelectMode),$(".add-multi-comment").on("click",addMultiComment),$(".set-view").on("click",function(){reduceViewToSelectors($(this).attr("data-target").split(/\s*,\s*/))}),$("#sort-line").on("click",function(){sortRowsByLine(1)}),$("#sort-line-desc").on("click",function(){sortRowsByLine(-1)}),$("#sort-width").on("click",function(){sortRowsByWidth(1)}),$("#sort-width-desc").on("click",function(){sortRowsByWidth(-1)}),$("#load-image button").on("click",function(){window.location.hash="#"+$("#load-image input").val()}),$(".select-all").on("click",function(){changeSelection("select")}),$(".select-none").on("click",function(){changeSelection("unselect")}),$(".select-toggle").on("click",function(){changeSelection("toggle")}),new Clipboard(".code"),onHashChange()}var Utils={};Utils.parseLineComments=function(txt,target){for(var lines=txt.split(/\n/),lineComments=[],i=0;i<lines.length;i++){var lineComment=lines[i].replace(/^\d+:\s*/,"");lineComment=Utils.encodeForServer(lineComment),lineComments.push(lineComment)}target.pageComment=lineComments[0],target.lineComments=lineComments.slice(1)},Utils.scaleHeight=function(el,factor){var curHeight=el.getAttribute("height")||el.offsetHeight;el.hasAttribute("data-original-height")||el.setAttribute("data-original-height",curHeight);var originalHeight=el.getAttribute("data-original-height"),newHeight=1==factor?originalHeight:curHeight*factor;el.setAttribute("height",newHeight)},Utils.uncachedURL=function(url){return url+"?nocache="+Date.now()},Utils.isElementInViewport=function(el){var rect=el.getBoundingClientRect();return rect.top>=0&&rect.left>=0},Utils.getImageWidth=function(el){return"IMG"===el.tagName||(el=$(el).find("img")[0])?el.clientWidth:-1},Utils.encodeForBrowser=function(str){return str.replace(/&amp;/g,"&").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/^\n*/,"").replace(/\n*$/,"").replace(/\n/g,"<br>")},Utils.encodeForServer=function(str){return str.replace(/^(<br[^>]*>)*/,"").replace(/(<br[^>]*>)*$/,"").replace(/<br[^>]*>/g,"\n")},Utils.getUrlFromDragEvent=function(e){var elem=e.originalEvent.dataTransfer.getData("text/html"),url=$(elem).find("img").addBack("img").attr("src");return url||(url=$(elem).find("a").addBack("a").attr("href")),url||(url=e.originalEvent.dataTransfer.getData("text/plain")),url};var WaitingAnimation=function(){var self=this;return self._id=null,this.start=function(){$("#dropzone").addClass("hidden"),$("#waiting-animation").removeClass("hidden");var keys=Object.keys(UISettings["special-chars"]);self._id=setInterval(function(){for(perRound=50;perRound-- >0;){var randGlyph=UISettings["special-chars"][keys[parseInt(Math.random()*keys.length)]];$("#waiting-animation tr:nth-child("+parseInt(20*Math.random())+") td:nth-child("+parseInt(20*Math.random())+")").html(randGlyph.sample)}},300)},this.stop=function(){$("#waiting-animation").addClass("hidden"),clearInterval(self._id)},self}();CheatsheetView.prototype.applyFilter=function(){var self=this;$.each(self.model,function(id,desc){self.filter&&""!==self.filter&&-1===desc.baseLetter.indexOf(self.filter)&&-1===desc.baseLetter.indexOf(self.filter.toLowerCase())?$("#cheatsheet-"+id).addClass("hidden"):$("#cheatsheet-"+id).removeClass("hidden")})},CheatsheetView.prototype.render=function(){var self=this;return self.$el.find(".cheatsheet").empty(),$.each(Object.keys(self.model),function(idx,key){self.$el.find(".cheatsheet").append(window.templates.cheatsheetEntry(self.model[key]))}),self.$el.find("button").on("click",function(){notie.alert(1,"In Zwischenablage kopiert: '"+$(this).attr("data-clipboard-text")+"'")}),self};var UISettings={zoomInFactor:1.4,zoomOutFactor:.8,cgiUrl:"ocr-gt-tools.cgi",defaultViews:[".transcription","img"]};$(function(){$.ajax({type:"GET",url:"special-chars.json",dataType:"json",error:httpError,success:function(specialChars){$.ajax({type:"GET",url:"error-tags.json",dataType:"json",error:function(){Utils.httpE(x)},success:function(errorTags){UISettings["special-chars"]=specialChars,UISettings["error-tags"]=errorTags,onPageLoaded()}})}})});
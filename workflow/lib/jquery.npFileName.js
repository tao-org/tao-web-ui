/*!
 * npFileName - v0.1.1 - 2018-10-18
 */

var npDOMhelper = {
    splitStringAt: function (value, index) {
        return [value.substring(0, index), value.substring(index)];
    },
    whichChild: function(elem){
        var  i= 0;
        while((elem=elem.previousSibling)!=null) ++i;
        return i;
    },
    getCaretPosition: function () {
        if (window.getSelection && window.getSelection().getRangeAt) {
            var range = window.getSelection().getRangeAt(0);
            var selectedObj = window.getSelection();
            var rangeCount = 0;
            var blockNode = selectedObj.anchorNode.parentNode;

            var childNodes = selectedObj.anchorNode.parentNode.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                if (childNodes[i] === selectedObj.anchorNode) {
                    break;
                }
                if (childNodes[i].outerHTML)
                    rangeCount += childNodes[i].outerHTML.length;
                else if (childNodes[i].nodeType === 3) {
                    rangeCount += childNodes[i].textContent.length;
                }
            }
            return {
                node: blockNode,
                nodePos: range.startOffset + rangeCount,
                line:blockNode.parentElement,
                linePos: npDOMhelper.getCaretCharacterOffsetWithin(blockNode.parentElement)
            };
        }
        return {node: null, blockPos: 0, line:null, linePos:0};
    },
    getCaretCharacterOffsetWithin: function(element) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection !== "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type !== "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    },
    replaceNodeText: function(n,t){
        n.innerText = t;
        var nnn = $(n).contents().filter(function() {
            return this.nodeType === Node.TEXT_NODE;
        });
        this.setCaretTo(nnn[0],t.length, null);//el
    },
    traverseNodes: function(rootEl){
        var nodeList = [];
        var nodeData = [];

        var treeWalker = document.createTreeWalker(
            rootEl,
            NodeFilter.SHOW_TEXT,
            function(node) {
                return NodeFilter.FILTER_ACCEPT;
            },
            false
        );
        while (treeWalker.nextNode()){
            nodeList.push(treeWalker.currentNode);
        }
        nodeData = nodeList.map(function(node) {
            return { content: node.textContent, node: node, charLen: node.textContent.length }
        });
        return nodeData;
    },
    computeCaretNodeAndPosition: function(nodesText, caretPosition){
        //check caretPosition outside range
        var charTotalCount = 0;
        var i;
        for ( i = 0, _len = nodesText.length; i < _len; i++ ) {
            charTotalCount += nodesText[i]['charLen'];
        }
        caretPosition = Math.min(charTotalCount,caretPosition);
        if(nodesText.length===0){
            return {node:null, "pos":0};
        }
        var node_pos = null;
        var char_pos = 0;
        i = 0;
        while (nodesText[i] && caretPosition > nodesText[i].charLen) {
            caretPosition -= nodesText[i].charLen;
            i++;
        }
        node_pos = nodesText[i];
        return {node:node_pos.node, "pos":caretPosition};
    },
    setCaretTo: function(node,pos,el) {
        if(node){
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(node, pos);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        //set focus if focus element sent
        if(el) el.focus();
    }
};

//////////////////////
(function ($, window) {

    // -- tokenizer ------------------------------
    var _tkn = function(){
        var navigationKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "End", "Home", "Right", "Left", "Up", "Down"];
        var modifierKeys = ["Shift", "Control"];
        var allowedKeys = ["Delete","Tab","Backspace","$",".",":","{","}"];
        var trackedTokens = {
            "ltr"		: "Literal",
            "vbsm"		: "Variable block start marker",
            "vbas"		: "Variable block arguments separator",
            "leftcb"	: "Left curly bracket",
            "rightcb"	: "Right curly bracket",
            "var"		: "Variable",
            "op"		: "Operator",
            "dot"		: "Dot"
        };

        function Token(code, value) {
            this.code = code;
            this.value = value;
            if(trackedTokens[code])
                this.type = trackedTokens[code];
            else
                this.type = "Undefined";
        }

        function isModifierKey(ch) {
            return (modifierKeys.indexOf(ch) !== -1);
        }
        function isNavKey(ch) {
            return (navigationKeys.indexOf(ch) !== -1);
        }
        function isAllowedKey(ch) {
            return (allowedKeys.indexOf(ch) !== -1);
        }
        function isBannedKey(ch) {
            return !( isNavKey(ch) || isDigit(ch) || isLetter(ch) || isOtherLetter(ch) || isAllowedKey(ch) );
        }
        function isColon(ch) {
            return /:/.test(ch);
        }
        function isDigit(ch) {
            if(ch.length !==1) return false;
            return /\d/.test(ch);
        }
        function isLetter(ch) {
            if(ch.length !==1) return false;
            return /[a-z]/i.test(ch);
        }
        function isOtherLetter(ch) {
            return /\#|_|\*/.test(ch);
        }
        function isRightCurlyBracket(ch) {
            return /\}/.test(ch);
        }
        function isLeftCurlyBracket(ch) {
            return /\{/.test(ch);
        }

        function parseRoles(tokens){
            var i = 0;
            while(tokens[i]){
                if(tokens[i-1] && (tokens[i].code === "ltr") && (tokens[i-1].code === "leftcb")){
                    tokens[i].role = "index";
                }
                if(tokens[i-1] && (tokens[i].code === "ltr") && (tokens[i-1].code === "vbas")){
                    tokens[i].role = "tag";
                    tokens[i].value = tokens[i].value.toUpperCase();
                }
                i++;
            }
            return tokens;
        }

        function tokenize(str) {
            var result=[];
            var textBuffer=[];

            str.replace(/\s+/g, "");
            str=str.split("");

            function emptyTextBufferAsLiteral() {
                if(textBuffer.length) {
                    result.push(new Token("ltr", textBuffer.join("")));
                    textBuffer=[];
                }
            }

            //start processing
            str.forEach(function (char, idx) {
                if(isDigit(char))
                {
                    textBuffer.push(char);
                }
                else if(isLetter(char))
                {
                    textBuffer.push(char);
                }
                else if(isOtherLetter(char))
                {
                    textBuffer.push(char);
                }
                else if(char==="$")
                {
                    emptyTextBufferAsLiteral();
                    result.push(new Token("vbsm", char));
                }
                else if (isLeftCurlyBracket(char))
                {
                    emptyTextBufferAsLiteral();
                    result.push(new Token("leftcb", char));
                }
                else if (isRightCurlyBracket(char))
                {
                    emptyTextBufferAsLiteral();
                    result.push(new Token("rightcb", char));
                }
                else if(isColon(char))
                {
                    emptyTextBufferAsLiteral();
                    result.push(new Token("vbas", char));
                }
                else if(char===".")
                {
                    emptyTextBufferAsLiteral();
                    result.push(new Token("dot", char));
                }
            });

            emptyTextBufferAsLiteral();
            return result;
        }
        return {
            "isNavKey": isNavKey,
            "isModifierKey": isModifierKey,
            "isBannedKey": isBannedKey,
            "tokenize": tokenize,
            "parseRoles": parseRoles
        };
    }();

    var ui = {
        fixMenuPosition: function(element) {
            //move menu inside window
            var win = {
                "w":$(window)['width'](),
                "h":$(window)['height']()
            };
            var scroll = {
                "l":$(window)['scrollLeft'](),
                "t":$(window)['scrollTop']()
            };
            var menu = {
                "w":element['width'](),
                "h":element['height'](),
                "offset_left":element.offset().left,
                "offset_top":element.offset().top
            };
            var delta = {
                "x":0,
                "y":0
            };
            // opening menu would pass on the outside of the page
            if (menu.offset_left + menu.w > win.w) {
                delta.x = menu.offset_left + menu.w - win.w;
            }
            //		if (x + menu.h > win.h && menu.h < y) { delta.y -= menu.h;}
            return {"x": delta.x, "y": delta.y};
        },

        renderTokensFragment: function(tokens) {
            var frag = document.createDocumentFragment();
            if(tokens.length){
                tokens.forEach(function (token, idx) {
                    var span = document.createElement("span");
                    span.innerHTML = token.value;
                    var tClass = token.code;
                    if(token.role){
                        tClass += " " + token.role;
                    }
                    span.className  = tClass;
                    frag.appendChild(span);
                    token.el = span;
                });
            }
            return frag;
        },
        appendFragmentToEl: function(frag, el){
            var presentationLine = document.createElement("div");
            presentationLine.setAttribute("role", "presentation");
            presentationLine.className = "sintaxLine";

            var nL = el.appendChild(presentationLine);
            nL.appendChild(frag);
            return nL;
        },
        caretAwarenessTest: function(settings, fullText){
            //check caretNearBracket
            var higlightHitOnBracket = function(hitPos){
                $("span", $(settings.info.cLine)).removeClass("hit-near");
                if(!hitPos)
                    return;
                var i = 0;
                while(settings.info.tokens[i] && (hitPos > 0)){
                    hitPos = hitPos - settings.info.tokens[i].value.length;
                    i++;
                }
                if(!(settings.info.tokens[i] && settings.info.tokens[i].el)){
                    if(settings.debug) console.log("element misfire:"+i, 'background: #222; color: #bada55');
                    return;
                }
                $(settings.info.tokens[i].el).addClass("hit-near");

                if(settings.info.tokens[i].code === "leftcb"){ //search closing bracket
                    while(settings.info.tokens[i]){
                        if(settings.info.tokens[i].code === "rightcb"){
                            $(settings.info.tokens[i].el).addClass("hit-near");
                            break;
                        }
                        i++;
                    }
                }
                if(settings.info.tokens[i] && (settings.info.tokens[i].code === "rightcb")){ //search closing bracket
                    while(settings.info.tokens[i]){
                        if(settings.info.tokens[i].code === "leftcb"){
                            $(settings.info.tokens[i].el).addClass("hit-near");
                            break;
                        }
                        i--;
                    }
                }
            };
            var caretNearBracket = function(){
                //settings.info.caretLinePos actualy points to the next char
                if((fullText[settings.info.caretLinePos] === "{") || (fullText[settings.info.caretLinePos] === "}")){
                    return settings.info.caretLinePos;
                }
                if((fullText[settings.info.caretLinePos-1] === "{") || (fullText[settings.info.caretLinePos-1] === "}")){
                    return settings.info.caretLinePos - 1;
                }
                return null;
            };
            //remove/add caret near bracket awareness markers
            higlightHitOnBracket(caretNearBracket());
        },
        refreshCaretInfo: function(settings){
            this.blockHighlight(settings.info.cNode);
            this.lineHighlight(settings.info.cLine);
            if(settings.debug) console.log("[el:" + settings.info.el.hiddenEl.id + "] - Line:&nbsp;" + npDOMhelper.whichChild(settings.info.cLine) + "Caret block pos:&nbsp;" + settings.info.caretNodePos + "Caret line pos:&nbsp;" + settings.info.caretLinePos);
        },
        lineHighlight: function(el) {
            $(".sintaxLine",".npsyntaxeditor").removeClass("has-focus");
            $(el).addClass("has-focus");
        },
        blockHighlight: function(el) {
            $("span",".npsyntaxeditor").removeClass("has-focus");
            $(el).addClass("has-focus");
        },
        suggestionSelected: function(node,text){
            if($(node).hasClass("tag")){ //inside a <tag> node
                npDOMhelper.replaceNodeText(node,text);
            }
            if($(node).hasClass("vbas")){ //after a separator, tag <vbas>
                var nodeN = $(node).next()[0];
                if(nodeN && $(nodeN).hasClass("tag")){
                    npDOMhelper.replaceNodeText(nodeN,text);
                }else{
                    npDOMhelper.replaceNodeText(node,$(node).text()+text);
                }
            }
        },
        showAutocompleteDropdown: function(settings){
            var info = settings.info;
            var tags = settings.tags;
            var left = $(info.cNode).position().left;
            var top = $(info.cNode).position().top+$(info.cNode).height();
            var n = info.cNode;
            var html = '';
            var indexVal = 0;

            //find index value

            if($(n).hasClass("tag") && $(n).prev().hasClass("vbas") && $(n).prev().prev().hasClass("index"))
                indexVal = parseInt($(n).prev().prev().text());
            if($(n).hasClass("vbas") && $(n).prev().hasClass("index"))
                indexVal = parseInt($(n).prev().text());


            info.el.dropdown.style.left = left+"px";
            if(tags.length){
                tags.forEach(function (tag, idx) {
                    if((indexVal<=tag.range.maxIndex) && (indexVal>=tag.range.minIndex))
                        html += '<div class="text-suggestion"><div class="key-label">'+tag.key+'</div><div class="desc-label">'+tag.desc+'</div></div>';
                });
            }
            if(html === '') return;
            html = '<div class="text-list">' + html + '</div>';
            $(info.el.dropdown).empty().append(html).scrollTop(0).show();
            var delta = this.fixMenuPosition($(info.el.dropdown));
            info.el.dropdown.style.left = left-delta.x+"px";
            //select first option.
            $(".text-suggestion",$(info.el.dropdown)).first().addClass("selected");

            $(info.el.dropdown)
                .off("click")
                .on("click", ".text-suggestion", function(e){
                    e.preventDefault();
                    var tag = $(".key-label", $(this)).text();
                    ui.suggestionSelected(n,tag);
                    $(info.el.dropdown).trigger("npmenu:hide");
                    settings.info.setCaretInfo(npDOMhelper.getCaretPosition());
                    var fullText = $(info.el.editable).text();
                    parseOnce(settings, fullText, true);
                });

            $(info.el.dropdown)
                .off("npmenu:hide")
                .off("npmenu:pointerdown")
                .off("npmenu:pointerup")
                .off("npmenu:doselect")
                .one( "npmenu:hide", function( event ) {
                    $(this).hide();
                    $(document)
                        .off("mousedown", userMouseDownWhileMenu);
                })
                .on("mousedown", function(e){
                    e.preventDefault();
                    e.stopPropagation();
                })
                .on("npmenu:pointerdown", function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    nextOp = $(".selected",$(this)).next(".text-suggestion")[0];
                    if(nextOp){
                        $(".text-suggestion",$(this)).removeClass("selected");
                        $(nextOp).addClass("selected");
                        $(info.el.dropdown).animate({
                            scrollTop: ($(nextOp).position().top)
                        },0);
                    }
                })
                .on("npmenu:pointerup", function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    nextOp = $(".selected",$(this)).prev(".text-suggestion")[0];
                    if(nextOp){
                        $(".text-suggestion",$(this)).removeClass("selected");
                        $(nextOp).addClass("selected");
                        $(info.el.dropdown).animate({
                            scrollTop: ($(nextOp).position().top)
                        },0);
                    }
                })
                .on("npmenu:doselect", function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    nextOp = $(".selected",$(this))[0];
                    if(nextOp){
                        var tag = $(".key-label", $(nextOp)).text();
                        ui.suggestionSelected(n,tag);
                        $(info.el.dropdown).trigger("npmenu:hide");
                        settings.info.setCaretInfo(npDOMhelper.getCaretPosition());
                        var fullText = $(info.el.editable).text();
                        parseOnce(settings, fullText, true);
                    }
                });
            //intercept keydown while visible
            $(document)
                .on("mousedown", userMouseDownWhileMenu);
        }
    };
    var startAutocomplete = function(settings){
        var span = $("span.has-focus", $(settings.info.cLine));
        if(span && span.hasClass("tag")){
            if(settings.debug) console.log("autocomplete tags");
            ui.showAutocompleteDropdown(settings);
        }
        if(span && span.hasClass("vbas")){
            if(settings.debug) console.log("autocomplete tags after separator");
            ui.showAutocompleteDropdown(settings);
        }
    };

    var validateSyntaxLine = function(settings, nL){
        if(!settings.tags) return;
        aErrors = [];
        var onlyTags = settings.tags.map(function(tagObj) {return tagObj.key;});
        if (settings.info.tokens.length>0){
            var cbMark = {count:0,el:null};
            settings.info.tokens.forEach(function (token, i) {
                //check roles
                if(token.role){
                    if((token.role === "tag") && (onlyTags.indexOf(token.value) === -1)){
                        $(token.el).addClass("invalid");
                        aErrors.push({el:token.el, msg:"Invalid tag: " + token.value});
                    }
                    if((token.role === "index") && (parseInt(token.value)+"" !== token.value)){
                        $(token.el).addClass("invalid");
                        aErrors.push({el:token.el, msg:"Invalid integer for index value"});
                    }
                }
                //check code structure
                if(token.code === "vbsm"){ //check if { after $
                    if(!(settings.info.tokens[i+1] && (settings.info.tokens[i+1].code === "leftcb"))){
                        $(token.el).addClass("invalid");
                        aErrors.push({el:token.el, msg:"$ simbol must be followed by {"});
                    }
                }
                if(token.code === "leftcb"){ //check if $ before }
                    if (cbMark.count !== 0){
                        $(cbMark.el).addClass("invalid");
                        aErrors.push({el:cbMark.el, msg:"{ does not have a closing } before opening another {"});
                    }
                    cbMark.count = 1;
                    cbMark.el = token.el;

                    if(!(settings.info.tokens[i-1] && (settings.info.tokens[i-1].code === "vbsm"))){
                        $(token.el).addClass("invalid");
                        aErrors.push({el:token.el, msg:"$ simbol must be placed before a {"});
                    }
                }
                if(token.code === "rightcb"){ //check if {} pair are properli closed and balanced, nested {} not allowed
                    cbMark.count--;
                    if (cbMark.count < 0){
                        $(token.el).addClass("invalid");
                        aErrors.push({el:token.el, msg:"} is closing and unopened {"});
                    }
                }
            });
            if (cbMark.count !== 0){
                $(cbMark.el).addClass("invalid");
                aErrors.push({el:cbMark.el, msg:"Unbalanced {}, check your expresion."});
            }
        }

        if(aErrors.length>0){
            var onlyErrorMsgs = aErrors.map(function(errObj){return errObj.msg;});
            var htmlErrors = "<p>" + onlyErrorMsgs.join("</p><p>") + "</p>";
            $(settings.info.el.errorBody).html(htmlErrors);
            $(settings.info.el.error).show();
        }else{
            $(settings.info.el.errorBody).empty();
            $(settings.info.el.error).hide();
        }
        return aErrors;
    };

    var parseOnce = function(settings, txt, focused){
        settings.info.tokens = compose(_tkn.parseRoles,_tkn.tokenize)(txt);

        var currentLScroll = $(settings.info.cLine).scrollLeft();
        $(settings.info.el.editable).empty();
        var nL = ui.appendFragmentToEl(ui.renderTokensFragment(settings.info.tokens),settings.info.el.editable);
        $(nL).scrollLeft(currentLScroll);
        var nodesText = npDOMhelper.traverseNodes(settings.info.el.editable);
        var caretNodeData = npDOMhelper.computeCaretNodeAndPosition(nodesText, settings.info.caretLinePos);
        if(focused){
            npDOMhelper.setCaretTo(caretNodeData.node,caretNodeData.pos, settings.info.el.editable);
            settings.info.setCaretInfo(npDOMhelper.getCaretPosition());
        }
        validateSyntaxLine(settings, nL);

        //update value in genuine element
        $(settings.info.el.hiddenEl).val(txt);
    };
    var autofill = {
        testChar: function(ch){
            if(ch === "$") return {seq: "{}", caretChange: 1, autocomplete: ""};
            if(ch === "{") return {seq: "}", caretChange: 0, autocomplete: ""};
            if(ch === ":") return {seq: "", caretChange: 0, autocomplete: "tag"};
            return {seq: "", caretChange: 0, autocomplete:""};
        },
        applySugg: function(settings,str, sugg){
            var stSplitted = npDOMhelper.splitStringAt(str, settings.info.caretLinePos);
            settings.info.caretLinePos += sugg.caretChange;
            return stSplitted[0] + sugg.seq + stSplitted[1];
        }
    };

    var userMouseDownWhileMenu = function(e){
        $(".npsyntaxeditordropdown:visible").trigger("npmenu:hide");
    };
    var userKeyDownWhileMenu = function(e){
        if ($(".npsyntaxeditordropdown:visible").length === 0) return false;
        if (e.keyCode === 27) { //ESC
            $(".npsyntaxeditordropdown:visible").trigger("npmenu:hide");
            return true;
        }
        if((e.key === "ArrowDown") || (e.key === "Down")){
            $(".npsyntaxeditordropdown:visible").trigger("npmenu:pointerdown");
            return true;
        }
        if((e.key === "ArrowUp") || (e.key === "Up")){
            $(".npsyntaxeditordropdown:visible").trigger("npmenu:pointerup");
            return true;
        }
        if(e.key === "Enter"){
            $(".npsyntaxeditordropdown:visible").trigger("npmenu:doselect");
            return true;
        }
        return false;
    };


    //start plugin
    jQuery.fn.npFileName = function( options ) {
        var defaults = {
            tags:[],
            submitOnEnter: true,
            debug: false
        };
        var settings = $.extend( {}, defaults, options );
        // events handler functions //
        var userKeyDown = function(e){
            if(settings.debug) console.log("k dn: "+e.key);
            if(userKeyDownWhileMenu(e)){
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey  &&  e.keyCode === 32) {  // CTRL + SPACE
                e.preventDefault();
                startAutocomplete(settings);
                return false;
            }
            if((e.key === "Enter") && settings.submitOnEnter){
                e.preventDefault();
                $(settings.info.el.editable).closest("form").submit();
                return false;
            }
            if(_tkn.isBannedKey(e.key)){
                e.preventDefault();
                return false;
            }
        };
        var userKeyUp = function(e){
            if(settings.debug) console.log("key up: "+e.key);
            if (!e.metaKey) {
                e.preventDefault();
            }
            //must exit event for ingnored keys both in keydown and keyup
            if(_tkn.isBannedKey(e.key)){
                e.preventDefault();
                return false;
            }


            settings.info.setCaretInfo(npDOMhelper.getCaretPosition());
            var fullText = this.innerText;
            if(_tkn.isNavKey(e.key) || _tkn.isModifierKey(e.key)){
            }else{
                var sugg = autofill.testChar(e.key);
                fullText = autofill.applySugg(settings,fullText, sugg);
                parseOnce(settings, fullText, true);
                if($(settings.info.cNode).hasClass("vbas")){
                    startAutocomplete(settings);
                }
            }
            ui.caretAwarenessTest(settings, fullText);
        };

        (function(element, settings){
            var genuineEl = element[0];
            var genuineElAttr = {name: genuineEl.name, value: genuineEl.value };
            var hiddenEl;
            if(settings.output){
                hiddenEl = $(settings.output);
            }else{
                hiddenEl = $("<input type='hidden' />").attr(genuineElAttr).insertBefore(genuineEl);
            }
            genuineElAttr.id = genuineEl.id;
            var htmlStr = '<div class="textviewWrapper"><div class="npsyntaxeditortooltip">!<div class="tooltiptext"></div></div><div class="npsyntaxeditor input form-control" spellcheck="false" contenteditable="true" role="textbox" dir="ltr" aria-multiline="false" aria-readonly="false"><div role="presentation" class="sintaxLine has-focus"><span class="ltr has-focus">'+genuineElAttr.value+'</span></div></div>'
                +'<div class="npsyntaxeditordropdown text-dropdown text-position-below"><div class="text-list"></div></div>'
                +'</div>';

            $(genuineEl).hide();
            var edtEl = $(htmlStr).insertBefore(genuineEl);
            $(genuineEl).remove();
            hiddenEl[0].id = genuineElAttr.id;

            settings.info = {
                setCaretInfo:null,
                tokens: null,
                cNode: undefined,
                cLine: undefined,
                //lineIndex: undefined,	blockIndex: undefined,
                caretNodePos: undefined,
                caretLinePos: undefined,
                el:{}
            };

            settings.info.el.error = edtEl[0].getElementsByClassName("npsyntaxeditortooltip")[0];
            settings.info.el.errorBody = settings.info.el.error.getElementsByClassName("tooltiptext")[0];
            settings.info.el.dropdown = edtEl[0].getElementsByClassName("text-dropdown")[0];
            settings.info.el.editable = edtEl[0].getElementsByClassName("npsyntaxeditor")[0];
            settings.info.el.hiddenEl = hiddenEl[0];
            settings.info.setCaretInfo = function(cp) {
                if(this.cNode !== cp.node){
                    $(settings.info.el.dropdown).trigger("npmenu:hide");
                }
                this.cNode = cp.node;
                this.cLine = cp.line;
                this.caretLinePos = cp.linePos;
                this.caretNodePos = cp.nodePos;
                ui.refreshCaretInfo(settings);
            };

            //bind event handlers
            $(settings.info.el.dropdown)
                .off("npmenu:hide");
            $(settings.info.el.editable)
                .bind("keydown", userKeyDown)
                .bind("keyup", userKeyUp)
                .bind("focus", function(){
                    $(this).addClass("has-focus");
                    parseOnce(settings, $(this).text(), true);
                    if($(settings.info.cNode).hasClass("vbas")){
                        startAutocomplete(settings);
                    }
                })
                .bind("blur", function(){
                    $(this).removeClass("has-focus");
                    $(".has-focus",$(this)).removeClass("has-focus");
                })
                .bind("mouseup", function(){
                    settings.info.setCaretInfo(npDOMhelper.getCaretPosition());
                });
            parseOnce(settings, $(settings.info.el.editable).text());
        })($(this), settings);
        return this;
    };

// -- functional programming compose -----------------------------------------------
    function compose() {
        var funcs = Array.prototype.slice.call(arguments).reverse();
        return function() {
            return funcs.slice(1).reduce(function(res, fn) {
                return fn(res);
            }, funcs[0].apply(undefined, arguments));
        };
    }
})(jQuery, window);

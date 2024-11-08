var defaultStyle = "dark-navy";
//Array.from is not supported in IE11
//The following lines will emulate an ES6's Array.from method.
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;

      var items = Object(arrayLike);

      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      var len = toLength(items.length);

      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}



// timer set as token expiration
var tokenTimer = setTimeout(function verifyTokenExpired(){
    var tokenKey = _settings.readCookie("tokenKey");
		if (tokenKey === "" || tokenKey == null) {
			$("body").empty();
			window.location = 'login.html';
        }
}, 1800*1000);

function ajaxGeneralCallFnc(url, data, type, dataType, contentType) {
    if (typeof contentType === "undefined"){
        contentType = "application/json";
    }
    var deferred = $.Deferred();
    $.ajax({
        cache  : false,
        url    : url, //compllete url (including baseRestApiURL)
        type   : type,
        data   : data,
        dataType: dataType,
        headers: {
            "Accept"      : "application/json",
            "Content-Type": contentType,
            "X-Auth-Token": window.tokenKey
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 400) {
                showMsg(typeof jqXHR.responseJSON === "undefined" ? textStatus : jqXHR.responseJSON.error, "FAILED");
            }else if (jqXHR.status === 401) {
                showMsg("Your session has expired or is invalid. Please log in again. Thank you.", "ERROR");
                $("body").empty();
				window.location = 'login.html';
            }  else if (jqXHR.status === 500) {
                showMsg("Please check your data and try again.", "ERROR");
            } else if (jqXHR.status === 406) {
                showMsg("Please check your data for inconsisntent attributes values.", "ERROR");
            }else if (jqXHR.status === 404) {
                showMsg("Page not found. Please try again.", "ERROR");
            } else {
                showMsg("Unknown error. Please try again.", "ERROR");
            }
            deferred.reject(jqXHR, textStatus, errorThrown);
        },
        success: function(response, textStatus, jqXHR) {
            deferred.resolve(response, textStatus, jqXHR);
        }
    });
    return deferred.promise();
}

//SHA256 password hash
function  passwordSHA(plaintextPass){
    var ASCII = {};
//Encodes byte array to ASCII string
    ASCII.encode = function(bytes) {
        var str = "";
        for (var i = 0; i < bytes.length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return str;
    };
//Decodes ASCII string to byte array
    ASCII.decode = function(str) {
        var bytes = [];
        for (var i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    };
    var Hex = {};
    Hex.map = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
//Encodes byte array to hex string
    Hex.encode = function(bytes) {
        var str = "";
        for (var i = 0; i < bytes.length; i++) {
            str += Hex.map[bytes[i] >> 4] + Hex.map[bytes[i] % 16];
        }
        return str;
    };
//Decodes hex string to byte array
    Hex.decode = function(str) {
        var bytes = [];
        for (var i = 0; i < Math.floor(str.length / 2); i++) {
            bytes.push((Hex.map.indexOf(str[i * 2]) << 4) + Hex.map.indexOf(str[i * 2 + 1]));
        }
        return bytes;
    };

    var Sha256 = {};
    Sha256.K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    Sha256.hash = function(message) {
        Sha256.H = [ 0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];
        //Preprocessing
        message = Sha256.preProcessing(message);
        //Split the message in 64 bytes long blocks
        message = Utilities.split(message, 64);
        //Process each block
        for (var i = 0; i < message.length; i++) {
            //Split the block in 4 bytes long words
            message[i] = Utilities.split(message[i], 4);
            //Convert the words from byte arrays to intagers
            for (var i2 = 0; i2 < message[i].length; i2++) {
                message[i][i2] = Utilities.bytesToInt(message[i][i2]);
            }
            //Extend the block's words
            message[i] = Sha256.extendBlock(message[i]);
            //Main loop
            Sha256.mainLoop(message[i]);
        }
        //Convert the words from intagers to 4 byte long byte arrays
        for (var i = 0; i < Sha256.H.length; i++) {
            Sha256.H[i] = Utilities.intToBytes(Sha256.H[i], 4);
        }
        return Utilities.join(Sha256.H);
    };
    Sha256.preProcessing = function(message) {
        //Get the original length of the message
        var messageLength = message.length;
        //Append one bit and seven 0s (byte 80 in base 16)
        message.push(0x80);
        //Append the minimum number of bytes 0 until the length of the message modulo 64 is equal 56
        while (message.length % 64 !== 56) {
            message.push(0x0);
        }
        //Append the length in bits of the original message as a 8 byte long intager
        message = message.concat(Utilities.intToBytes(messageLength * 8, 8));
        return message;
    };
    Sha256.extendBlock = function(words) {
        for (var i = 16; i < 64; i++) {
            words[i] = (words[i - 16] + Sha256.σ0(words[i - 15]) + words[i - 7] + Sha256.σ1(words[i - 2])) & 0xffffffff;
        }
        return words;
    };
    Sha256.mainLoop = function(words) {
        //Initialize variables
        var a = Sha256.H[0],
            b = Sha256.H[1],
            c = Sha256.H[2],
            d = Sha256.H[3],
            e = Sha256.H[4],
            f = Sha256.H[5],
            g = Sha256.H[6],
            h = Sha256.H[7],
            tmp0, tmp1;
        //Main loop
        for (var i = 0; i < 64; i++) {
            tmp0 = h + Sha256.Σ1(e) + Sha256.Ch(e, f, g) + Sha256.K[i] + words[i];
            tmp1 = Sha256.Σ0(a) + Sha256.Maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = d + tmp0 & 0xffffffff;
            d = c;
            c = b;
            b = a;
            a = tmp0 + tmp1 & 0xffffffff;
        }
        //Add the result of the loop to the hash's value's array
        Sha256.H[0] = (Sha256.H[0] + a) & 0xffffffff;
        Sha256.H[1] = (Sha256.H[1] + b) & 0xffffffff;
        Sha256.H[2] = (Sha256.H[2] + c) & 0xffffffff;
        Sha256.H[3] = (Sha256.H[3] + d) & 0xffffffff;
        Sha256.H[4] = (Sha256.H[4] + e) & 0xffffffff;
        Sha256.H[5] = (Sha256.H[5] + f) & 0xffffffff;
        Sha256.H[6] = (Sha256.H[6] + g) & 0xffffffff;
        Sha256.H[7] = (Sha256.H[7] + h) & 0xffffffff;
    };
    Sha256.RotR = function(input, places) {
        return (input >>> places) | (input << (32 - places));
    };
    Sha256.Σ0 = function(x) {
        return Sha256.RotR(x, 2) ^ Sha256.RotR(x, 13) ^ Sha256.RotR(x, 22);
    };
    Sha256.Σ1 = function(x) {
        return Sha256.RotR(x, 6) ^ Sha256.RotR(x, 11) ^ Sha256.RotR(x, 25);
    };
    Sha256.σ0 = function(x) {
        return Sha256.RotR(x, 7) ^ Sha256.RotR(x, 18) ^ (x >>> 3);
    };
    Sha256.σ1 = function(x) {
        return Sha256.RotR(x, 17) ^ Sha256.RotR(x, 19) ^ (x >>> 10);
    };
    Sha256.Ch = function(x, y, z) {
        return (x & y) ^ (~x & z);
    };
    Sha256.Maj = function(x, y, z) {
        return (x & y) ^ (x & z) ^ (y & z);
    };

    var Utilities = {};
    Utilities.split = function(input, size) {
        var output = [];
        while (input.length > 0) {
            output.push(input.splice(0, size));
        }
        return output;
    };
    Utilities.join = function(input) {
        var output = [];
        for (var i = 0; i < input.length; i++) {
            output = output.concat(input[i]);
        }
        return output;
    };
    Utilities.intToBytes = function(int, size) {
        var bytes = [];
        for (var i = size - 1; i >= 0; i--) {
            bytes[i] = int & 0xFF;
            int = int >> 8;
        }
        return bytes;
    };
    Utilities.bytesToInt = function(bytes) {
        var int = 0;
        for (var i = 0; i < bytes.length; i++) {
            int = int << 8;
            int += bytes[i];
        }
        return int;
    };
    Utilities.xorBytes = function(a, b) {
        for (var i = 0; i < a.length; i++) {
            a ^= b;
        }
        return a;
    };

return Hex.encode(Sha256.hash(ASCII.decode(plaintextPass)));
}


//geometry function for svg arc
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
    return d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
        //"L", x, y, "Z"
    ].join(" ");
}



var jsHashCode = function(str){
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

//array helper
function arrayDuplicateRemove(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item !== ary[pos - 1];
    })
}

function arrayIntersection(){ //usage var x = arrayIntersection([1,2,3],[2,3,4]);
    return Array.from(arguments).reduce(function(previous, current){
        return previous.filter(function(element){
            return current.indexOf(element) > -1;
        });
    });
}

//get query value from request
function jsGetUrlQueryValue (sVar) {
    return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

//datetime, string, from array.
function datetimeFromArray(arr){
    if(arr && (arr !== null) && (arr instanceof Array) ){
        //arr[6] = 0; //ignore miliseconds
        return arr.join(':');
    }else{
        return 'n/a';
    }
}

function niceIsoTime(t){
    if(t && (t !== null)){
        var mom = moment(t, "YYYY-MM-DDTHH:mm:ss.SSSSZ");
		
		return mom.format("YYYY-MM-DD HH:mm:ss");
    }else{
        return 'n/a';
    }
}





function timeAgoFromArray(arr){
    if(arr && (arr !== null) && (arr instanceof Array) ){
        arr[1]--;arr[6] = 0; //fix month, ignore miliseconds
        var dateAgo = moment.utc(arr);
        return moment(dateAgo).fromNow();
    }else{
        return 'unknown';
    }
}


//array from date(day to sec), uses moment.js
function arrayFromDatetime(){
    var arr = moment().toArray();
    //corect 0 based month
    arr[1]++;
    return arr.slice(0,6);
}

//array from date(day to sec), uses moment.js
/*function humanJavaDataType(str){
    var a= str.split(".");
    if(a.length>0){
        return a[a.length-1];
    }
    return "";
}*/

function humanFileSizeFromMB(size) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return size > 0 ? (size/Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['MB', 'GB', 'TB'][i] : '0 GB';
}
function humanFileSize(size) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return size > 0 ? (size/Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i] : '0 GB';
}
function getFileSizeAsGB(size){
    return ( size / Math.pow(1024, 3) ).toFixed(2) * 1 ;
}
function getFileSize(size,toUnit){
	var arrayOfUnits = ['B', 'KB', 'MB', 'GB', 'TB'];
	var sizeNumber = size.replace(/[^0-9.]/g,'');
	var sizeUnit = size.replace(/[0-9. ]/g,'');
	if (arrayOfUnits.indexOf(toUnit) > arrayOfUnits.indexOf(sizeUnit)) {
		var pow = arrayOfUnits.indexOf(toUnit) - arrayOfUnits.indexOf(sizeUnit);
		return ( sizeNumber / Math.pow(1024, pow) ).toFixed(2) * 1 ;
	} else {
		var pow = arrayOfUnits.indexOf(sizeUnit) - arrayOfUnits.indexOf(toUnit);
		return ( sizeNumber * Math.pow(1024, pow) ).toFixed(2) * 1 ;
	}
}

function unitTransform (fromUnit, toUnit, value) {
	var arrayOfUnits = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (arrayOfUnits.indexOf(toUnit) > arrayOfUnits.indexOf(fromUnit)) {
		var pow = arrayOfUnits.indexOf(toUnit) - arrayOfUnits.indexOf(fromUnit);
		return ( value / Math.pow(1024, pow) ).toFixed(2) * 1 ;
	} else {
		var pow = arrayOfUnits.indexOf(fromUnit) - arrayOfUnits.indexOf(toUnit);
		return ( value * Math.pow(1024, pow) ).toFixed(2) * 1 ;
	}
}

var _settings = {
    init: function() {
        var ck = document.cookie
    },
    // Cookies
    createCookie: function(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        else expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },
    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    eraseCookie: function(name) {
        this.createCookie(name, "", -1);
    },
    closeandremember: function(e) {
        this.hide(e);
        var date = new Date();
        date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
        //document.cookie = e + '=hide; expires=' + date.toGMTString() + '; path=/'
        document.cookie = e + '=hide; path=/'
    },
    chkCookie: function(e) {
        var filter = new RegExp('(?:(?:^|.*;\\s*)' + e + '\\s*\\=\\s*([^;]*).*$)|^.*$');
        return document.cookie.replace(filter, "$1");
    }
};

var _userPref = {
    getUserPreferences: function(id){
        //var username = _settings.readCookie("TaoUserName");
        return $.ajax({
            cache: false,
            url: baseRestApiURL + "user/"+id,
            dataType : 'json',
            type: 'GET',
            async: false,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        });

    },
    updateUserPreferences: function(data){
        $.ajax({
            cache: false,
            url: baseRestApiURL + "user/prefs",
            data:data,
            type: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Auth-Token": window.tokenKey
            }
        }).done(function (response) {
    
        }).fail(function (jqXHR, textStatus) {
                chkXHR(jqXHR.status);
        });
    }
};

function chkXHR(status, redirect){
    b = (typeof redirect !== 'undefined') ? redirect : true;
    var txtMsg = '';
    var txtAlert = '';
    if(status === 0){
        txtMsg = "<strong>A Communication failure occurred.</strong><br>Your request timed out. The Server may be busy, please try again later. Also check your Internet connection. If the problem persists contact your administrator to check if the service is running.<br><br>Thank you."
        txtAlert = "Your request timed out. Please check your Internet connection and retry the request!";
    }
    if(status === 401){
        txtMsg = "<strong>Your session has expired or is invalid.</strong><br> Please log in again.<br><br>Thank you."
        txtAlert = "Your session has expired or is invalid. Please log in again!";
    }
    if(status === 403){
        txtAlert = "403 - Forbidden: Server responded with access is denied message. You do not have permission to access the page using the credentials that you supplied!";
        txtMsg = "<strong>Forbidden: Server responded with access is denied message.</strong><br>You do not have permission to access the resource using the credentials that you supplied! Please log in again.<br><br>Thank you."
    }
    if(status === 200){
        txtMsg = "<strong>Your session has expired or is invalid.</strong><br> Please log in again.<br><br>Thank you."
        txtAlert = "Your session has expired or is invalid. Please log in again!";
        redirect = true;
    }
    //alert(txtAlert);
    if(redirect){
        _settings.createCookie("tokenKey",'');
        _settings.createCookie("userMatrix",'{}');
        _settings.createCookie("refreshToken","");
        _settings.createCookie("userRole","");
        _settings.createCookie("TaoUserId","");
        _settings.createCookie("TaoUserName","");
        _settings.createCookie("JSESSIONID","");
        window.location = 'login.html';
    }
    var html = '<div class="login-box error-msg-box collapse">\n' +
        '    <div class="login-logo">\n' +
        '        <b>TAO</b>\n' +
        '    </div><!-- /.login-logo -->\n' +
        '    <div class="login-box-body">\n' +
        '            <div class="callout callout-danger" role="alert" aria-atomic="true">\n' +
        '                <p>' + txtMsg + '</p>\n' +
        '            </div>\n' +
        '            <div class="row">\n' +
        '                <div class="col-xs-4">\n' +
        '                    <a href="sap.html"><button class="btn btn-primary btn-block btn-flat">Try again</button></a>\n' +
        '                </div><!-- /.col -->\n' +
        '            </div>\n' +
        '    </div><!-- /.login-box-body -->\n' +
        '</div>';
    $("body").empty().append(html);
    $(".login-box").fadeIn();
}

function chkTSRF(r){
    //TSRF = Tao Standard Rest Format
    //{"data":{},"message":null,"status":"SUCCEEDED"}
    if( r.status && (r.status === "SUCCEEDED") && r.data ){
        return r.data;
    }else{
        console.log('server said: API call did failed '+ r.message);
        return {};
    }
}

function initializeTagsInputAutocomplete(id, url){
	 $(id).tagsInput({
 		minChars:0,  // min number of characters
 		maxChars:null, // max number of characters
 		limit:null,// max number of tags
 		interactive: true, // allows new tags
 		placeholder: 'Add a tag', // custom placeholder
		   	autocomplete:{	   	
		   	    minLength: 2,
				source: function( request, response ) {
			        $.ajax({
			        	url: baseRestApiURL + url + "/tags",
			            dataType: "json",
			            contentType: "application/json; charset=utf-8",
					    headers: {
					         "Accept": "application/json",
					         "Content-Type": "application/json",
					         "X-Auth-Token": window.tokenKey
					    },
					    error : function (jqXHR, textStatus, errorThrown) {
	                        chkXHR(jqXHR.status);
	                    },
			            success: function( data ) {		
			            	var results = $.ui.autocomplete.filter(chkTSRF(data), request.term);
			    			response(results);
			            }
			          });
			        },
				focus: function(event, ui) {
					return false; // Prevent the widget from inserting the value.
				},
	            select: function( event, ui ) {
	                console.log( "Selected: " + ui.item.value + " aka " + ui.item.id );
	              }
				
			},
			unique: true,
			delimiter: ','
		});
 	
 	$(".ui-autocomplete").css({ "max-height": "400px", "overflow-y": "scroll", "overflow-x": "hidden","z-index":"1100"});
}

function openPolygonMap(mapContainer, footprintField) {
	var newfootprint = "";
	// Create simple window for map
	var $poly2D = $("<div class='for-poly2D' style='position:fixed;top:10%;left:10%;width:80%;height:80%;background-color:white;border:3px solid #3c8dbc;border-radius:10px;overflow:hidden'>" +
					"	<div class='content-header' style='height:45px;padding:10px 15px;position:absolute;top:0;left:0;width:100%'>" +
					"		<button type='button' class='close use-footprint' style='color:#cdcdcd'><span>&times;</span></button>" +
					"		<h1 class='modal-title' style='line-height:1em;font-size:24px;margin:0'>Map<small style='padding-left:4px'>Select your <strong>Region of Interest</strong>.</small></h4>" +
					"	</div>" +
					"	<div id='mapExtent' style='height:94%;height:calc(100% - 45px);position:relative;margin-top:45px'></div>" +
					"	<div style='height:55px;padding:10px 15px;position:absolute;bottom:0;left:0'>" +
					"		<button class='btn btn-primary btn-submit use-footprint' disabled >Use selected polygons</button>" +
					"	</div>" +
					"</div>");
	$(".use-footprint", $poly2D).on("click", function () {
		if ($(this).hasClass("btn-submit") && newfootprint !== footprintField.val()) {
			if (footprintField.is("select") && typeof footprintField.data("select2") !== "undefined") {
				var newOption = new Option(newfootprint, newfootprint, false, true);
				footprintField.append(newOption).trigger("change");
			} else {
				footprintField.val(newfootprint).trigger("change");
			}
		}
		$(this).closest(".for-poly2D").remove();
	});
	mapContainer.append($poly2D);
	
	var olPoly = $("#mapExtent", mapContainer).poly2D({ maxFeaturesNo: 1, defaultFootprint: (footprintField.val() !== null ? footprintField.val() : "")});
	$.when(olPoly).done(function (result) {
		window.myPolygonMap = result;
		window.myPolygonMap.fitAllFeatures();
		window.myPolygonMap.el.on("newfootprint", function (evt, footprint) {
			/*footprintField.val(footprint);
			footprintField.trigger("change");*/
			newfootprint = footprint;
			if (footprint !== "") {
				$(".btn-submit.use-footprint", $poly2D).prop("disabled", false);
			}
		});
	});
}
function closePolygonMap() {
	if (typeof window.myPolygonMap !== "undefined") {
		window.myPolygonMap.container.closest(".for-poly2D").remove();
		delete window.myPolygonMap;
	}
}

//UI loading indicator management
function contentLoading(action){
	var taoLoadingDiv = $("#myModalLoading",window.parent.jQuery(window.parent.document));
	if(action === "show"){			
		taoLoadingDiv.modal('show');			
	}
	if(action === "hide"){
		setTimeout(function(){
			taoLoadingDiv.modal('hide');
		}, 100);
	}
}

// get available sites list
var getAvailableSites = function () {
	return $.ajax({
		cache: false,
		url: baseRestApiURL + "site/",
		dataType : 'json',
		type: 'GET',
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
			"X-Auth-Token": window.tokenKey
		}
	});
}

// get parameters enums as map and populate specific dropdown
function populateDataTypeSelect($selectElem){
	var optionList;
	var optionsMap = getTaoEnumsMap("JavaType");

	$.each(optionsMap, function(index, obj) {
		if( obj.key.toUpperCase() !== "DATA_FORMAT" && obj.key.toUpperCase() !== "SENSOR_TYPE" ) {
			optionList += '<option value="' + obj.value + '">' + obj.value + '</option>'; //parameter data type can be equal with object value (the key is not used)
		}
	});
	$("option", $selectElem).remove();
	$selectElem.html(optionList);
}

function populateSelectElem($selectElem,enumType){
	var optionList;
	var userTypeOptions = getTaoEnumsMap(enumType);

	$.each(userTypeOptions, function(index, obj) {
		optionList += '<option value="' + obj.key + '">' + obj.value + '</option>'; 
	});
	$("option", $selectElem).remove();
	$selectElem.html(optionList);
}

function getTaoEnumsMap(name) {
	var retVal = [];
	$.each(taoEnums.data, function (index, enm) {
		if (index.toLowerCase().indexOf(name.toLowerCase()) >= 0) {
			$.each(enm, function (idx, values) {
				retVal.push(values);
			});
		}
	});
	return retVal;
}
function removeClassStartingWith($element, filter) {
    $element.removeClass(function (index, className) {
        return (className.match(new RegExp("\\S*" + filter + "\\S*", 'g')) || []).join(' ')
    });
    return $element;
};

function inputRangeColor (color) {
	switch (color) {
      case "navy": return "#00587a"; break;
      case "black": return "#25131b"; break;
      case "blue": return "#2e6da4"; break;
      case "green": return "#006d34"; break;
      case "purple": return "#523c90"; break;
      case "red": return "#830000"; break;
      case "yellow": return "#e57c00"; break;
      default: return "#d3d3d3";
    }
}

function checkIfOldVersion() {
	return taoVersion < taoReferenceVersion;
}
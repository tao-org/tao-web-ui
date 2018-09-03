
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
        while (message.length % 64 != 56) {
            message.push(0x0);
        }
        //Append the length in bits of the original message as a 8 byte long intager
        message = message.concat(Utilities.intToBytes(messageLength * 8, 8));
        return message;
    }
    Sha256.extendBlock = function(words) {
        for (var i = 16; i < 64; i++) {
            words[i] = (words[i - 16] + Sha256.σ0(words[i - 15]) + words[i - 7] + Sha256.σ1(words[i - 2])) & 0xffffffff;
        }
        return words;
    }
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
    }
    Sha256.RotR = function(input, places) {
        return (input >>> places) | (input << (32 - places));
    }
    Sha256.Σ0 = function(x) {
        return Sha256.RotR(x, 2) ^ Sha256.RotR(x, 13) ^ Sha256.RotR(x, 22);
    }
    Sha256.Σ1 = function(x) {
        return Sha256.RotR(x, 6) ^ Sha256.RotR(x, 11) ^ Sha256.RotR(x, 25);
    }
    Sha256.σ0 = function(x) {
        return Sha256.RotR(x, 7) ^ Sha256.RotR(x, 18) ^ (x >>> 3);
    }
    Sha256.σ1 = function(x) {
        return Sha256.RotR(x, 17) ^ Sha256.RotR(x, 19) ^ (x >>> 10);
    }
    Sha256.Ch = function(x, y, z) {
        return (x & y) ^ (~x & z);
    }
    Sha256.Maj = function(x, y, z) {
        return (x & y) ^ (x & z) ^ (y & z);
    }

    var Utilities = {};
    Utilities.split = function(input, size) {
        var output = [];
        while (input.length > 0) {
            output.push(input.splice(0, size));
        }
        return output;
    }
    Utilities.join = function(input) {
        var output = [];
        for (var i = 0; i < input.length; i++) {
            output = output.concat(input[i]);
        }
        return output;
    }
    Utilities.intToBytes = function(int, size) {
        var bytes = [];
        for (var i = size - 1; i >= 0; i--) {
            bytes[i] = int & 0xFF;
            int = int >> 8;
        }
        return bytes;
    }
    Utilities.bytesToInt = function(bytes) {
        var int = 0;
        for (var i = 0; i < bytes.length; i++) {
            int = int << 8;
            int += bytes[i];
        }
        return int;
    }
    Utilities.xorBytes = function(a, b) {
        for (var i = 0; i < a.length; i++) {
            a ^= b;
        }
        return a;
    }

return Hex.encode(Sha256.hash(ASCII.decode(plaintextPass)));
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
        return arr.join(':');
    }else{
        return 'unknown';
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
function humanJavaDataType(str){
    var a= str.split(".");
    if(a.length>0){
        return a[a.length-1];
    }
    return "";
}

function humanFileSize(size) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
function getFileSizeAsGB(size){
    return ( size / Math.pow(1024, 3) ).toFixed(2) * 1 ;
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

function chkXHR(status, redirect){
    b = (typeof redirect !== 'undefined') ? redirect : true;
    if(status === 0){
        alert("Your request timed out. Please check your Internet connection and retry the request!");
        return 0;
    }
    if(status === 401){
        alert("Your session has expired or is invalid. Please log in again!");
    }
    if(status === 403){
        alert("403 - Forbidden: Server responded with access is denied message. You do not have permission to access the page using the credentials that you supplied!");
    }

    if(redirect){
        window.location = 'login.html';
    }
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
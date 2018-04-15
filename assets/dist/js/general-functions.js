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
        return !pos || item != ary[pos - 1];
    })
}

function arrayIntersection(){ //usage var x = arrayIntersection([1,2,3],[2,3,4]);
    return Array.from(arguments).reduce(function(previous, current){
        return previous.filter(function(element){
            return current.indexOf(element) > -1;
        });
    });
};

//get query value from request
function jsGetUrlQueryValue (sVar) {
    return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function datetimeFromArray(arr){
    if(arr && (arr !== null) && (arr instanceof Array) ){
        return (arr[0]+"-"+arr[1]+"-"+arr[2]+" "+arr[3]+":"+arr[4]+":"+arr[5]);
    }else{
        return 'unknown';
    }
}

var _settings = {
    init: function() {
        var ck = document.cookie
    },
    // Cookies
    createCookie: function(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";

        document.cookie = name + "=" + value + expires + "; path=/";
    },
    readCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
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
        //var myCookie = document.cookie.replace(/(?:(?:^|.*;\s*)_inf_ADM2015\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        var myCookie = document.cookie.replace(filter, "$1");
        return myCookie;
    }
};

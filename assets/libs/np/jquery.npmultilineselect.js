/*!
 * npMultilineSelect jQueryUI extended component
 *
 * Copyright  CS ROMANIA, http://c-s.ro
 *
 * Licensed under the ....;
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 */

var npMultilineSelect = $.widget("ui.npMultilineSelect", $.ui.selectmenu, {
    _renderButtonItem: function( item ) {
        var buttonItem = $( "<span>", {
            "class": "ui-selectmenu-text"
        });
        var dna = item.element.data( "payload" );
		if (typeof dna !== "undefined") {
			this._setText( buttonItem, dna.id );
		}

        return buttonItem;
    },
    _renderItem: function( ul, item) {
        var li = $( "<li>" );
        var wrapper = $( "<div>", {
            "class": "ui-selectmenu-menu-item-w"
        } );
        if(item.index % 2){
            wrapper.addClass( "ui-selectmenu-menu-item-odd" );
        }
        if ( item.disabled ) {
            li.addClass( "ui-state-disabled" );
        }

        $( "<div>", {
            text: item.label,
            "class": "ui-selectmenu-menu-item-header"
        })
            .appendTo( wrapper );

        var body = $( "<div>", {
            "class": "ui-selectmenu-menu-item-content"
        });

        var dna = item.element.data( "payload" );
        if(dna && dna.cpu){
            $( "<span>", {
                text: "CPU: "+dna.cpu,
            }).appendTo( body );
        }
        if(dna && dna.memory){
            $( "<span>", {
                text: "memory: "+dna.memory,
            }).appendTo( body );
        }
        if(dna && dna.disk){
            $( "<span>", {
                text: "disk: "+dna.disk,
            }).appendTo( body );
        }
        if(dna && dna.swap){
            $( "<span>", {
                text: "swap: "+dna.swap,
            }).appendTo( body );
        }
        body.appendTo( wrapper );
        return li.append( wrapper ).appendTo( ul );
    }
});

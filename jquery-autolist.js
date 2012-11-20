(function( $ ) {

    $.fn.autolist = function(options) {
        var $wrap = false;
        var $this = this;
        var $ul = false;
        var $input = false;
        var $values = [];
        var $remove = false;
        var settings = {
            json:   false,
            width:  'auto'
        };

        var _uid = function() {
            if (typeof jQuery._$uid == 'undefined')
                jQuery._$uid = Math.random() && 0x10000;

            return ++jQuery._$uid;
        };

        var _update = function() {
            $values = [];
            $this.find('option').each(function() {
                if ($(this).prop('selected') == true) return;
                $values.push({
                    'value' : this.value,
                    'label' : this.text,
                    'uniqid': $(this).attr('id')
                });
            });

            $input.autocomplete('option', {
                'source': $values
            });
        };

        var _insert = function(uniqid, label) {

            $this.find('#' + uniqid).prop('selected', true);

            $('<a />').prependTo(
                $('<li />').text(label)
                           .addClass('ui-autolist-selected ui-helper-reset ui-corner-all ui-state-default')
                           .addClass(uniqid)
                           .attr('uniqid', uniqid)
                           .appendTo($ul)
            )
				      .addClass('ui-autolist-remove ui-helper-reset ui-corner-all ui-icon ui-icon-circle-close')
                      .attr('uniqid', uniqid)
                      .bind('click', function() {
                           var uniqid = $(this).attr('uniqid');
                           _remove(uniqid);
            });
            $input.css('left', $ul.width() + 'px');

            _update();
        };

        var _remove = function(uniqid) {
            $this.find('#' + uniqid).prop('selected', false);
            $wrap.find('.' + uniqid).remove();
            $input.css('left', $ul.width() + 'px').focus();

            _update();
        };

        var _load = function() {
            if (settings.json == false) {
                _init();
                return;
            }

            $this.children().remove();
            $.getJSON( settings.json, function(ret) {
                $(ret).each(function() {
                    $('<option />').attr( 'value', this.value )
                                   .prop( 'selected', ($this.check ? true : false) )
                                   .text( this.label )
                                   .appendTo( $this );
                });

                _init();
            } );
        };

        var _init = function() {

            $wrap = $('<div />').addClass('ui-widget ui-widget-content ui-corner-all ui-autolist');
            $ul = $('<ul />').addClass('ui-helper-reset ui-autolist-values')
                             .prependTo($wrap);

            $this.after($wrap);

            $input = $('<input />').addClass('ui-helper-reset ui-widget ui-autolist-input')
                                   .bind('keydown', function(e) {
                                        if (e.keyCode == 13) return false;
                                        if ( (e.keyCode == 8) && $ul.children().length && (!$(this).val().length) ) {
                                            if ($remove !== false) {
                                                _remove($remove);
                                                $remove = false;
                                            } else {
                                                var last = $ul.children().last();
                                                last.addClass('ui-state-hover');
                                                $remove = last.attr('uniqid');
                                            }
                                            return;
                                        }
                                        $remove = false; 
                                        $ul.children().last().removeClass('ui-state-hover');
                                    });

            $this.find('option').each(function() {
                var uniqid = _uid();
                $(this).attr('id', 'jqal_' + uniqid);

                if ($(this).prop('selected') == false) return;

                _insert('jqal_' + uniqid, this.text);

            });

            $input.autocomplete({
                       'source': $values,
                       'select': function( e, ui ) {
                           _insert(ui.item.uniqid, ui.item.label);
                           $(this).val('');
                           return false;
                       },
                       'focus': function( event, ui ) {
                           $(this).val( ui.item.label );
                           return false;
                       }
                   })
                  .prependTo(
                       $wrap.bind('click', function() {
                           $input.focus();
                       })
                   );

            $input.data('autocomplete')
                  ._renderItem = function( ul, item ) {
                       if ($('#' + item.uniqid).prop('selected') == true) return false;
                       return $( "<li></li>" ).data( "item.autocomplete", item )
                                              .append( "<a>" + item.label + "</a>" )
                                              .appendTo( ul );
                   };

            $wrap.width(settings.width);

			_update();
        };

        if (options) {
            $.extend( settings, options );
        }

        $this.addClass('ui-helper-hidden');

        _load();        
    };
})( jQuery );
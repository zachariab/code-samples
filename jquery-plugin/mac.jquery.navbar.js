;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "MacNavbar",
        defaults = {
            autoLoadSelector:   "#sideNav",
            closeSelector:      "#menuClose",
            openSelector:       "#menuOpen",
            navOpenClass:       "nav-open",
            ancestorSelector:   "body"
        };

    // plugin constructor, called once per matching element
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {

        init: function() {
            //  this.element / this.options
            this.closeButton = $(this.options.closeSelector);
            this.openButton = $(this.options.openSelector);
            this.ancestorElem = $(this.options.ancestorSelector);
            this.isOpen = false;
            this.menuId = $(this.element).attr("id");
            this.bindEvents();
        },
        bindEvents: function(el, options) {
            $(this.closeButton).bind("click", $.proxy(this.close, this));
            $(this.openButton).bind("click", $.proxy(this.toggle, this));
            $(document).bind("click", $.proxy(this.bodyClick, this));
        },
        open: function(e) {
            if (!this.isOpen) {
                this.ancestorElem.addClass(this.options.navOpenClass);
                this.isOpen = true;
            }
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        close: function(e) {
            if (this.isOpen) {
                this.ancestorElem.removeClass(this.options.navOpenClass);
                this.isOpen = false;
            }
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        toggle: function(e) {
            if (this.isOpen)
                this.close(e);
            else
                this.open(e);
        },
        bodyClick: function(e) {
            if (this.isOpen) {
                if (!$(e.target).closest("#" + this.menuId).length) {
                    this.close(e);      
                }
            }
        }

    };

    // prevent multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new Plugin( this, options ));
            }
        });
    };

    // Auto-attach if autoLoadSelector exists in document
    $(defaults.autoLoadSelector).each(function () {
      var $nav = $(this)
      $.fn[pluginName].call($nav, $nav.data());
    })

})( jQuery, window, document );
;(function(Backbone, _) {

    var map = {};
    Backbone.ViewManager = {
        register: function (key, impl) {
            key && (map[key] = impl);
        },
        get: function (key) {
            return (map[key] || Backbone.View);
        }
    };


    var extend = Backbone.View.extend;
    Backbone.View.extend = function (protoProps, staticProps) {
        var child = extend.apply(this, arguments);
        if(protoProps.vtype && !_.isString(protoProps.vtype)) {
            throw new Error('vtype must be a string');
        }
        Backbone.ViewManager.register(protoProps.vtype, child);
        return child;
    };
    
    Backbone.View = Backbone.View.extend({
        
        // array of views or a single view
        views : null,

        isRendered: false,

        initialize: function () {
            this.views = this.options.views || this.views;
            this.views = _.result(this, 'views');

            if(this.autoRender || this.options.autoRender) {
                this.render();
            }
            return this;
        },

        // beforeRender is an empty function by default. Override it with your own
        // before render logic.
        beforeRender: function() {},

        // render handles rendering of child views.
        render: function () {
            this.viewsConfig = this.views ? [].concat(this.views) : [];

            this.beforeRender();

            for (var i = 0; i < this.viewsConfig.length; i++) {
                var viewsConfig = this.viewsConfig[i],
                    vtype = viewsConfig.vtype,
                    viewInstance;

                if(vtype) {
                    if(_.isString(vtype)) {
                        var impl = Backbone.ViewManager.get(vtype);
                        viewInstance = new impl(viewsConfig);
                    }
                    else {
                        viewInstance = new viewsConfig.vtype(viewsConfig);
                    }
                    viewInstance.render();
                    this.$el.append(viewInstance.el);
                }
            }
            this.isRendered = true;
            
            this.afterRender();
            return this;
        },

        // afterRender is an empty function by default. Override it with your own
        // after render logic.
        afterRender: function() {}
    });

})(Backbone, _);

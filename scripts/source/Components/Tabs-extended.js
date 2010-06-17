MUI.extend({
	Tabs: {	  instances:      new Hash(),
	}	
});	


MUI.Tabs = new Class({

	Implements: [Events, Options],

	options: {
        id : '',
        tabIds : [],
        defaultContentOptions : {
            element: $empty,
            url : '',
            },
    },
    
    initialize: function(options) {
        this.setOptions(options);		
        
        // Shorten object chain
        var options = this.options;
        MUI.initializeTabs(this.options.id);
    },
    
    hasTab: function(tabId) {
        return this.options.tabIds.contains(tabId);
    },
    
    addTab: function(tabOptions, contentOptions) {
        //console.log("Add Tab");
        
        if (!this.hasTab(tabOptions.id)) {
            
            var newTab = new Element('li', {
            'id': tabOptions.id, 
            'html' : '<a>' + tabOptions.title + '</a>',
                }
            );
            
            newTab.addEvent('click', function(e){
                this.selectTab(newTab);
                
                //console.warn("Merge:");
                //console.log(this.options.defaultTabOptions);
                //console.log(contentOptions);
                
                options = $merge(this.options.defaultTabOptions, contentOptions);
                //console.log(options);
                MochaUI.updateContent(options);
            }.bind(this));
            
            this.options.tabIds.include(tabOptions.id);
            newTab.inject($(this.options.id));
        }
    },
    
    removeTab: function(id) {
        //console.log("removeTab function: " +id);
        this.options.tabIds.erase(id);
        //console.log($(id));
        $(id).destroy();
    },
    
    selectTab: function(tab) {
        MUI.selected(tab, $(this.options.id));
    },
});

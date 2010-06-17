DMXDeviceForm = new Class({
    Implements: [Events, Options],
    
    options: DMX.Devices.options,   //Use options from DMXDevice.js
    
    channelTypes: ['red', 'green', 'blue', 
                   'strobo', 'misc' 
                   ],
    
    sliders: [],
    sliderUpdateEnabled: true,
    
    initialize: function(device){
        oldNum = 0;

        this.showForm(device);
    },
    
    showForm: function(device){
        var currentFormular = this;
        MUI.updateContent({
                'element':  $('dmxSplitWindow_index'),
                'url':      'plugins/dmxdevices/form.html',
                'onContentLoaded' : function() {
                    currentFormular.initFormular();
                    if (device) currentFormular.fillFormular(device.options);
                }
        })
    },
    
    initFormular: function() {
        console.log("Init formular");
        select = $('dmxEcmdDevice');
        
        NetIO.Devices.instances.each(
            function(instance){
                options = instance.options;
                option = new Element('option', {
                                'text' : options.title,
                                'value' : options.id,
                });
                select.grab(option);
            }
        );
        
        $('dmxFormDelete').addEvent('click', function(e){
            
        }.bind(this));
        $('dmxFormSave').addEvent('click', function(e){
            this.submitFormular();
        }.bind(this));
        
        $('dmxStartchannel').addEvent('change', function(e){
            if (this.sliderUpdateEnabled){
            value = $('dmxStartchannel').value.toInt();
            console.log("set startchannel to: " +value);
                if ($chk(value)) {
                    if (value >= 0 || value < 512) {
                        this.updateSliders(value);
                    }
                }
            }
        }.bind(this));
        
        $('dmxChannels').addEvent('change', function(e){
            value = $('dmxChannels').value.toInt();
            if (!value) {
                MUI.notification("Bitte Zahl eingeben!"); 
            } else if (value < 1 || value > 512) {
                MUI.notification("Zahl zwischen 1 und 512 eingeben!"); 
            }
            else {
                this.updateChannelSelectors(value);
            }
            
        }.bind(this));
        
        console.log("init formular ende");
        this.initSliders();
    },
    
    initSliders: function() {
        var dmxForm = this;
        this.sliders = new Array();
        $$('div.dipSlider').each(function(el, i){
            var slider = new Slider(el, el.getElement('.knob'), {
                steps: 1,
                snap: true,
                mode: 'vertical',
                onChange: function(){
                    if (dmxForm.sliderUpdateEnabled) {
                        dmxForm.updateStartchannel();
                    }
                }
            }).set(0);
            el.addEvent('keyup', function(e){
                console.warn("CLICK");
                new Event(e).stop();
                if (slider.step==1) slider.set(0);
                else slider.set(1);
            });
            
            this.sliders.push(slider);
        }.bind(this));
    },
    
    updateStartchannel: function() {
        var value = 0;
        this.sliders.each(function(slider, i) {
            value += Math.pow(2, i) * slider.step;
        });
        $('dmxStartchannel').value = value;
    },
    
    updateSliders: function(val) {
        binary = val.toString(2);
        this.sliderUpdateEnabled = false;
        this.sliders.each(function(slider, i) {
            var index = binary.length-1 - i;
            slider.set((binary.charAt(index) != '') ? binary.charAt(index) : 0);
        });
        this.sliderUpdateEnabled = true;
    },
    
    fillFormular: function(options) {
        //console.log("Fill Form");
        //console.log(options);
        $('dmxId').value            = options.id;
        $('dmxTitle').value         = options.title;
        $('dmxEcmdDevice').value    = options.ecmdDevice;
        $('dmxStartchannel').value  = options.startchannel;
        $('dmxChannels').value      = options.channels;

        this.updateChannelSelectors(options.channels, options.channelConfig);
        this.updateSliders(options.startchannel.toInt());
        /*
        $$('select[name=chanselect]').each(function(cs) {
            options.channelConfig.push(cs.value);
        });
        */
    },
    
    updateChannelSelectors: function(num, values) {
        selectDiv = $('channelSelectDiv');
        //console.log("num: " +num);
        //console.log("oldNum: " +oldNum);
        
        if (oldNum < num) {
            select = new Element('select', {
                        'name' : 'chanselect',
            });
            this.channelTypes.each(function(type) {
                option = new Element('option', {
                                'text' : type,
                                'class' : "option_"+type,
                                'value' : type,
                                'selected' : false
                });
                select.grab(option);
            });
            
            //add additional selectors:
            for (var i=oldNum+1; i <= num; i++) {
                newSelect = select.clone();
                newSelect.set('id', 'cs'+i);
                newSelect.grab(new Element('option', {
                            'text' : 'Ch: ' +i,
                            'class' : 'option_c',
                            'value' : -1,
                            'selected' : true,
                    }), 'top');
                    
                //if channelSelector values is passed: set the specific options as selected
                if (values) {       //current Value is at: values[i-1]
                    index = this.channelTypes.indexOf(values[i-1]);
                    newSelect.getChildren()[index+1].setProperty('selected', true);
                } 

                selectDiv.grab(newSelect);
            }
        }
        else if (oldNum > num) {
            //remove selectors:
            for (var i=oldNum-1; i >= num; i--) {
                selectDiv.getChildren()[i].dispose();;
            }
        }
        oldNum = num;
    },
    
    submitFormular: function() {
        var options = {};
        console.log("DMX ID:");
        console.log($('dmxId'))
        if ($('dmxId').value) {
            options.id = $('dmxId').value;
            console.log($('dmxId').value);
        }
        options.title = $('dmxTitle').value;
        options.ecmdDevice = $('dmxEcmdDevice').value;
        options.startchannel = $('dmxStartchannel').value;
        options.channels = $('dmxChannels').value;
        options.channelConfig=[];
        $$('select[name=chanselect]').each(function(cs) {
            options.channelConfig.push(cs.value);
        });
        console.warn("submitFormular with options:");
        console.log(options);
        
        newDevice = new DMX.Device(options);
        MUI.dmxdevicesWindow.menu.updateTree();
        
        MUI.updateContent({
            element: $('dmxSplitWindow_index'),
            url: 'plugins/dmxdevices/index.html',
            onContentLoaded: function() {
                
                $('deviceAdd').addEvent('click', function(e){
                    new Event(e).stop();
                    new DMXDeviceForm();
                });
            },
        });
        
        new MUI.DMXSliderWindow({
                id: newDevice.options.id+'_Slider',
                title: newDevice.options.title,
                width: 550,
                height: 300,
                maximizable: false,
                resizable: false,
                onContentLoaded: function() {
                    this.initializeSliders();
                },
                dmxdevice: newDevice,
            });
    }
    
    
});

dmxDevicesMenu = new Class({
    
    tree : $empty,
    
    initialize: function(){
        this.tree = $('devices_treemenu');
        console.log("new Treemenu");
        this.initMenutree();
        
        if (buildTree) buildTree('devices_treemenu');
    },
    
    initMenutree : function() {
        var list = new Array();
        var withoud_id = new Element('ul');
        span = new Element('span').appendText("[device missing]");
        li_unknown = new Element('li', {
                    'class' : "folder f-open"
                });
        span.inject(li_unknown);
        withoud_id.inject(li_unknown);
        
        NetIO.Devices.instances.each(
            function(instance){
                //console.log(instance);
                options = instance.options;
                id = options.id;
                var li_main = new Element('li', {
                    'class' : "folder f-open"
                });
                var span = new Element('span').appendText(options.title + " ("+id+")");
                var ul = new Element('ul');
                
                span.inject(li_main);
                li_main.inject($('devices_treemenu'));
                ul.inject(li_main);
                list[id] = ul;
            }
        );
        
        console.log("foreach DMX Device");
        //console.log(DMX.Devices.instances);
        DMX.Devices.instances.each(
            function(instance){
                options = instance.options;
                id = options.id;
                
                //console.log("add dmxdevice to menu:");
                //console.log(instance);
                
                var li_sub = new Element('li', {
                    'id' : id =  + "_Link",
                    'class' : 'doc',
                    'events': {
                        'click': function(){
                            new DMXDeviceForm(instance);
                            /*
                            MUI.updateContent({
                                element: $('dmxSplitWindow_mainColumn'),
                                url: 'plugins/dmxdevices/form.html',
                                onContentLoaded: function() {
                                    new DMXDeviceForm(dmxdevice);
                                }
                            });*/
                        },
                    },
                });
                var span = new Element('span').appendText(options.title);
                span.inject(li_sub);
                ecmdId = instance.getEcmdDevice().options.id;

                if (list[ecmdId]) {
                    li_sub.inject(list[ecmdId]);
                }
                else {
                    //todo: add "without_id"
                    li_sub.inject(withoud_id);
                    console.warn("ECMD Device is unknown: " +ecmdId);
                    console.log(without_id);
                    withoud_id.inject($('devices_treemenu'));
                }
            }
        );
        
        console.log("foreach DMX Device ENDE");
        
    },
    
    updateTree: function() {
        this.tree.empty();
        this.initMenutree();
        if (buildTree) buildTree('devices_treemenu');
    }
});

/*

Script: Modal.js
	Create dmx device slider window

Copyright:
	Copyright (c) 2010 Sascha Riedinger, <http://problemloeser.org/>.	

License:
	MIT-style license.	

Requires:
	Core.js, Window.js

See Also:
	<Window>	
	
*/

ChannelSlider = new Class({
    Extends: Slider,
    
    options: {
        channel: 0,
		steps: 255,
        initStep: 255,
        snap: true,
        wheel: true,
        mode: 'vertical',
	},	
    
    initialize: function(el, knob, options) {
        this.parent(el, knob, options);
    },
});

MUI.files[MUI.path.source + 'Window/dmxslider.js'] = 'loaded';

MUI.DMXSliderWindow = new Class({

	Extends: MUI.Window,
	
    sliders: [],
    
    autoUpdate: false,
    
	//options: {
	//	type: 'modal'
	//,	
	
	initialize: function(options){
        console.warn("DMX SLIDER WINDOW");
		this.device = options.dmxdevice;
        //this.initializeSliders();
		this.parent(options);
    },
    
    initializeSliders: function() {
        console.log("initializeSliders");
        
        wrapperEl = new Element('div', {
                                'class' : 'dmxSliderWrapper',
                });
        
        sliderEl = new Element('div', {
                                'class' : 'dmxSlider',
                });
        knobEl = new Element('div', {
                                'class' : 'knob',
                });
        sliderEl.inject(wrapperEl);
        knobEl.inject(sliderEl);
        
        windowContent = $(this.device.options.id+'_Slider_content');
        console.warn(windowContent);
        
        var current = this;
        for (var i = 0; i < this.device.options.channels; i++) {
            var el = sliderEl.clone();
            //el.setProperties('id', 'dmxSlider'+i);
            //console.log(this);
            el.inject(windowContent);
            var chan = i+this.device.options.startchannel.toInt();
            
            var slider = new ChannelSlider(el, el.getElement('.knob'), {
                channel: chan,
                onChange: function(step){
                    step = 255-step;
                    //console.log("OnChange: DMX Value changed for slider (channel)" + this.options.channel + " value: " + step);
                    current.onChange();
                }.bind(this)
            }).set(255);
            
            this.sliders.push(slider);
        }
        this.autoUpdate = true;
        console.log("initializeSliders ENDE");
    },
    
    onChange: function() {
        if (this.autoUpdate) {
            values = "";
            this.sliders.each(function(sl) {
                values += " "+(255-sl.step)
            });
            var startchan = this.sliders[0].options.channel-1;
            var cmd = "dmx set6chan " +startchan+""+values;

            this.device.sendECMD(cmd);
        }
    }
    
});

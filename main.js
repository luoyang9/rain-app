var context = new (window.AudioContext || window.webkitAudioContext)();
var irHall;
var numLoad = 2;

function loadAudio( object, url) {

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            object.buffer = buffer;
            numLoad--;
            if(numLoad == 0) $("#darkoverlay").fadeOut();
        });
    }
    request.send();
}

function addAudioProperties(object) {
    object.name = object.id;
    object.source = $(object).data('sound');
    loadAudio(object, object.source);
    object.volume = context.createGain(); // new line
    object.loop = false;
    object.reverb = false;
    object.reverbInit = false;
    object.toggle = function () {
        if(object.s)
        {
            console.log('stop');
            object.s.stop();
        } 
        else
        {
            var s = context.createBufferSource();
            s.buffer = object.buffer;
            s.connect(object.volume);
            if (this.reverb === true) { //if reverb on
                if(!this.reverbInit){
                    this.convolver = context.createConvolver();
                    this.convolver.buffer = irHall.buffer;
                    this.reverbInit = true;
                }
                this.volume.connect(this.convolver);
                this.convolver.connect(context.destination)
            } else if (this.convolver) { //if reverb off and convolver is connected
                this.volume.disconnect(0);
                this.convolver.disconnect(0);
                this.volume.connect(context.destination);
                this.reverbInit = false;
            } else { //just connect volume to speaker
                this.volume.connect(context.destination);
            }
            s.loop = object.loop;
            s.start(0);
            object.s = s;
        }
    }
    object.stop = function () {
    }
}

function reverbObject(url)
{
    this.source = url;
    loadAudio(this, url);
}

$(function() {
    irHall = new reverbObject('http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2014/08/1407409273irHall.ogg');

	$('#sp div').each(function() {
	    addAudioProperties(this);
	});

	$('#sp div').mousedown(function() {
        this.toggle();
	});

	$('.cp input').change(function(){

        var v = $(this).parent().data('pad');
        var pad = $('#' + v)[0];

        switch ($(this).data('control')) 
        {
            case 'gain':
                pad.volume.gain.value = $(this).val();
                break;
            default:
                break;
        }
    });

    $('.cp button').click(function() {
        var v = $(this).parent().data('pad');
        var toggle = $(this).text();
        var pad = $('#' + v)[0];
        $(this).text($(this).data('toggleText')).data('toggleText', toggle);
        ($(this).val() === 'false') ? $(this).val('true') : $(this).val('false');

        switch ($(this)[0].className) 
        {
            case 'loop-button':
                pad.stop();
                pad.loop = ($(this).val() == 'false') ? false : true;
                break;
            case 'reverb-button':
                pad.stop();
                pad.reverb = ($(this).val() == 'false') ? false : true;
                break;
            default:
                break;
        }           
    });
});
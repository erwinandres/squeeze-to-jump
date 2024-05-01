(function() {
  'use strict';

  function Sprite(url, pos, size, speed, frames, dir, once) {
      this.pos = pos;
      this.size = size;
      this.speed = typeof speed === 'number' ? speed : 0;
      this.frames = frames;
      this._index = 0;
      this.url = url;
      this.dir = dir || 'horizontal';
      this.once = once;
  };

  Sprite.prototype = {
    update: function(dt) {
        this._index += this.speed*dt;
    },

    render: function(ctx) {
      var frame;

      if(this.speed > 0) {
        var max = this.frames.length;
        var idx = Math.floor(this._index);
        frame = this.frames[idx % max];

        if(this.once && idx >= max) {
          this.done = true;
          return;
        }
      }
      else {
        frame = 0;
      }


      var x = this.pos[0];
      var y = this.pos[1];

      if(this.dir == 'vertical') {
          y += frame * this.size[1];
      }
      else {
        x += frame * this.size[0];
      }

      ctx.drawImage(
        resources.get(this.url),
        x, y,
        this.size[0], this.size[1],
        0, 0,
        this.size[0], this.size[1]
      );
    }
  };

  window.Sprite = Sprite;






  var resourceCache = {};
  var loading = [];
  var readyCallbacks = [];

  // Load an image url or an array of image urls
  function load(urlOrArr) {
      if(urlOrArr instanceof Array) {
          urlOrArr.forEach(function(url) {
              _load(url);
          });
      }
      else {
          _load(urlOrArr);
      }
  }

  function _load(url) {
      if(resourceCache[url]) {
          return resourceCache[url];
      }
      else {
          var img = new Image();
          img.onload = function() {
              resourceCache[url] = img;
              
              if(isReady()) {
                  readyCallbacks.forEach(function(func) { func(); });
              }
          };
          resourceCache[url] = false;
          img.src = url;
      }
  }

  function get(url) {
      return resourceCache[url];
  }

  function isReady() {
      var ready = true;
      for(var k in resourceCache) {
          if(resourceCache.hasOwnProperty(k) &&
              !resourceCache[k]) {
              ready = false;
          }
      }
      return ready;
  }

  function onReady(func) {
      readyCallbacks.push(func);
  }

  window.resources = { 
      load: load,
      get: get,
      onReady: onReady,
      isReady: isReady
  };




  function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
  }

  BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
      // Asynchronously decode the audio file data in request.response
      loader.context.decodeAudioData(
        request.response,
        function(buffer) {
          if (!buffer) {
            alert('error decoding file data: ' + url);
            return;
          }
          loader.bufferList[index] = buffer;
          if (++loader.loadCount == loader.urlList.length)
            loader.onload(loader.bufferList);
        },
        function(error) {
          console.error('decodeAudioData error', error);
        }
      );
    }

    request.onerror = function() {
      alert('BufferLoader: XHR error');
    }

    request.send();
  }

  BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
  }

  window.BufferLoader = BufferLoader;
})();

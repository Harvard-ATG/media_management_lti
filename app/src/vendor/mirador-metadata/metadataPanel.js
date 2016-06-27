(function(M) {

  M.prototype.metadataPlugin = function(){
    var mirador = this;

    mirador.eventEmitter.subscribe('WINDOW_ELEMENT_UPDATED', function(event, data){
      var windowId = data.windowId;

      // get the metadata
      var manifestUri = mirador.viewer.data[0].manifestUri;
      var metadatas = [];
      $.getJSON(manifestUri, function(data) {
        metadatas = data.sequences[0].canvases;
      });

      mirador.eventEmitter.subscribe('currentCanvasIDUpdated.' + windowId, function(event, data){
        var imageId = data;

        var $sidePanel = $('.sidePanel .tabContentArea');
        metadatas.forEach(function(item){
          if(item['@id'] == imageId){
            //item.label
            var html = '<b>' + item.label + '</b><br/>';
            if(item.metadata){
              item.metadata.forEach(function(md){
                //md.label
                //md.value
                md.value = md.value || "No value";
                html += md.label + ': ' + md.value + '<br/>';
              });
            }
            $sidePanel.html(html);
          }
        });

      });
    });


  };

})(Mirador);

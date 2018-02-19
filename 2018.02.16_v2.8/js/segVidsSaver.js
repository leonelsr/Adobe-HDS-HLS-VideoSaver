if (window.location.href.indexOf('chrome-extension:') !== -1 && window.location.href.indexOf('download.html') !== -1) {

chrome.storage.local.get(null, function(items) {   
    if (items.slices) {   
        
        var ind = 0;
        
        for  (var key in items.slices) {
            if (items.slices[key].length > 0) {
                      
                // adobe HDS streaming videos
                if(items.videoType === 'hds') {
                    
                    (function(key) {
                        // get info from the manifest
                        $.ajax({
                            type: "GET",
                            url: key,
                            dataType: 'xml',  
                            success: function (obj, textstatus) {
                                try {
                                    
                                    const simpleXmlObj = utils.simplexml_load_string(obj);  
                                    const manifestXml = obj.children[0];
                                    adobe.parseManifest(simpleXmlObj, manifestXml, key);                                   
                                   
                                    for (let i = 0; i < F4F.HDS.getMediaLength(); i++) {
                                        let curMediaItem = F4F.HDS.getMediaArray()[i];
                                        //debugger;
                                        
                                        (function(curMediaItem) {
                                            
                                            let a = document.createElement('a');
                                            a.title = curMediaItem[1].url + ' (bitrate: ' + curMediaItem[0] + ')';
                                            a.text = curMediaItem[1].url + ' (bitrate: ' + curMediaItem[0] + ')';
                                            
                                            
                                            a.onclick = function() {                                            
                                                
                                                F4F.HDS.clearPrevInfo();
                                                adobe.downloadFragments(obj, curMediaItem);                       
                                            };
                                            


                                            document.getElementById('hlsLinks').appendChild(a);
                                            updateHTML.addBR(2, 'hlsLinks');
                                            
                                        })(curMediaItem);
                                    }

                                    F4F.HDS.clearMediaArray();
                                   
                                }
                                catch(e) {
                                    debugger;   
                                }

                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {    
                                debugger;
                            }
                        });

           
                    })(key);
                }
        
                // apple HLS streaming videos
                else if (items.videoType === 'hls' && key.indexOf('.f4m') === -1){ 
                    
                    ind++;

                    var contDiv = document.createElement('div');
                    contDiv.className = 'ac';
                    contDiv.id = 'cont_div';
                    document.getElementById('hlsLinks').appendChild(contDiv);
                    
                    var name = document.createElement('p');
                    name.textContent = key;
                    name.className = 'ac-q hls-vid-header';
                    contDiv.appendChild(name);
                                       
                    var linksDiv = document.createElement('div');
                    linksDiv.id = 'links-div-' + ind;
                    linksDiv.className = 'ac-a';
                    contDiv.appendChild(linksDiv);
                    
                    for (var i = 0; i < items.slices[key].length; i++) {
                    
                        var a = document.createElement('a');                       
                        
                        var linkName = '';                    
                        if (items.slices[key][i].resolution) {                            
                            linkName +='RESOLUTION: ' + items.slices[key][i].resolution + ',    ';
                        }
                        linkName += 'URL: ' + items.slices[key][i].url;
                        a.title = linkName;
                        a.text = linkName;

                        a.onclick = window.adobeHdsHlsVideoSaver.downloadSlices.bind(null, {
                            /*slices: items.slices,*/
                            url: items.slices[key][i].url
                        });

                        linksDiv.appendChild(a);
                        updateHTML.addBR(2, 'links-div-' + ind);
                    }
                }
            }
        }
        
        
    
        var accordion = new Accordion("#hlsLinks", {
            duration:   600,
            closeOthers:  true,
            showFirst:    false,
            containerClass: 'hls-videos-container',
            elementClass:    'ac',
            questionClass:     'ac-q',
            answerClass:     'ac-a'
        });
    }
});
}


var setUp = function() {
    if (document.getElementById('hlsClearBtn')) {
        document.getElementById('hlsClearBtn').onclick = function () {
            document.getElementById('hlsMain').innerHTML = "";        
            chrome.storage.local.remove('slices');
            chrome.extension.sendMessage({type: "urls", value: []});
            chrome.extension.sendMessage({type: "slices", value: {}});
            chrome.extension.sendMessage({type: "manifestUrls", value: {}});
        };
    }
};

document.addEventListener('DOMContentLoaded', setUp);
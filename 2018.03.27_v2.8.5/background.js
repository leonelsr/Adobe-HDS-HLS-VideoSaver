var callRemote = function(url, cb) {      
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {    
            cb(xhr.responseText);            
        }
    }
    xhr.send();
}


var manifestUrls = {};
var urls = [];
var slices = {};
var videoType = "";

chrome.extension.onMessage.addListener(function(request, sender, send_response) {
    if (request.type === "urls") {
    	urls = request.value;        
	}
    if (request.type === "slices") {
    	slices = request.value;        
	}
    if (request.type === "manifestUrls") {
    	manifestUrls = request.value;        
	}
});



var processData = function(details, regex) {
    if (urls.indexOf(details.url) === -1) {           
       
        urls.push(details.url);
    
    
        var urlObj = new URL(details.url);        

        callRemote(details.url, function(resp) {
                    

            slices[details.url] = [];             

            var match = regex.exec(resp);
            //if (!match)
               // match = regex2.exec(resp);

            while(match != null) {
                // remove the first '/' in the matched url
                if (match[1] && match[1].indexOf('/') == 0)
                    match[1] = match[1].substr(1, match[1].length);


                var wholeURL;

                // if m3u8 contains fully functional urls, use them, otherwise combine the biggest part
                // of the details.url with what m3u8 contains
                // deal with possible overlay (when both details.url and match[1] contain same parts)
                if (match[1].indexOf('http://') != -1 || match[1].indexOf('https://') != -1) {
                    wholeURL = match[1];
                }
                else {
                    var firstURLPart = urlObj.origin;

                    var urlPartsArr = urlObj.pathname.split('/');
                    // last part not needed
                    urlPartsArr.pop();

                    var matchPartsArr = match[1].split('/');

                    for (var i = 0; i < urlPartsArr.length; i++) {
                        if (urlPartsArr[i] == "") continue;
                        if (urlPartsArr[i] != matchPartsArr[0]) {
                            firstURLPart += '/' + urlPartsArr[i];
                        }
                        else {
                            break;
                        }
                    }


                    wholeURL = firstURLPart + "/" + match[1];
                }

                slices[details.url].push(wholeURL);                    
                match = regex.exec(resp);
            }

            chrome.tabs.executeScript(null, {code: "var urls = " + urls + ", var slices = " + slices + ";"}, function() {
                chrome.storage.local.set({ 'slices': slices, 'videoType': videoType }, function() {    
                }); 
            });          

        });            
    }
};


var replacePartialURLs = function(manifestUrls) {   
        
    for (var key in manifestUrls) {
        var curManif = manifestUrls[key];

        if (curManif.length > 0) {

            if (curManif[0].url.indexOf('http://') != -1 || curManif[0].url.indexOf('https://') != -1) {  
                continue;
            }

            
            var correctPartURL;
            for (var i = 0; i < curManif.length; i++) {  

                var urlWithoutToken = curManif[i].url.match(/.+\.m3u8/)[0];
                if (urlWithoutToken) {
                    //var foundURLPart = urlObj.href.match(urlWithoutToken); 
                    let ind = key.indexOf(urlWithoutToken);

                    if (ind !== -1) {
                        correctPartURL = key.slice(0, ind);                                 
                    }
                    // for dynamically created URLs (f.ex. https://www.tvr.bzh)
                    else {
                        correctPartURL = key.slice(0, key.lastIndexOf("/") + 1);
                    }
                    break;
                }

            }

            if (correctPartURL) {
                for (var j = 0; j < curManif.length; j++) {  
                    curManif[j].url = correctPartURL + curManif[j].url;
                }
            }
                  
        }
    }    
};


var processDataHLS = function(manifestUrls) {
    
    var manifFound = false;
    
    //search for parent manifest videos
    for (var key in manifestUrls) {
        if (manifestUrls[key].length > 0 && manifestUrls[key][0].isMaster) {
            slices[key] = manifestUrls[key]; 
            manifFound = true;            
        }
    }
    
    // if no manifest vids - add manifests of a particular video that the user started playing
    if (!manifFound) {
        Object.keys(manifestUrls).forEach(function(key,index) {

           if (manifestUrls[key].length > 0) { 
                slices[key] = manifestUrls[key]; 
            }
        });
    }
    
    chrome.tabs.executeScript(null, {code: "var slices = " + slices + ";"}, function() {
        chrome.storage.local.set({ 'slices': slices, 'videoType': videoType }, function() {    
        }); 
    });      
};


chrome.webRequest.onCompleted.addListener(function(details) {
    
    var extensionMatch = details.url.match(/\.([^\./\?]+)($|\?)/);
    var extension;
    
    if (extensionMatch) {
        extension = extensionMatch[1];
        
        var regex, regex2;
    
        // m3u8 (apple) videos
        if(extension.indexOf('m3u8') !== -1) {
            
            if (!manifestUrls[details.url]) {
                // read master m3u8
                callRemote(details.url, function(resp) {
                    
                    // list of objects [RESOLUTION, URL]
                    var resolutionAndURLsList = [];
                    
                    var videoInfoRegex = /EXT-X-STREAM-INF:(.+RESOLUTION=(\d+x\d+))?.*(?:\n|\r\n)(.+\.m3u8.*)/gi; 
                    var match = videoInfoRegex.exec(resp);  
                                       
                    while (match) {
                        
                        var curResAnURLObj = {};
                        curResAnURLObj.isMaster = true;
                        
                        // resolution
                        if (match[2]) {
                            curResAnURLObj.resolution = match[2];
                        }
                        // URL
                        if (match[3]) {
                            curResAnURLObj.url = match[3];
                        }
                        
                        resolutionAndURLsList.push(curResAnURLObj);                        
                        match = videoInfoRegex.exec(resp);
                    }
                    
                    var manifestVidRegex = /#EXTINF:.+(?:\n|\r\n)(.+)/gi;
                    var match2 = resp.match(manifestVidRegex);
                    var urlObj; 
                    if (match2) {
                        urlObj = new URL(details.url);
                        // parent manifest absent
                        resolutionAndURLsList.push({'resolution': null, 'url': details.url});                        
                    }                    
                                        
                    manifestUrls[details.url] = resolutionAndURLsList;
                    replacePartialURLs(manifestUrls);
                });
            }

            videoType = 'hls';
            processDataHLS(manifestUrls);
        }
        // f4f (adobe) videos
        else if(extension.indexOf('f4m') !== -1) {

            videoType = 'hds';
            regex = /url="(.*?)"/gi;
            if (regex) {
                processData(details, regex);
            }
        }
        
    }
    

}, {
    urls: ["<all_urls>"]
});

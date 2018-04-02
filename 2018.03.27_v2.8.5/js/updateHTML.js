(function (uH) {
   
    var mainP;
    var progressBars = [];
        
    updateHTML.showProgressWindow = function(partCount) {
        mainP = document.createElement('p');
        mainP.innerHTML = 'Parts to download: ' + partCount;
        document.getElementById('hlsProcess').className = 'hlsProcessClass';
        document.getElementById('hlsProcess').appendChild(mainP);        
    };
    
    
    updateHTML.initProgressBar = function(max, val, num) {
        
        if (!progressBars[num]) {
            var partSpan = document.createElement('span');
            partSpan.innerHTML = 'part ' + num + '&nbsp;&nbsp;&nbsp;';

            var progress = document.createElement('progress');
            progress.max = max;
            progress.value = val;
            progressBars[num] = progress;

            partSpan.appendChild(progress);            
            document.getElementById('hlsProcess').appendChild(partSpan);
            var br = document.createElement('br');
            document.getElementById('hlsProcess').appendChild(br);

            // Automatically scroll to the bottom of the progress div
            document.getElementById('hlsProcess').scrollTo(0,document.getElementById('hlsProcess').scrollHeight);
        }
        else {
            progressBars[num].value = val;
        }
    };
    
    updateHTML.startProgressBar = function(e, num) {
        
        if (progressBars[num]) {
            progressBars[num].value = 0;
        }
    };
    
    updateHTML.endProgressBar = function(val, num) {
        if (progressBars[num]) {
            progressBars[num].value = val;
        }
    };
    
    updateHTML.successProgressBar = function(num) {
        if (progressBars[num]) {
            progressBars[num].classList.remove('red');
        }
    }

    updateHTML.displayAllDone = function() {
        var partSpan = document.createElement('span');
        partSpan.innerHTML = 'All parts downloaded.';
        document.getElementById('hlsProcess').appendChild(partSpan);
    };
    
    updateHTML.errorProgressBar = function(num) {
        if (progressBars[num]) {
            progressBars[num].classList.add('red');
        }
    };
    
    updateHTML.addBR = function(count, cont_name) {
        for (var i = 0; i < count; i++) {
            var br = document.createElement('br');
            document.getElementById(cont_name).appendChild(br);
        }
    };
    
    updateHTML.clearProgressPanel = function() {
        document.getElementById('hlsProcess').innerHTML = "";
    };
    
    
})(this.updateHTML = {});
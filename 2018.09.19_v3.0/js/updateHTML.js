(function (uH) {   
    
    var progressBars = [];
        
    updateHTML.showProgressWindow = function(partCount) {
        //let partsDiv = document.createElement('div');
        //partsDiv.className = "row mt-4";
        
        document.getElementById('numOfPartsDiv').innerHTML = '';
        
        let mainP = document.createElement('p');
        mainP.className = "badge badge-secondary";
        mainP.innerHTML = 'Parts to download: ' + partCount;
        
        //partsDiv.appendChild(mainP);
        
        document.getElementById('hlsProcess').className = 'container';
        document.getElementById('numOfPartsDiv').appendChild(mainP);        
    };
    
    
    updateHTML.initProgressBar = function(max, val, num) {
        
        if (!progressBars[num]) {
            let partDiv = document.createElement('div');
            partDiv.className = "row";
            
            let partDivCol = document.createElement('div');
            partDivCol.style="width:250px;";
            partDivCol.className = "column";
            
            let partSpan = document.createElement('span');
            partSpan.innerHTML = 'part ' + num;
            partSpan.className = "small";
            partDivCol.appendChild(partSpan);

            var progress = document.createElement('progress');
            progress.max = max;
            progress.value = val;
            progress.className = "float-right ml-3";
            progressBars[num] = progress;
            partDivCol.appendChild(progress);  
            
            partDiv.appendChild(partDivCol);
            document.getElementById('hlsProcess').appendChild(partDiv);
//            var br = document.createElement('br');
//            document.getElementById('hlsProcess').appendChild(br);

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
        let allPartsDiv = document.createElement('div');
        allPartsDiv.className = "row mt-4";
        
        let partSpan = document.createElement('span');
        partSpan.className = "small";
        partSpan.innerHTML = 'All parts downloaded.';
        allPartsDiv.appendChild(partSpan);
        
        document.getElementById('hlsProcess').appendChild(allPartsDiv);
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
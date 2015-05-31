var videoItems = document.querySelector('.videoItems');
var clickSearch = document.querySelector('.submitSearch');
var inputString = document.querySelector('.inputSearch');
var pageToken = '';
var searchString = '';

clickSearch.onclick = function() {
	doSearch();
}

inputString.onkeydown = enterDown;
inputString.focus();

function enterDown(e) {
    e = e || window.event;
    if(e.keyCode === 13) {
        clickSearch.click();
    }
}

function doSearch() {
    removeChilds(document.querySelector('.dots'));
    videoItems.innerHTML = '';
    pageToken = ''

	if (inputString.value === '') {
		return;
	} else {
        dotsToStart();
        videoItems.addEventListener('mousedown',dragStart);
        videoItems.addEventListener('mouseup',dragEnd);  
        searchString = inputString.value;
        getResponse(searchString, pageToken);
    }
}

function removeChilds (node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function loadPages () {
    getResponse(searchString, pageToken); 
}


function getResponse(searchString, pageToken) {
    var APIkey = 'AIzaSyBtEdPEv4Diqrkyg9mRT2M-KjLfu_0qjCk';
    var url = 'https://www.googleapis.com/youtube/v3/search?pageToken=' + pageToken + '&part=snippet&q=' + searchString + '&maxResults=20&key=' + APIkey;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var clipList = convertYouTubeResponseToClipList(JSON.parse(xhr.responseText));
            doInnerContent(clipList);
        }
    }
    xhr.open("GET", url, true);
    xhr.send(null);
}


function doInnerContent (clipList) {
    var loadBlock = document.createElement('div');
    loadBlock.className = 'loadBlock';
    videoItems.appendChild(loadBlock);
    var videosId = '';
    for (var i = 0; i < 20; ++i) {
        if (i !== 0) {
            videosId = videosId + ',' + clipList[i].id;
        } else {
            videosId = clipList[i].id;
        }
        var newDiv = document.createElement('div');
        newDiv.className = 'v' + (i+1) + ' ' + 'video';
        newDiv.innerHTML = '<div class=youtubeLink><a href='+clipList[i].youtubeLink+'>'+clipList[i].title+'</a></div>'+
                         '<div class=thumbnail style='+'background-image:url('+clipList[i].thumbnail+')></div>'+
                         '<div class=author>'+'<p>'+'<b>Author: </b>'+clipList[i].author+'</p>'+'</div>'+
                         '<div class=description>'+'<p>'+'<b>Description: </b>'+clipList[i].description+'</p>'+'</div>'+
                         '<div class=publishDate>'+'<p>'+'<b>Publication date: </b><br>'+clipList[i].publishDate+'</p>'+'</div>'+
                         '<div class=countOfViews><p></p><span><b>Count of views: </b></span></div>';
        loadBlock.appendChild(newDiv);
    }
    loadCountOfViews(videosId);    
}

function loadCountOfViews (videosId) {
    var APIkey = 'AIzaSyBtEdPEv4Diqrkyg9mRT2M-KjLfu_0qjCk';
    var url = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + videosId + '&key=' + APIkey;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var countOfViews = [];
            var items = JSON.parse(xhr.responseText).items;
            var lastLoadBlock = videoItems.lastChild;
            var countOfViews = lastLoadBlock.querySelectorAll('.countOfViews');
            for (var i = 0; i < items.length; ++i) {
                countOfViews[i].innerHTML += '<span>'+items[i].statistics.viewCount+'</span>';
            }
        }
    }
    xhr.open("GET", url, true);
    xhr.send(null);
}

function convertYouTubeResponseToClipList(rawYouTubeData) {
	var clipList = [];
    var items = rawYouTubeData.items;
    pageToken = rawYouTubeData.nextPageToken;
    for (var i = 0; i < items.length; i++) {
    	var date = new Date(Date.parse(items[i].snippet.publishedAt));
        var shortId = items[i].id.videoId;
        clipList.push({
           	 id: shortId,    
             youtubeLink: "http://www.youtube.com/watch?v=" + shortId,
             title: items[i].snippet.title,
             thumbnail: items[i].snippet.thumbnails.medium.url,
             description: items[i].snippet.description,
             author: items[i].snippet.channelTitle,
             publishDate: date.toUTCString()
        });
    }
   	return clipList;
}

var previousDiffX;
var diffX;
var dragX;
var startX;
var currentPage;
var numOfPageLoaded;
var primaryWidthStage = document.body.offsetWidth;

function dragStart(e){
    videoItems.style.transition = "all 0.0s ease-in-out"
    startX = e.clientX;
    videoItems.addEventListener('mousemove',drag);
}

function drag(e){
    dragX = e.clientX;
    diffX = dragX - startX;
    videoItems.style.webkitTransform = "translateX(" + (diffX + previousDiffX) + "px)";
}

function dragEnd(e){
    videoItems.removeEventListener('mousemove',drag);   
    videoItems.style.transition = "all 0.5s ease-in-out 0s";

    var endOfVideos = 100;
    if (getTypeResolution(document.body.offsetWidth) === 2) {
        endOfVideos = endOfVideos * 2;
    } else if (getTypeResolution(document.body.offsetWidth) === 1) {
        endOfVideos = endOfVideos * 4;
    }

    if (currentPage === numOfPageLoaded && currentPage !== endOfVideos) {
        numOfPageLoaded = numOfPageLoaded + 5;
        loadPages();
    }

    if (Math.abs(diffX) < 100) {
        videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
    }

    if (diffX < -100) {
        if (currentPage !== endOfVideos) {
            previousDiffX = previousDiffX - document.body.offsetWidth;
            videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)"; 
            currentPage = currentPage + 1;
        } else {
            videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
        
        }
    } 

    if (diffX > 100) {
        if (currentPage !== 1) {
            previousDiffX = previousDiffX + document.body.offsetWidth;
            videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
            currentPage = currentPage - 1;
        } else {
            videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
        } 
    }
    changeDotWithSliding();
}

function dotsToStart () {
    currentPage = 1;
    previousDiffX = 0;
    numOfPageLoaded = 5;
    primaryWidthStage = document.body.offsetWidth;
    videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
    innerDots();
}

function innerDots () {
    var dots = document.querySelector('.dots');
    dots.innerHTML = '<ul><li class=current><div class=tooltip>1</div><a></a></li>'+
                     '<li><div class=tooltip>2</div><a></a></li>'+
                     '<li><div class=tooltip>3</div><a></a></li>'+
                     '<li><div class=tooltip>4</div><a></a></li>'+
                     '<li><div class=tooltip>5</div><a></a></li><li><div class=tooltip></div></li></ul>';
    onClickDots ();
    changeDotWithSliding();
}

function changeDotWithSliding () {
    var arrDots = document.querySelectorAll('li');
    for (var i = 0; i < arrDots.length - 1; ++i) {
        if (arrDots[i].className === 'current') {
            arrDots[i].classList.remove('current');
        }
    }
    arrDots[(currentPage - 1) % 5].className = 'current';
    
    var arrTooltips = document.querySelectorAll ('.tooltip');
    var tooltipPage = (Math.floor((currentPage - 1)  / 5) + 1) * 5;
    for (var i = arrDots.length - 2; i !== -1; --i) {
        arrTooltips[i].innerHTML = tooltipPage;
        --tooltipPage;
    }
    arrTooltips[arrDots.length - 1].innerHTML = document.querySelector('.current .tooltip').innerHTML;
}

function onClickDots () {
    var arrDots = document.querySelectorAll('li');
    for (var i = 0; i < arrDots.length - 1; ++i) {
        arrDots[i].onclick = onclickDotsEvent;
    }
};

function culcPrevCurrentDot () {
    var arrDots = document.querySelectorAll('li');
    for (var i = 0; i < arrDots.length - 1; ++i) {
        if (arrDots[i].className === 'current') {
            var prevCurrentDot = i;
            arrDots[i].classList.remove('current');
        }
    }
    return prevCurrentDot;    
}

function onclickDotsEvent (e) {
    var prevCurrentDot = culcPrevCurrentDot();
    this.className = 'current';
    var arrDots = document.querySelectorAll('li');
    videoItems.style.transition = "all 0.5s ease-in-out 0s";
    for (var i = 0; i < arrDots.length - 1; ++i) {
        if (arrDots[i].className === 'current') {
            if (i - prevCurrentDot > 0) {
                previousDiffX = previousDiffX - document.body.offsetWidth * (Math.abs(i - prevCurrentDot));
                videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
                currentPage = currentPage + (Math.abs(i - prevCurrentDot));
            } else {
                previousDiffX = previousDiffX + document.body.offsetWidth * (Math.abs(i - prevCurrentDot));
                videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
                currentPage = currentPage - (Math.abs(i - prevCurrentDot));
            }
        }
    }
    changeDotWithSliding ();
}

window.onresize = function() {
    var currentResolutionType = getTypeResolution(primaryWidthStage);
    var newResolutionType = getTypeResolution(document.body.offsetWidth);
    videoItems.style.transition = "all 0.2s ease-in-out 0s";

    var deltaDisplayTypes = Math.abs(currentResolutionType - newResolutionType);
    if ( deltaDisplayTypes !== 0) {
        if (currentResolutionType > newResolutionType) {
            currentPage = ((currentPage - 1) * deltaDisplayTypes * 2) + 1;

        } else {
            currentPage = Math.floor((currentPage + (deltaDisplayTypes * 2) - 1)  / (deltaDisplayTypes * 2));
        }
    }
    previousDiffX = -(currentPage - 1) * document.body.offsetWidth;
    videoItems.style.webkitTransform = "translateX(" + previousDiffX + "px)";
    changeDotWithSliding();
    primaryWidthStage = document.body.offsetWidth;
};

function getTypeResolution (resolution) {
    if (resolution > 0 && resolution <= 480) {
       return 1;
    }
    if (resolution > 480 && resolution <= 999) {
        return 2;    
    }
    if (resolution > 999) {
        return 3;    
    }
}
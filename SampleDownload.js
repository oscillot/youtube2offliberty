/**
 * This file contains several experiments on the way to having
 * a library that can automatically save a youtube video as mp4
 * using offliberty.com
 *
 * NOTES:
 * + To run with webstorm, one must add an "External Tool" for casperjs
 * [File]->[Settings]->[Tools]->[External Tools]
 * then change the command line for "Running" at
 * [Run]->[Edit Configuration]
 *
 * + To add a new library to webstorm:
 * [File]->[Settings]->[Languages and Frameworks]->[Javascript]->[Libraries]->[Add]
 *
 * + HTTPS problems with some versions of phantomjs:
 * http://stackoverflow.com/questions/26415188/casperjs-phantomjs-doesnt-load-https-page
 *
 *
 * NEEDGIST: Update phantomjs (or other library) in Webstorm
 *
 * TODO:
 * + Webstorm wont allow relative paths to run configurations
 * NEED a oneclick install for capserjs/phantomsjs and put those forward in the path?
 */

var casper = require('casper').create({
    //Make it easy to debug:
    verbose: true,
    logLevel: "debug",
    //Allow XSS and download
    pageSettings: {
        webSecurityEnabled: false
    }
});
//Link to a page that has a small mp3 file on github.  Load this page then
//"click" the "View Raw" link to download it.
var mp3TestDownloadUrl = 'https://github.com/dj80hd/Crippter/blob/master/pain.mp3';

//General handler for easy debugging.  Comes in handy for SSL issues.
casper.on("resource.error", function(resourceError){
    console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
    console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
});

casper.start(mp3TestDownloadUrl, function(status) {
    this.echo(this.getTitle() + JSON.stringify(status));
});

casper.then(function() {
    /* The link to view the Raw file looks like this:
    -------------------------------------------------
    <div class="blob-wrapper data type-text">
    <div class="image">
    <a href="/dj80hd/Crippter/blob/master/pain.mp3?raw=true">View Raw</a>
    </div>
    </div>
    --------------------------------------------------
    */
    var raw_link =
        this.getElementAttribute(
            "div[class='blob-wrapper data type-text'] div.image a",'href');
    require('utils').dump(raw_link);
    //For some reason, we can't just specify downloads/, we need to give a filename
    casper.download(raw_link,'downloads/foo.mp3');

});

casper.then(function() {
    console.log(this.getCurrentUrl());
});

//https://www.youtube.com/watch?v=Wu3j3Qh7sTE
//http://offliberty.com/#https://www.youtube.com/watch?v=Wu3j3Qh7sTE
/*-------------------------------------------------------------------
 * Wait image looks like
 <div id="wait">
 <IMG SRC="/img/wait.gif?v=1" BORDER="0"><br />
 <div id="goowait"></div><br />
 <div id="progress"></div>
 </div>

 --This when done waiting:
 <div id="wait" style="display: none;">
 <img src="/img/wait.gif" border="0"><br><br>
 <div id="progress"></div>
 </div>

 --- mp3 download link looks like this
 <a href="http://k20.offliberty.com/Wu3j3Qh7sTE.mp3" class="download">Right-click here and 'Save link as...'</a>

 --- I want video file looks like this
 <input name="submit" value="I want video file" type="submit" class="back" id="video_file">

 --- Video file looks like
 <a href="http://k2.offliberty.com/Wu3j3Qh7sTE.mp4  " class="download">Right-click here and 'Save link as...'</a>

 ___How to tell when we are done waiting ?

 */
casper.thenOpen('http://replikon.com', function() {
    this.echo(this.getTitle());
});

casper.run();
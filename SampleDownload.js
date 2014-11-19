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



/**
 * Gets a casper instance fully ready and prepared how we want it
 *
 * @param {null}
 * @return {Casper}
 * @private
 */
function get_casper() {
    var casper = require('casper').create({
        //Make it easy to debug:
        verbose: true,
        logLevel: "debug",
        //Allow XSS and download
        pageSettings: {
            webSecurityEnabled: false
        }
    });
    //General handler for easy debugging.  Comes in handy for SSL issues.
    casper.on("resource.error", function(resourceError){
        console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
        console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
    });

    //Test it out, if it fails lets die right here at the start.
    casper.start('http://dj80hd.com', function (status) {
        this.echo(this.getTitle() + JSON.stringify(status));
    });
    return casper;

}



/**
 * Adds steps to a casper to download an mp3 file that exists on Github
 *
 * @param {Casper} casper instance that has been started
 * @return {Casper}
 * @private
 */
function add_github_download_steps(casper) {
    //Link to a page that has a small mp3 file on github.  Load this page then
    //"click" the "View Raw" link to download it.
    var mp3TestDownloadUrl = 'https://github.com/dj80hd/Crippter/blob/master/pain.mp3';

    casper.thenOpen(mp3TestDownloadUrl, function (status) {
        this.echo(this.getTitle() + JSON.stringify(status));
    });

    casper.then(function () {
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
                "div[class='blob-wrapper data type-text'] div.image a", 'href');
        require('utils').dump(raw_link);
        //For some reason, we can't just specify downloads/, we need to give a filename
        casper.download(raw_link, 'downloads/foo.mp3');

    });

    casper.then(function () {
        console.log(this.getCurrentUrl());
    });
}

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


 --- Video file looks like
 <a href="http://k2.offliberty.com/Wu3j3Qh7sTE.mp4  " class="download">Right-click here and 'Save link as...'</a>

 ___How to tell when we are done waiting ?

 */
function add_offliberty_steps(casper) {
    var v = 'Wu3j3Qh7sTE';
    var offliberty_url = 'http://offliberty.com/#https://www.youtube.com/watch?v=' + v;

    //Initiate the offliberty download process
    casper.thenOpen(offliberty_url, function() {
        console.log("Loaded " + offliberty_url);
        //First step is to wait until we are done waiting.
        //More specifically, that the content contains something like this:
        //<div id="wait" style="display: none;"><img src="/img/wait.gif" border="0"><br><br><div id="progress"></div></div>

    });

    //Wait at least 30 seconds for Wait to go invisible.
    casper.waitWhileVisible('#wait',
        function() {
            console.log("We finished waiting");
        },
        function () {
            console.log("We waited toooooo loooong");
            //FIXME - We need to bomb out here
        },
        30000);

    casper.then(function() {
        console.log("DONE WAITING! " + this.getCurrentUrl());
        //If there exists an element with class .download and
        //inner text "Right-click here and 'Save link as...'"
        //and ends in an mp3 we have an audio downlink button.
        //If we have the same situation but an mp4, we then have
        //a video download button.  If we have both, we have both.
        //
        //ASSUMPTION the first a.download is the mp3 link and
        //if it exists, the second a.download in the mp4 link
        var download_urls = this.getElementsAttribute(
            "a.download", 'href');
        if (download_urls.length > 1) {
            //FIXME - check download_urls[1] ends in .mp4
            casper.download(download_urls[1], 'downloads/' + v + ".mp4");

        } else {
            //Find the iWant video file button and click it.
            //<input name="submit" value="I want video file" type="submit" class="back" id="video_file">

            if (casper.exists("input#video_file[value='I want video file']")) {
                console.log("We need to click the I want video file button");
            }

        }
        require('utils').dump(download_urls);
        //console.log("# OFFLIBERTY DL: " +offliberty_download_url.length);

        //Download mp3
        //casper.download(download_urls[0], 'downloads/' + v + ".mp3");
    });


}
var casper = get_casper();
add_github_download_steps(casper);
add_offliberty_steps(casper);
casper.run();
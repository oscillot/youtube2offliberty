/**
 * This file is an example of how to automatically download a youtube
 * video using casperjs
 *
 * Dependencies: casperjs 1.1.0-beta3, phantomjs 1.9.8
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
        logLevel: "info",
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
    casper.start('http://google.com', function (status) {
        this.echo(this.getTitle() + JSON.stringify(status));
    });
    return casper;
}





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
/**
 * Function that takes a casper instance looking at
 * an offliberty wait screen and waits for it to finish
 *
 * Under the hood this is what we are dealing with:
 * <div id="wait" style="display: none;"><img src="/img/wait.gif" border="0"><br><br><div id="progress"></div></div>
 *
 * @param {Casper} casper
 * @return {null}
 * @private
 */
function offliberty_wait(casper) {
    //Wait at least 60 seconds for Wait to go invisible.
    casper.waitWhileVisible('#wait',
        function() {
            console.log("We finished waiting");
        },
        function () {
            console.log("We waited toooooo loooong");
            //FIXME - We need to bomb out here
        },
        60000);
}

/**
 * Add all the steps we need for casper to download a video in the current directory.
 * @param casper - a preconfigured, already started casper
 * @param v - video id of youtube video (e.g. Wu3j3Qh7sTE)
 */
function add_offliberty_steps(casper,v) {
    var download_urls;

    //Special parameterized offliberty url to begin process
    var offliberty_url = 'http://offliberty.com/#https://www.youtube.com/watch?v=' + v;

    //Selector to find the "I want video file" button
    var i_want_video_selector = "input#video_file[value='I want video file']";

    //Initiate the offliberty download process
    casper.thenOpen(offliberty_url, function() {
        console.log("Loaded " + offliberty_url);
    });

    //Get through the waiting period
    offliberty_wait(casper);

    //Click the I want video button if it is there.
    casper.thenClick(i_want_video_selector,function() {
            console.log("CLICKING...");
            offliberty_wait(casper);
        });

    //Both audio and video links are a.download
    //ASSUMPTION: audio is first, video is second.
    casper.then(function() {
        download_urls = this.getElementsAttribute('a.download', 'href');
        require('utils').dump(download_urls);
        if (download_urls.length > 1) {
            //Download vid to local download dir.
            casper.download(download_urls[1], 'downloads/' + v + ".mp4");
        }else{
            console.log(">>>>>>>>>NO MP4!!!!!!");
        }
    });
}

//Main
var casper = get_casper();
add_offliberty_steps(casper,'Wu3j3Qh7sTE');
casper.run();
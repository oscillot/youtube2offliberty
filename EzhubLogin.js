var casper = require('casper').create();

casper.start('http://dj80hd.com/', function() {
    this.echo(this.getTitle());
});

casper.thenOpen('http://replikon.com', function() {
    this.echo(this.getTitle());
});

casper.run();
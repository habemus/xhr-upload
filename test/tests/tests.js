describe('xhrUpload basics', function () {
  it('should be a function', function () {
    xhrUpload.should.be.instanceof(Function);
  });
});

describe('xhrUpload(url, file, options)', function () {

  before(function (done) {
    this.timeout(1000 * 60 * 2);

    var $fixtures = $('#fixtures');
    $fixtures.html('<input type="file" id="file">');
    var $input = $('#file');

    $input.on('change', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // set file to the context
      this.file = $input[0].files[0];

      done();
    }.bind(this));
  });

  // afterEach(function () {

  //   var $fixtures = $('#fixtures');
  //   $fixtures.html('');

  // });

  it('should upload the file to the server', function () {

    var upload = xhrUpload('http://localhost:9000/upload', this.file);

    return upload.promise;
  });

  it('should emit `progress` events', function (done) {
    var upload = xhrUpload('http://localhost:9000/upload', this.file);

    var EMITTED = false;

    upload.on('progress', function (data) {
      data.completed.should.be.instanceof(Number);
      data.loaded.should.be.instanceof(Number);
      data.total.should.be.instanceof(Number);

      EMITTED = true;
    });

    upload.promise.then(function (res) {
      EMITTED.should.eql(true);

      done();
    });
  });

  it('should reject if the url is not found', function () {
    var upload = xhrUpload('http://localhost:9000/does-not-exist', this.file);

    return upload.promise.then(function () {
      throw new Error('error expected');
    }, function (err) {
      console.log(err);
    })
  });

});
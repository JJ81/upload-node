var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');

var fs = require("fs");
var zlib = require('zlib');

var contents = fs.readFileSync("config.json");
var credential = JSON.parse(contents);
//console.info(credential.accessKeyId);
var s3Stream = require('s3-upload-stream')(new AWS.S3());


var knox = require('knox'); // https://github.com/LearnBoost/knox
var mime = require('mime');

require('env2')('config.env');


// initialise knox S3 client
var client = knox.createClient({
  key:    process.env.AWSAccessKeyId, // env2를 통하여 해당 파일에 접근하여 데이터를 가져온다.
  secret: process.env.AWSSecretKey,
  bucket: process.env.S3BUCKET
  // region: process.env.AWSREGION
  // key:    credential.accessKeyId,
  // secret: credential.secretAccessKey,
  // bucket: "winbeple_bucket"
  
});


// console.log(process.env.AWSAccessKeyId);


// AWS.config.update({
// 	accessKeyId : credential.accessKeyId
// 	,secretAccessKey : credential.secretAccessKey
// });

AWS.config.update({
	accessKeyId : process.env.AWSAccessKeyId
	,secretAccessKey : process.env.AWSSecretKey
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Test S3_upload' 
    
  });
});

router.get('/upload', function(req, res, next) {
// Create a bucket using bound parameters and put something in it.
// Make sure to change the bucket name from "myBucket" to something unique.


	var s3bucket = new AWS.S3({params: {Bucket: 'winbeple_bucket'}}); // 없는 버킷일 경우 생성하고 있으면 해당 버킷에 업로드한다.
	s3bucket.createBucket(function() {
	  var params = {Key: 'myKey4', Body: 'Hello my nodejs 4!'}; // key가 같으면 혹은 파일 이름이 같으면 덮어버린다. 이 부분을 어떻게 피할 수 있나?, txt file upload
	  s3bucket.upload(params, function(err, data) {
	    if (err) {
	      console.log("Error uploading data: ", err);
	    } else {
	      console.log("Successfully uploaded data to testBucket/myKey");
	      res.redirect('/');
	    }
	  });
	});
});


router.get('/upload2', function(req, res, next) {

	// 아래 내용은 작동하지 않음
	// var s3 = new AWS.S3();
	// var params = {Bucket: 'winbeple_bucket', Key: 'myImageFile.jpg'};
	// var file = require('fs').createWriteStream('upload/sample4.jpg');

	// s3.getObject(params).
	// on('httpData', function(chunk) { 
	// 	file.write(chunk); 
	// 	console.log(chunk);
	// }).
	// on('httpDone', function() {
	// 	file.end(); 
	// 	console.log('done');
	// }).send();



	// var s3 = new AWS.S3();
	// var params = {Bucket: 'winbeple_bucket', Key: 'myImageFile.jpg'};
	// var file = require('fs').createWriteStream('upload/sample.jpg');
	// s3.getObject(params).createReadStream().pipe(file);
  // Set the client to be used for the upload.
	// AWS.config.loadFromPath('config.json');

	// // Create the streams
	// var read = fs.createReadStream('upload/sample.jpg');
	// var compress = zlib.createGzip();
	// var upload = s3Stream.upload({
	//   "Bucket": "winbeple_bucket",
	//   "Key": "image_upload"
	// });

	// // Optional configuration
	// //upload.maxPartSize(20971520); // 20 MB
	// //upload.concurrentParts(5);

	// // Handle errors.
	// upload.on('error', function (error) {
	//   console.log(error);
	// });

	//  Handle progress. Example details object:
	//    { ETag: '"f9ef956c83756a80ad62f54ae5e7d34b"',
	//      PartNumber: 5,
	//      receivedSize: 29671068,
	//      uploadedSize: 29671068 }
	
	// upload.on('part', function (details) {
	//   console.log(details);
	// });

	// /* Handle upload completion. Example details object:
	//    { Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
	//      Bucket: 'bucketName',
	//      Key: 'filename.ext',
	//      ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"' }
	// */
	// upload.on('uploaded', function (details) {
	//   console.log(details);
	// });

	// // Pipe the incoming filestream through compression, and up to S3.
	// read.pipe(compress).pipe(upload);






	// var glacier = new AWS.Glacier(),
	//     vaultName = 'winbeple',
	//     buffer = new Buffer(2.5 * 1024 * 1024), // 2.5MB buffer
	//     partSize = 1024 * 1024, // 1MB chunks,
	//     numPartsLeft = Math.ceil(buffer.length / partSize),
	//     startTime = new Date(),
	//     params = {vaultName: vaultName, partSize: partSize.toString()};

	// // Compute the complete SHA-256 tree hash so we can pass it
	// // to completeMultipartUpload request at the end
	// var treeHash = glacier.computeChecksums(buffer).treeHash;

	// // Initiate the multi-part upload
	// console.log('Initiating upload to', vaultName);
	// glacier.initiateMultipartUpload(params, function (mpErr, multipart) {
	//   if (mpErr) { console.log('Error!', mpErr.stack); return; }
	//   console.log("Got upload ID", multipart.uploadId);

	//   // Grab each partSize chunk and upload it as a part
	//   for (var i = 0; i < buffer.length; i += partSize) {
	//     var end = Math.min(i + partSize, buffer.length),
	//         partParams = {
	//           vaultName: vaultName,
	//           uploadId: multipart.uploadId,
	//           range: 'bytes ' + i + '-' + (end-1) + '/*',
	//           body: buffer.slice(i, end)
	//         };

	//     // Send a single part
	//     console.log('Uploading part', i, '=', partParams.range);
	//     glacier.uploadMultipartPart(partParams, function(multiErr, mData) {
	//       if (multiErr) return;
	//       console.log("Completed part", this.request.params.range);
	//       if (--numPartsLeft > 0) return; // complete only when all parts uploaded

	//       var doneParams = {
	//         vaultName: vaultName,
	//         uploadId: multipart.uploadId,
	//         archiveSize: buffer.length.toString(),
	//         checksum: treeHash // the computed tree hash
	//       };

	//       console.log("Completing upload...");
	//       glacier.completeMultipartUpload(doneParams, function(err, data) {
	//         if (err) {
	//           console.log("An error occurred while uploading the archive");
	//           console.log(err);
	//         } else {
	//           var delta = (new Date() - startTime) / 1000;
	//           console.log('Completed upload in', delta, 'seconds');
	//           console.log('Archive ID:', data.archiveId);
	//           console.log('Checksum:  ', data.checksum);
	//         }
	//       });
	//     });
	//   }
	// });


// TODO 스트리밍 방식으로 업로드되는 용량을 추적하기 위해서는 메서드가 필요한가??

	var S3FileUrl = function(file) {
	  var filename = file.split('/')[file.split('/').length-1];
	  return 'https://winbeple_bucket'+'.s3.amazonaws.com/'+filename;
	};

	var streamFileToS3 = function(file, callback) {
	  // Amazon S3 needs to know the file-size before you can upload it
	  fs.stat(file, function(err, stat) {
	    /* istanbul ignore if */
	    if(err) {
	      return console.log('S3 Uploda ERROR',err);
	    }

	    var type = mime.lookup(file);

	    var headers = {
		    'Content-Length': stat.size,
		    'Content-Type': type,
		    "x-amz-acl": "public-read"
	    };
	    
	    // var filename = file.split('/')[file.split('/').length-1];
			var filename = "changeImageName3"; // 임의로 저장한 이미지 이름을 만들어 넣을 수 있다.

	    console.log(filename);

	    var fileStream = fs.createReadStream(file);
	    client.putStream(fileStream, filename, headers, function (err, res) {
	      /* istanbul ignore if */
	      if(err) {
	        console.log('ERROR',err);
	      }
	      var url = S3FileUrl(file);
	      callback(err, url, res);
	    });
	  }); // end fs.stat
	};

	var file = 'upload/sample.jpg'; // 실제 파일 경로를 연결해준다..
	fs.stat(file, function(err, stat){
	  if(err) 
	  	console.log(err);
	  console.info(stat);
	  console.info(stat.size); // 파일 사이즈가 없거나 실제 파일이 없을 경우 에러 처리가 필요하다.

	  // fs.createReadStream(file).pipe(req);

	  req.on('response', function(res){
	    console.info(res);
	  });
	});

	streamFileToS3(file, function(err, url, res){
	  console.log('Awesomeness', file, 'was uploaded!');
	  if(err){
			console.log(err);
	  }else{
	  	console.info(res);
	  	// console.log(url);
	  }
	});


});


// S3에 있는 파일을 지운다..
router.get('/delete', function(req, res, next) {
	client.deleteFile('sample.jpg', function(err, res){
  	// check `err`, then do `res.pipe(..)` or `res.resume()` or whatever.
  	if(err)
  		console.log(err);
  	console.log(res);
	});

  // res.render('index', {
  //   title: 'Test S3_upload' 
    
  // });
});

router.get('/upload3', function(req, res, next) {
	// Set the client to be used for the upload.
	// AWS.config.loadFromPath('config.json');

	// // Create the streams
	// var read = fs.createReadStream('upload/sample3.jpg');
	// var compress = zlib.createGzip();
	// var upload = s3Stream.upload({
	//   "Bucket": process.env.S3BUCKET,
	//   "Key": "newImageName"
	// });

	// // Optional configuration
	// upload.maxPartSize(1024*1024); // 20 MB
	// upload.concurrentParts(10);

	// // Handle errors.
	// upload.on('error', function (error) {
	//   console.log(error);
	// });

	//  // Handle progress. Example details object:
	//  //   { ETag: '"f9ef956c83756a80ad62f54ae5e7d34b"',
	//  //     PartNumber: 5,
	//  //     receivedSize: 29671068,
	//  //     uploadedSize: 29671068 }
	
	// upload.on('part', function (details) {
	//   console.log(details);
	// });

	// /* Handle upload completion. Example details object:
	//    { Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
	//      Bucket: 'bucketName',
	//      Key: 'filename.ext',
	//      ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"' }
	// */
	// upload.on('uploaded', function (details) {
	//   console.log(details);
	// });

	// // Pipe the incoming filestream through compression, and up to S3.
	// read.pipe(compress).pipe(upload);
});






// https://github.com/Automattic/knox
// TODO 기존에 이미 중복된 파일 이름이 있을 경우 처리를 해야 한다.

// TODO 스트리밍으로 업로드하는 방법으로 구현하기

// TODO download 구현하기

// TOOD 대용량 파일 업로드하기

// TODO 한개 이상 파일 업로드하기

// 로컬에 있는 이미지를 바로 S3로 올리기, 아파치만으로는 대용량 업로드가 구현될 수 없다!!




module.exports = router;

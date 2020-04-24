var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors')

var VerifyToken = require(__root + 'auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var User = require('./User');
var payload2 = require('./payload2')
var payload3 = require('./payload3')


var payload1 = '{"code":200,"status":"OK","data":{"number":114,"name":"\u0633\u0648\u0631\u0629 \u0627\u0644\u0646\u0627\u0633","englishName":"An-Naas","englishNameTranslation":"Mankind","revelationType":"Meccan","numberOfAyahs":6,"ayahs":[{"number":6231,"audio":"https:\/\/cdn.alquran.cloud\/media\/audio\/ayah\/ar.alafasy\/6231","audioSecondary":["https:\/\/cdn.islamic.network\/quran\/audio\/128\/ar.alafasy\/6231.mp3","https:\/\/cdn.islamic.network\/quran\/audio\/64\/ar.alafasy\/6231.mp3"],"text":"\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064e\u0647\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650 \u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0671\u0644\u0646\u0651\u064e\u0627\u0633\u0650","numberInSurah":1,"juz":30,"manzil":7,"page":604,"ruku":556,"hizbQuarter":240,"sajda":false},{"number":6232,"audio":"https:\/\/cdn.alquran.cloud\/media\/audio\/ayah\/ar.alafasy\/6232","audioSecondary":["https:\/\/cdn.islamic.network\/quran\/audio\/128\/ar.alafasy\/6232.mp3","https:\/\/cdn.islamic.network\/quran\/audio\/64\/ar.alafasy\/6232.mp3"],"text":"\u0645\u064e\u0644\u0650\u0643\u0650 \u0671\u0644\u0646\u0651\u064e\u0627\u0633\u0650","numberInSurah":2,"juz":30,"manzil":7,"page":604,"ruku":556,"hizbQuarter":240,"sajda":false},{"number":6233,"audio":"https:\/\/cdn.alquran.cloud\/media\/audio\/ayah\/ar.alafasy\/6233","audioSecondary":["https:\/\/cdn.islamic.network\/quran\/audio\/128\/ar.alafasy\/6233.mp3","https:\/\/cdn.islamic.network\/quran\/audio\/64\/ar.alafasy\/6233.mp3"],"text":"\u0625\u0650\u0644\u064e\u0670\u0647\u0650 \u0671\u0644\u0646\u0651\u064e\u0627\u0633\u0650","numberInSurah":3,"juz":30,"manzil":7,"page":604,"ruku":556,"hizbQuarter":240,"sajda":false},{"number":6234,"audio":"https:\/\/cdn.alquran.cloud\/media\/audio\/ayah\/ar.alafasy\/6234","audioSecondary":["https:\/\/cdn.islamic.network\/quran\/audio\/128\/ar.alafasy\/6234.mp3","https:\/\/cdn.islamic.network\/quran\/audio\/64\/ar.alafasy\/6234.mp3"],"text":"\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0671\u0644\u0652\u0648\u064e\u0633\u0652\u0648\u064e\u0627\u0633\u0650 \u0671\u0644\u0652\u062e\u064e\u0646\u0651\u064e\u0627\u0633\u0650","numberInSurah":4,"juz":30,"manzil":7,"page":604,"ruku":556,"hizbQuarter":240,"sajda":false},{"number":6235,"audio":"https:\/\/cdn.alquran.cloud\/media\/audio\/ayah\/ar.alafasy\/6235","audioSecondary":["https:\/\/cdn.islamic.network\/quran\/audio\/128\/ar.alafasy\/6235.mp3","https:\/\/cdn.islamic.network\/quran\/audio\/64\/ar.alafasy\/6235.mp3"],"text":"\u0671\u0644\u0651\u064e\u0630\u0650\u0649 \u064a\u064f\u0648\u064e\u0633\u0652\u0648\u0650\u0633\u064f \u0641\u0650\u0649 \u0635\u064f\u062f\u064f\u0648\u0631\u0650 \u0671\u0644\u0646\u0651\u064e\u0627\u0633\u0650","numberInSurah":5,"juz":30,"manzil":7,"page":604,"ruku":556,"hizbQuarter":240,"sajda":false},{"number":6236,"audio":"https:\/\/cdn.alquran.cloud\/media\/audio\/ayah\/ar.alafasy\/6236","audioSecondary":["https:\/\/cdn.islamic.network\/quran\/audio\/128\/ar.alafasy\/6236.mp3","https:\/\/cdn.islamic.network\/quran\/audio\/64\/ar.alafasy\/6236.mp3"],"text":"\u0645\u0650\u0646\u064e \u0671\u0644\u0652\u062c\u0650\u0646\u0651\u064e\u0629\u0650 \u0648\u064e\u0671\u0644\u0646\u0651\u064e\u0627\u0633\u0650","numberInSurah":6,"juz":30,"manzil":7,"page":604,"ruku":556,"hizbQuarter":240,"sajda":false}],"edition":{"identifier":"ar.alafasy","language":"ar","name":"Alafasy","englishName":"Alafasy","format":"audio","type":"versebyverse","direction":null}}}';
payload1 = JSON.parse(payload1);


// CREATES A NEW USER
// router.post('/', function (req, res) {
//     User.create({
//             name : req.body.name,
//             email : req.body.email,
//             password : req.body.password
//         }, 
//         function (err, user) {
//             if (err) return res.status(500).send("There was a problem adding the information to the database.");
//             res.status(200).send(user);
//         });
// });

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', cors(), function (req, res) {
    // User.find({}, function (err, users) {
    //     if (err) return res.status(500).send("There was a problem finding the users.");
    //     res.status(200).send(users);
    // });
    res.status(200).send(payload3);
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', cors(), function (req, res) {
    // User.findById(req.params.id, function (err, user) {
    //     if (err) return res.status(500).send("There was a problem finding the user.");
    //     if (!user) return res.status(404).send("No user found.");
    //     res.status(200).send(user);
    // });
    res.status(200).send(payload2);
});

// // DELETES A USER FROM THE DATABASE
// router.delete('/:id', function (req, res) {
//     User.findByIdAndRemove(req.params.id, function (err, user) {
//         if (err) return res.status(500).send("There was a problem deleting the user.");
//         res.status(200).send("User: "+ user.name +" was deleted.");
//     });
// });

// UPDATES A SINGLE USER IN THE DATABASE
// Added VerifyToken middleware to make sure only an authenticated user can put to this route
// router.put('/:id', /* VerifyToken, */ function (req, res) {
//     User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, user) {
//         if (err) return res.status(500).send("There was a problem updating the user.");
//         res.status(200).send(user);
//     });
// });


module.exports = router;
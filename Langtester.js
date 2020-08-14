var tee = require('./dntopics-1');

var checkLang = (inputText) => {
    if (inputText !== undefined || inputText !== null) {

        inputText = inputText.toLowerCase();
        var yoruba = ['yoruba', 'ilorin']
        var hausa = ['hausa', "kano", "sokoto", "kaduna"]
        var english = ['english']
        var arabic = ['arabic']
        var ighala = ['ighala']
        var nupe = ['nupe']
        var ebira = ['ebira']
        if (inputText.includes(english)) {
            return "English";
        }
        else if (inputText.includes(yoruba)) {
            return "Yoruba";
        }
        else if (inputText.includes(hausa)) {
            return "Hausa";
        }
        else if (inputText.includes(arabic)) {
            return "Arabic";
        }
        else if (inputText.includes(ighala)) {
            return "Ighala";
        }
        else if (inputText.includes(nupe)) {
            return "Nupe";
        }
        else {
            return "Unable to Parse Language"
        }
    }
    return "No Input"
}
let Total = 0;


for (i = 0; i < tee.length; i++) {
    console.log(`Title: ${tee[i].title}, No: ${tee[i].topics.length}`);
    for (let j = 0; j < tee[i].topics.length; j++) {
        //topic level
        console.log(`tee[${i}].topics[${j}]`);
        console.log(tee[i].topics[j].title)
        if (tee[i].topics[j].type == "album" && tee[i].topics[j].media !== null) {
            console.log("No Media = ", tee[i].topics[j].media.length);
            //print out each media of each topic
            for (let k = 0; k < tee[i].topics[j].media.length; k++) {
                console.log(`Album Track ${k + 1} ===> ${tee[i].topics[j].media[k].title}`)
                Total = Total + 1;
                //create a new Object in mongodb

            }
            console.log(`<==========+++++++++++++========>`)

        } else if (tee[i].topics[j].type == "track" && tee[i].topics[j].media !== null) {

            console.log(`Single Track===> ${tee[i].topics[j].title}`)
            Total = Total + 1;
        }
        else {
            console.log("null Media")
        }
        console.log("    ____    _____     ____")
    }
    console.log("<    ____    _____     ____>")
}
console.log("Total Audio = ", Total);
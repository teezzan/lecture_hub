var tee = require('./dntopics-1');

var checkLang = (inputText) => {
    if (inputText !== undefined || inputText !== null) {

        inputText = inputText.toLowerCase();
        var yoruba = ['yoruba']
        var hausa = ['hausa']
        var english = ['english']
        var arabic = ['arabic']
        var ighala = ['ighala']
        var nupe = ['nupe']
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
let i, j, k = 0;


// for (i = 0; i < tee.length; i++) {
//     console.log(`Starting ${tee[i].title} `)
//     console.log(` `)
//     try {
//         for (j = 0; j < tee[i].topics.length; j++) {
//             if (typeof (tee[i].topics[j].media) === 'object') {

//                 for (k = 0; k < tee[i].topics[j].media.length; k++) {

//                     console.log(`Title- ${tee[i].topics[j].media[k].title} Lang- ${checkLang(tee[i].topics[j].media[k].title)}`)

//                 }
//             }
//             else {
//                 console.log(`Track- ${tee[i].topics[j].title} Lang- ${checkLang(tee[i].topics[j].media)}`)
//             }
//         }
//     }
//     catch{
//         console.log("error @ ", " i =", i, " j =", j, " k =", k)
//     }
// }

for (i = 0; i < tee.length; i++) {
    console.log(`Title: ${tee[i].title}, No: ${tee[i].topics.length}`);
    for (let j = 0; j < tee[i].topics.length; j++) {
        //topic level
        console.log(`tee[${i}].topics[${j}]`);
        console.log(tee[i].topics[j].title)
        if (tee[i].topics[j].type == "album" && tee[i].topics[j].media !== null) {
            console.log("No Media = ", tee[i].topics[j].media.length)
        } else if (tee[i].topics[j].type == "track" && tee[i].topics[j].media !== null) {
            console.log("track. Single")
        }
        else {
            console.log("null Media")
        }
        console.log("    ____    _____     ____")
    }
    console.log("<    ____    _____     ____>")
}
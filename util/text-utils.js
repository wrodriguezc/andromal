//https://www.w3resource.com/javascript-exercises/javascript-string-exercise-28.php
function hex_to_ascii(str1) {
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
        //let ascii = parseInt(hex.substr(n, 2), 16);
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        /*
        //Check if the character is printable
        f (ascii === 10 || ascii === 12) {
           str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }else if (ascii > 20 && ascii <= 126) {
        if (ascii > 20 && ascii <= 126) {

            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        } else {
            str += 'x' + hex.substr(n, 2);
        }*/
    }
    return encodeURIComponent(str);
}

module.exports.hex_to_ascii = hex_to_ascii;
//generate the word
function generateFractal(iterations) {
    let oldWord = "X";
    let newWord = "";
    for(let iteration = 0; iteration < iterations; iteration++) {
        for(let i=0; i < oldWord.length; i++) {
            if(oldWord[i] === "X") {
                newWord += "F+[[X]-X]-F[-FX]+X";
            }
            else if(oldWord[i] === "F") {
                newWord += "FF";
            }
            else {
                newWord += oldWord[i];
            }
        }
        oldWord = newWord;
        newWord = "";
    }
    return oldWord;
}

function generateComplex(iterations) {
    let oldWord = "F";
    let newWord = "";
    for(let iteration = 0; iteration < iterations; iteration++) {
        for(let i=0; i < oldWord.length; i++) {
            switch (oldWord[i]) {
                case "F":
                    newWord += "Y[^^^^^OF][&&&&&PF][\\\\\\\\\\F][++++++MF][/////-----NF]";
                    break;
                case "M":
                    newWord += "Z-M ";
                    break;
                case "N":
                    newWord += "Z+N";
                    break;
                case "O":
                    newWord += "Z&O";
                    break;
                case "P":
                    newWord += "Z^P";
                    break;
                case "Y":
                    newWord += "Z-ZY+";
                    break;
                case "Z":
                    newWord += "ZZ";
                    break;
                default:
                    newWord += oldWord[i];
                    break;
            }
        }
        oldWord = newWord;
        newWord = "";
    }
    return oldWord;
}

export { generateFractal, generateComplex };


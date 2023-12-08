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

export { generateFractal };
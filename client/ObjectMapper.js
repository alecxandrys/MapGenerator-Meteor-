require('brain.js/browser.js');
let net=new brain.NeuralNetwork({
    activation: 'tanh'
});
mappingObject=function(inputData){
    return net.run(inputData);
};
/**
 * Turn the # into 1s and . into 0s. for whole string
 * @param string
 * @returns {Array}
 */
character=function(string)
{
    return string
        .trim()
        .split('.')
        .map(integer);
};
/**
 * @param character
 * @returns {number}
 */
function integer(character)
{
    if('cliff' === character)
    {
        return 1.0;
    }
    else if('rock' === character)
    {
        return 0.75;
    }
    else if ('cavern' === character)
    {
        return 0.65;
    }
    else if('ground' === character)
    {
        return 0.5;
    }
    else if('shallow' === character)
    {
        return 0.25;
    }
    else if('deepWater' === character)
    {
        return 0;
    }
    return 0;
}
let mountain=character(
    'cliff.'+'cliff.'
    +'cliff.'+'cliff.'
    +'cliff.'+'cliff.'
);
let openWater=character(
    'deepWater.'+'deepWater.'
    +'deepWater.'+'deepWater.'
    +'deepWater.'+'deepWater.'
);
let forest0=character(
    'rock.'+'rock.'
    +'ground.'+'ground.'
    +'ground.'+'ground.'
);
let forest1=character(
    'ground.'+'rock.'
    +'ground.'+'rock.'
    +'ground.'+'ground.'
);
let forest2=character(
    'ground.'+'ground.'
    +'ground.'+'rock.'
    +'ground.'+'rock.'
);
let forest3=character(
    'ground.'+'ground.'
    +'ground.'+'ground.'
    +'rock.'+'rock.'
);
let forest4=character(
    'ground.'+'ground.'
    +'rock.'+'ground.'
    +'rock.'+'ground.'
);
let forest5=character(
    'rock.'+'ground.'
    +'rock.'+'ground.'
    +'ground.'+'ground.'
);
let cavernFromCliff0=character(
    'cliff.'+'rock.'
    +'rock.'+'rock.'
    +'rock.'+'cliff.'
);
let cavernFromCliff1=character(
    'rock.'+'rock.'
    +'cliff.'+'cliff.'
    +'rock.'+'rock.'
);
let cavernFromCliff2=character(
    'rock.'+'cliff.'
    +'rock.'+'rock.'
    +'cliff.'+'rock.'
);
let cavernFromCavern0=character(
    'cavern.'+'rock.'
    +'rock.'+'rock.'
    +'rock.'+'cavern.'
);
let cavernFromCavern1=character(
    'rock.'+'rock.'
    +'cavern.'+'cavern.'
    +'rock.'+'rock.'
);
let cavernFromCavern2=character(
    'rock.'+'cavern.'
    +'rock.'+'rock.'
    +'cavern.'+'rock.'
);
net.train([{input:mountain,output:{mountain:1}},
        {input:forest0,output:{forest:0.8,ground:0.2}},
        {input:forest1,output:{forest:0.8,ground:0.2}},
        {input:forest2,output:{forest:0.8,ground:0.2}},
        {input:forest3,output:{forest:0.8,ground:0.2}},
        {input:forest4,output:{forest:0.8,ground:0.2}},
        {input:forest5,output:{forest:0.8,ground:0.2}},
        {input:cavernFromCliff0,output:{cavern:0.5,cliff:0.5}},
        {input:cavernFromCliff1,output:{cavern:0.5,cliff:0.5}},
        {input:cavernFromCliff2,output:{cavern:0.5,cliff:0.5}},
        {input:cavernFromCavern0,output:{cavern:0.8,cliff:0.2}},
        {input:cavernFromCavern1,output:{cavern:0.8,cliff:0.2}},
        {input:cavernFromCavern2,output:{cavern:0.8,cliff:0.2}},
        {input:openWater,output:{openWater:0.8,deepWater:0.2}}],
    {
        errorThresh:0.005,  // error threshold to reach
        iterations:20000,   // maximum training iterations
        log: true,           // console.log() progress periodically
        logPeriod: 500       // number of iterations between logging
    });

console.log('Mountain=',net.run(mountain),'Forest=',net.run(forest4),'openWater=',net.run(openWater));
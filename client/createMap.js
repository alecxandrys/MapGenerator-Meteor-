/**
 * Created by Пользователь on 10/01/2018.
 * Получает расширенную (с доп полями для отработки НС) карту высот, возвращает уже без полей обычную
 * Object.keys(obj) единожды в начале для получения ключей, потом Object.values(obj) для получения значении в едином
 * порядке (гарантированно). Потом ищем индекс максимального (или не очень) и кидаем кубы.
 * Threshold обязателен
 */
/**
 * @param xSize высота
 * @param ySize ширина
 * @returns {Array} нормализированная карта
 */
let neighbour=[[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0]];
createMap=function(xSize,ySize) {
    let heightMap=generateTerrainMap(128,1,10);
    let firstMap=[];
    let keys=['openWater','deepWater','shallow','ground','rock','cliff','mountain','cavern','forest'];//перечень
    // всех возможных ключей, чтобы не вызывать каждый раз Object.keys(obj)
    let boundaryOffset=2;
    let threshold=0.75;//порог установки нового значения
    //Первый проход
    for(let x=(xSize-1)+boundaryOffset*2; x>=0; x--)//сохраняем отступы
    {
        firstMap[x]=[];
        for(let y=((ySize+xSize/2)-1)+boundaryOffset*2; y>=0; y--)
        {
            let cell={};
            cell.x=x;
            cell.y=y;
            cell.z=heightMap[x][y];
            cell.offset=OffsetOut(xSize,x,ySize,y);
            switch(true)
            {
                case cell.z<0.1:
                    cell.ground="deepWater";
                    break;
                case cell.z>0.9:
                    cell.ground="cliff";
                    break;
                case cell.z<0.25:
                    cell.ground="shallow";
                    break;
                case cell.z>0.75:
                    cell.ground="rock";
                    break;
                default:
                    cell.ground="ground";
                    break;
            }
            firstMap[x][y]=cell;
        }
    }
    //Второй проход
    let secondMap=[];
    let counter=0;
    for(let x=(xSize-1)+boundaryOffset; x>=boundaryOffset; x--)//теперь только оригиналка
    {
        secondMap[x-boundaryOffset]=[];
        for(let y=((ySize+xSize/2)-1)+boundaryOffset; y>=boundaryOffset; y--)
        {
            let inputData='';
            neighbour.forEach(function(elem)//собрали соседей
            {
                inputData=inputData+firstMap[x+elem[0]][y+elem[1]].ground+'.';
            });
            inputData=character(inputData);//привели в форму
            let result=mappingObject(inputData);//получили результат
            let typeOfGround='';
            let value=0;
            keys.forEach(function(elem) //определяем перебором максимальное значение с учетом трешхолда и кубика
            {
                if(result[elem]>threshold)//треш
                {
                    if(result[elem]>value)//лидер
                    {
                        value=result[elem];
                        let dice=Math.random();
                        if(value>dice)//кубик
                        {
                            typeOfGround=elem;
                        }
                        else {
                            typeOfGround='';
                        }
                    }
                }
            });
            let cell=JSON.parse(JSON.stringify(firstMap[x][y]));
            if(typeOfGround !== '')
            {cell.ground=typeOfGround;counter++;}
            secondMap[x-boundaryOffset][y-boundaryOffset]=cell;

        }
    }
    console.log("Решение принято  в количестве: "+counter);
    return secondMap;

    /**
     * @return {boolean}
     */
    function OffsetOut(xSize,x,ySize,y)
    {
        return ((xSize-x-1)/2)<=y && y<=(ySize-1+(xSize-x-1)/2);
    }
};

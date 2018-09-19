import {Template} from 'meteor/templating';

var game={};
var state={
    worldScale:1,
    minimap:null
};

import './main.html';

Template.battleBody.onRendered(function()
{
    // counter starts at 0

    let field=$("#field");
    let x=field.width();
    let y=field.height();
    game=new Phaser.Game(x,y,Phaser.AUTO,'field');// x and y -size of camera view by start
    game.state.add('preloadState',preloadState);
    game.state.add('bootState',bootState);
    game.state.add('main',mainState);
    game.state.start('bootState');
});
var bootState=function(t)
{

};
bootState.prototype={
    preload:function()
    {

    },
    /**
     * Scale field here
     */
    create:function()
    {
        game.time.advancedTiming=true;
        game.cursors=game.input.keyboard.createCursorKeys();
        game.xLineSize=80;
        game.yLineSize=60;
        game.xSize=72;
        game.ySize=96;
        game.world.resize(game.yLineSize*96,game.xLineSize*72*0.75+game.xLineSize/4);//first-width,second-height
        game.map=createMap(72,96);
        this.state.start('preloadState');
    }
};
var preloadState=function(t)
{

};
preloadState.prototype={
    preload:function()
    {
        this.text=this.add.text(this.game.width/2,this.game.height/2,'Loading',{fill:'#ffffff'});
        this.text.anchor.set(0.5,0.5);
        this.load.onFileComplete.add(this.fileComplete,this);
        this.load.image('ground','ground.svg');
        this.load.image('rock','rock.svg');
        this.load.image('shallow','shallow.svg');
        this.load.image('deepWater','deepWater.svg');
        this.load.image('mountain','mountain.svg');
        this.load.image('openWater','openWater.svg');
        this.load.image('forest','forest.svg');
        this.load.image('cavern','cavern.svg');
        this.load.image('cliff','cliff.svg');
    },
    create:function()
    {
        this.state.start('main');

    },
    fileComplete:function(progress)
    {
        this.text.text='Loading '+progress+'%';
    }
};

var mainState=function(t)
{

};
mainState.prototype={
    preload:function()
    {

    },/**
     * Scale field here
     */
    create:function()
    {
        game.input.onDown.add(Click,this);
        game.input.addMoveCallback(Move,this);
        game.input.onUp.add(Up,this);
        game.input.mouse.mouseWheelCallback=Zoom;
        let minimap=new Phaser.Polygon(new Phaser.Point(0,0),new Phaser.Point(0,100),new Phaser.Point(100,100),new Phaser.Point(100,0));
        state.minimap=game.add.graphics(0,0);
        state.minimap.beginFill(0xFF33ff,0.5);
        state.minimap.drawPolygon(minimap.points);
        state.minimap.endFill();
        state.minimap.fixedToCamera=true;


        game.tiles=game.add.group();
        game.label=game.add.group();
        RenderField();

    },
    update:function()
    {
        MoveField();
        //game.debug.text(game.time.fps || '--',2,14,"#00ff00");
        //game.debug.cameraInfo(game.camera,32,32);
        let x=100*game.camera.x/game.world.bounds.width;
        let y=100*game.camera.y/game.world.bounds.height;
        let minimap=new Phaser.Polygon(new Phaser.Point(x,y),new Phaser.Point(x,y+10),new Phaser.Point(x+10,y+10),new Phaser.Point(x+10,y));
        state.minimap.beginFill(0xFFFFFF,0.5);
        state.minimap.drawPolygon(minimap.points);
        state.minimap.endFill();
    }
};
function RenderField()
{
    let cell;
    let viewRect=new Phaser.Rectangle(game.camera.x-game.xLineSize/2,game.camera.y-game.yLineSize/2,game.camera.x+game.width,game.camera.y+game.height);
    for(let x=(game.xSize-1); x>=0; x--)
    {
        for(let y=((game.ySize+game.xSize/2)-1); y>=0; y--)
        {
            let xCoordinate;
            let yCoordinate;
            let tmp=game.map[x][y].ground;

            //for changeable field and different first shift
            //this part from lab, where A* pathfinder was realised
            //only removed horisontal offset (have no idea why) and add vertical shift

            xCoordinate=game.yLineSize*(y-(game.xSize-1-x)/2);
            yCoordinate=game.xLineSize*x*0.75;

            if(game.map[x][y].offset)
            {
                cell=game.tiles.create(xCoordinate,yCoordinate,tmp);
                cell.xCoordinate=xCoordinate;
                cell.yCoordinate=yCoordinate;

                let boundsPoint=new Phaser.Point(cell.xCoordinate*game.world.scale.x,cell.yCoordinate*game.world.scale.y);
                if(Phaser.Rectangle.containsPoint(viewRect,boundsPoint))
                {
                    cell.visible=true;
                    let text=game.add.text(xCoordinate+game.xLineSize/2,yCoordinate+game.yLineSize/2,'x:'+x+',y:'+y,{
                        fill:'#ffffff',
                        fontSize:'8px'
                    });
                    game.label.add(text);
                    text.anchor.set(0.5,0.5);
                }
                else
                {
                    cell.visible=false;
                }

                cell.row=x;
                cell.column=y;
            }
        }

    }
    game.world.bringToTop(state.minimap);
}
function VisibleCheck()
{

    state.worldScale=Phaser.Math.clamp(state.worldScale,0.5,1);
    game.world.scale.set(state.worldScale);

    let viewRect=new Phaser.Rectangle(game.camera.x-game.xLineSize/2,game.camera.y-game.yLineSize/2,game.camera.x+game.width,game.camera.y+game.height);
    game.tiles.forEachExists(function(element)
    {
        let boundsPoint=new Phaser.Point(element.xCoordinate*game.world.scale.x,element.yCoordinate*game.world.scale.y);
        element.visible=Phaser.Rectangle.containsPoint(viewRect,boundsPoint);
    });

}
function Click(pointer)
{

}
function Move(pointer,x,y,isDown)
{
    if(isDown)
    {
        state.dragFlag=true;
        state.startX=x;
        state.startY=y
    }
}
function Up(pointer)
{
    if(state.dragFlag)
    {
        state.dragFlag=false;
        let deltaX=state.startX-pointer.x;
        let deltaY=state.startY-pointer.y;
        let newX=game.camera.x+deltaX;
        let newY=game.camera.y+deltaY;
        if(newX<0)
        {
            newX=0;
        }
        if(newX>(game.world.bounds.width-game.camera.width))
        {
            newX=game.world.bounds.width-game.camera.width;
        }
        if(newY<0)
        {
            newY=0;
        }
        if(newY>(game.world.bounds.height-game.camera.height))
        {
            newY=game.world.bounds.height-game.camera.height;
        }
        game.camera.setPosition(newX,newY);
    }
    VisibleCheck();
}
function Zoom(event)
{
    if(event.deltaY>0)
    {
        state.worldScale-=0.05;
    }
    else
    {
        state.worldScale+=0.05;
    }
    VisibleCheck();
}
function MoveField()
{
    if(game.cursors.up.isDown)
    {
        game.camera.y-=20;
    }
    else if(game.cursors.down.isDown)
    {
        game.camera.y+=20;
    }

    if(game.cursors.left.isDown)
    {
        game.camera.x-=20;
    }
    else if(game.cursors.right.isDown)
    {
        game.camera.x+=20;
    }
    /**
     * bootState and zoom
     */
    if(game.input.keyboard.isDown(Phaser.Keyboard.Q))
    {
        state.worldScale+=0.05;
    }
    else if(game.input.keyboard.isDown(Phaser.Keyboard.A))
    {
        state.worldScale-=0.05;
    }

    VisibleCheck();
}

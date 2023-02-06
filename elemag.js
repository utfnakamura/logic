let iCoil,iSwOn,iSwOff,iCell,iPlate,iCoilFrame,iLampOn,iLampOff;
let iAndFrame,iOrFrame,iNotFrame;
let cc1,cc2;

class coilCircuit {
    constructor(x,y,swStatus,plateMode) {
        this.x = x;
        this.y = y;

        this.coilframe = createSprite(x+50, y+90);
        this.coilframe.addImage('frame', iCoilFrame);
        this.coilframe.immovable = true;

        this.coil = createSprite(x+70,y+50);
        this.coil.addImage(iCoil);
        this.coil.immovable = true;

        this.cell = createSprite(x+70,y+140);
        this.cell.scale = 0.3;
        this.cell. addImage(iCell);
        this.cell.immovable = true;

        this.sw = createSprite(x,y+70);
        this.sw.addImage('off', iSwOff);
        this.sw.addImage('on', iSwOn);
        this.sw.changeAnimation(swStatus);
        this.sw.immovable = true;

        /*this.sw.onMousePressed = (e) => {
            if (this.sw.getAnimationLabel() == 'on') {
                this.sw.changeAnimation('off');
            } else {
                this.sw.changeAnimation('on');
            }
            this.plateOpenClose();
        }*/

        this.plateMode = plateMode;
        this.plate = createSprite(x + 70, y);
        this.plate.addImage('plate', iPlate);
        this.plate.immovable = true;
        this.plateOpenClose();
    }
    plateOpenClose() {
        this.sws = this.sw.getAnimationLabel() == 'on' ? 0 : 1;
        this.angle = -15;
        this.yoff = -7;
        if(this.plateMode == 'reverse') { 
            this.sws = 1 - this.sws;
            this.angle = 345;
            this.yoff = 7;
        }
        this.plate.rotation = this.angle * this.sws;
        this.plate.position.y = this.y + this.yoff * this.sws;
    }

}

class lampCircuit {
    constructor(coils,outFrame,MIL,table,x,y,lx,ly,lStatus,ctype,bx,by,brot) {
        this.ctype = ctype;
        this.cc = [];
        coils.forEach(c => {
            this.cc.push(
                new coilCircuit(...c)
            );
        });
        this.outFrame = createSprite(x,y);
        this.outFrame.addImage(outFrame);
        this.outFrame.scale = scale;
        this.outFrame.depth = 0;

        this.lamp = createSprite(lx,ly);
        this.lamp.scale = 0.15;
        this.lamp.addImage('on', iLampOn);
        this.lamp.addImage('off', iLampOff);
        this.lamp.changeAnimation(lStatus);
        
        this.cell = createSprite(bx,by);
        this.cell.addImage(iCell);
        this.cell.scale = 0.3;
        this.cell.rotation = brot;

        this.cc.forEach( c => {
            c.sw.onMousePressed = (e) => {
                if (c.sw.getAnimationLabel() == 'on') {
                    c.sw.changeAnimation('off');
                } else {
                    c.sw.changeAnimation('on');
                }
                c.plateOpenClose();
                
                if (this.ctype == 'AND') {
                    this.c1 = (this.cc[0].sw.getAnimationLabel() == 'on');
                    this.c2 = (this.cc[1].sw.getAnimationLabel() == 'on');
                    this.lstat = this.c1 && this.c2 ? 'on' : 'off';
                    this.lamp.changeAnimation(this.lstat);
                    this.in1.html(this.c1 ? '1' : '0')
                    this.in2.html(this.c2 ? '1' : '0')
                    this.out.html(this.lstat == 'on' ? 1 : 0);
                    this.in1.style('background', this.c1 ? 'orange' : 'white');
                    this.in2.style('background', this.c2 ? 'orange' : 'white');
                    this.out.style('background', this.lstat == 'on' ? 'orange' : 'white');
                } else if (this.ctype == 'OR') {
                    this.c1 = (this.cc[0].sw.getAnimationLabel() == 'on');
                    this.c2 = (this.cc[1].sw.getAnimationLabel() == 'on');
                    this.lstat = this.c1 || this.c2 ? 'on' : 'off';
                    this.lamp.changeAnimation(this.lstat);
                    this.in1.html(this.c1 ? '1' : '0')
                    this.in2.html(this.c2 ? '1' : '0')
                    this.out.html(this.lstat == 'on' ? 1 : 0);
                    this.in1.style('background', this.c1 ? 'orange' : 'white');
                    this.in2.style('background', this.c2 ? 'orange' : 'white');
                    this.out.style('background', this.lstat == 'on' ? 'orange' : 'white');
                } else if (this.ctype == 'NOT') {
                    this.c1 = (this.cc[0].sw.getAnimationLabel() == 'on');
                    this.lstat = this.c1 ? 'off' : 'on';
                    this.lamp.changeAnimation(this.lstat);
                    this.in1.html(this.c1 ? '1' : '0')
                    this.out.html(this.lstat == 'on' ? 1 : 0);
                    this.in1.style('background', this.c1 ? 'orange' : 'white');
                    this.out.style('background', this.lstat == 'on' ? 'orange' : 'white');
                }
            }
        });

        this.MIL = createSprite(600,ly);
        this.MIL.addImage(MIL);

        this.table = createSprite(630, ly + 90);
        this.table.addImage(table);
        this.table.scale = 0.6;

        this.out = createP('0');
        this.out.position(680,ly - 22);
        this.out.style('border', 'solid 1px');

        if(this.ctype != 'NOT' ) {
            this.in1 = createP('0');
            this.in2 = createP('0');
            this.in1.position(530, ly - 40);
            this.in2.position(530, ly + 3);
            this.in1.style('border', 'solid 1px');
            this.in2.style('border', 'solid 1px');
        } else {
            this.in1 = createP('1');
            this.in1.position(520, ly-20);
            this.in1.style('border', 'solid 1px');
            this.in1.style('background', 'orange');
        }
    }
}

function preload() {
    iCoil = loadImage('img/coil.jpg');
    iSwOn = loadImage('img/ON.jpg');
    iSwOff = loadImage('img/OFF.jpg');
    iCell = loadImage('img/drycell.jpg');
    iPlate = loadImage('img/line.jpg');
    iCoilFrame = loadImage('img/coilframe.jpg');
    iLampOn = loadImage('img/lightballON.jpg');
    iLampOff = loadImage('img/lightballOFF.jpg');
    iAndFrame = loadImage('img/ANDframe.jpg');
    iOrFrame = loadImage('img/ORframe.jpg');
    iNotFrame = loadImage('img/NOTframe.jpg');
    iAndMIL = loadImage('img/ANDmil.jpg');
    iOrMIL = loadImage('img/ORmil.jpg');
    iNotMIL = loadImage('img/NOTmil.jpg');
    iAndTable = loadImage('img/ANDtable.jpg')
    iOrTable = loadImage('img/ORtable.jpg')
    iNotTable = loadImage('img/NOTtable.jpg')
}

let canvas;
let ANDcircuit,ORcircuit,NOTcircuit;
function setup() {
    canvas = createCanvas(800,1200);
    ANDcircuit = new lampCircuit(
        [[50, 50, 'off', 'normal'], [250, 50, 'off', 'normal']],
        iAndFrame, iAndMIL, iAndTable,200, 150, 385, 150, 'off', 'AND',205,250,0);

    ORcircuit = new lampCircuit(
        [[50, 350, 'off', 'normal'], [250, 350, 'off', 'normal']],
        iOrFrame, iOrMIL, iOrTable,200, 450, 190, 410, 'off', 'OR', 190, 490, 90);

    NOTcircuit = new lampCircuit(
        [[150, 600, 'on', 'reverse']],
        iNotFrame, iNotMIL,iNotTable,200, 700, 300, 700, 'off', 'NOT', 210, 795, 0);

    //cc1 = new coilCircuit(50, 100, 'off','normal');
    //cc2 = new coilCircuit(250, 100, 'off','reverse');
}

function draw() {
    background(255);
    drawSprites();// 3, スプライトを描画します
}
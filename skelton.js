function affine(p, xy, s) {
    return p.map((c, i) => { return c * s + xy[i % 2]; });
}

function bzPos(b, t) {
    return [
        bezierPoint(...b.filter((e, i) => { return !(i % 2); }), t),
        bezierPoint(...b.filter((e, i) => { return (i % 2); }), t),
    ]
}

const c_moving = 'red';
const c_normal = 'black';

class node0 {
    constructor(etype,x,y,r,c=0) {
        this.etype = etype;
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c_normal;
        this.moving = false;
    }

    draw() {
        stroke(this.c);
        circle(this.x,this.y,this.r);
    }

    in_area(x,y) {
        return Math.abs(this.x-x) <= this.r && Math.abs(this.y-y) <= this.r;
    }
}

class connector {
    constructor(output,input,divide=0.5) {
        this.output = output;
        this.input = input;
        this.c = c_normal;
    }

    draw() {
        stroke(this.c);
        beginShape();
        vertex(this.output.x,this.output.y);
        vertex((this.input.x - this.output.x) * this.divide + this.output.x, this.output.y);
        vertex((this.input.x - this.output.x) * this.divide + this.output.x, this.input.y);
        vertex(this.input.x, this.input.y);
        endShape();
    }
}

var n1 = new node0('and', 100, 100, 3);
var n2 = new node0('or', 200, 200, 3);    

var points,connectors;
function setup() {
    createCanvas(650, 600);
    points = [n1,n2];
    connectors = [new connector(n1,n2)];
}

function mouseClicked() {
    if(mouseButton == LEFT) {
        points.some( e => {
            if( e.moving ) {
                e.moving = false;
                e.c = c_normal;
                return true;
            }
            if( e.in_area(mouseX,mouseY)) {
                e.moving = true;
                e.c = c_moving;
                return true;
            }
        });
    } else if(mouseButton == RIGHT) {

    }
}

function mouseMoved() {
    points.some(e => {
        if (e.moving) {
            e.x = mouseX;
            e.y = mouseY;
        }
    });    
}

function draw() {
    background(255, 255, 255);
    points.forEach(element => {element.draw();});
    connectors.forEach(element => {element.draw();})
}

document.oncontextmenu = (e) => { e.preventDefault(); }
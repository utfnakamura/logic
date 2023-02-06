const default_size = 50.0;
const mesh_unit = 5.0;


function affine(p,xy,s) {
    return p.map((c, i) => { return Math.floor(c * s + xy[i % 2]); });    
}

function bzPos(b,t,dx=0,dy=0) {
    return [
        bezierPoint(...b.filter((e, i) => { return !(i % 2); }), t),
        bezierPoint(...b.filter((e, i) => { return (i % 2); }), t),
    ]
}

const c_normal = 'black';
const c_moving = 'red';
const c_connecting = 'blue';

var BzShape = {
    'AND': [
        [0.0, 0.1, 0.0, 0.25, 0.0, 0.75, 0.0, 0.9],
        [0.0, 0.1, 0.6, 0.1, 0.97, 0.05, 1.0, 0.5],
        [0.0, 0.9, 0.6, 0.9, 0.97, 0.95, 1.0, 0.5],
    ],
    'OR': [
        [0.0, 0.1, 0.33, 0.1, 0.3, 0.9, 0.0, 0.9],
        [0.0, 0.1, 0.6, 0.1, 0.7, 0.1, 1.0, 0.5],
        [0.0, 0.9, 0.6, 0.9, 0.7, 0.9, 1.0, 0.5],
    ],
    'BUFFER': [
        [0.1, 0.1, 0.1, 0.25, 0.1, 0.75, 0.1, 0.9],
        [0.1, 0.1, 0.1, 0.1, 0.9, 0.5, 0.9, 0.5],
        [0.1, 0.9, 0.1, 0.9, 0.9, 0.5, 0.9, 0.5],
    ],
    'XOR': [
        [0.0, 0.1, 0.33, 0.1, 0.3, 0.9, 0.0, 0.9],
        [0.1, 0.1, 0.6, 0.1, 0.7, 0.2, 1.0, 0.5],
        [0.1, 0.9, 0.6, 0.9, 0.7, 0.8, 1.0, 0.5],
        [0.1, 0.1, 0.43, 0.1, 0.43, 0.9, 0.1, 0.9],
    ],
}

BzShape['NAND'] = BzShape['AND'];
BzShape['NOR'] = BzShape['OR'];
BzShape['NOT'] = BzShape['BUFFER'];
BzShape['XNOR'] = BzShape['XOR'];

class logicElement {
    singles = ['BUFFER', 'NOT'];
    constructor(x=100.0,y = 100.0, etype = null, s = default_size, weight=1,con_len=0.25) {
        this.x = x;
        this.y = y;
        this.s = s;
        this.type = etype;
        this.color = c_normal;
        this.weight = weight;
        this.con_len = con_len;
        this.moving = false;
        this.area = 0.9;

        this.input = this.singles.includes(etype) ? [null] : [null,null];
        this.output = [];
    };
    in_xy(offset=0.15) {
        this.pins = this.singles.includes(this.type) ? [0.5] : [0.5+offset,0.5-offset];
        let ri = this.pins.map( (o) => { 
            return bzPos(BzShape[this.type][0],o);
        });
        return ri.map((r) => { return affine([r[0]-this.con_len,r[1],...r],[this.x,this.y],this.s) })
    }
    out_xy() {
        let r = bzPos(BzShape[this.type][1], 1.0);
        return [affine([r[0] + this.con_len, r[1],...r,],[this.x,this.y],this.s)];
    }
    
     draw() {
         noFill();
         stroke(this.color);
         strokeWeight(this.weight);
         BzShape[this.type].forEach(e => {
             bezier(...affine(e, [this.x,this.y], this.s));
         });
         this.in_xy().map((p) => { line(...p) });
         this.out_xy().map((p) => { line(...p) });
         if( this.type.startsWith('N') || this.type == 'XNOR') {
            fill(255);
            let cr = this.s * 0.05;
            circle(...this.out_xy()[0].slice(2,4).map((x,i) => {return i ? x : x+cr/2+1 }),cr);
         }
    }
};

class elmConnector {
    constructor(r1,r2,c1=false,c2=false,color=c_normal,weight=1,radius=2) {
        this.r1 = r1;
        this.r2 = r2;
        this.c1 = c1;
        this.c2 = c2;
        this.color = color;
        this.weight = weight;
        this.radius = radius;
    }

    draw() {
        noFill();
        stroke(this.color);
        strokeWeight(this.weight);
        line(...this.r1,...this.r2);
        fill(c_normal);
        if (this.c1) { circle(...this.r1, this.radius); }
        if (this.c2) { circle(...this.r2, this.radius); }
        noFill();
    }
}

const cx = 600, cy=300;
const xoff = 80,yoff = 50;
const c_A = 'pink', c_B = 'cyan', c_0 = 'gray';
var inA,inB;
var labels = [],vals = [];
var elements = [],connectors = [];
let canvas;
function setup() {
    canvas = createCanvas(cx,cy);
    let elms = [
        [130 + xoff, 50 + yoff, 'AND'], [130 + xoff, 120 + yoff, 'AND'],
        [130 + xoff, 190 + yoff,'OR'],
        [250 + xoff, 120 + yoff, 'NOT'], [350 + xoff, 128 + yoff,'AND']
    ];
    elms.forEach(e => {
        elements.push(new logicElement(...e));
    });

    let conns = [
        // AND1
        [[33 + xoff, 67 + yoff], [130 + xoff, 67 + yoff]],
        [[70 + xoff, 82 + yoff], [130 + xoff, 82 + yoff]],
        // AND2
        [[90 + xoff, 137 + yoff], [130 + xoff, 137 + yoff]],
        [[70 + xoff, 152 + yoff], [130 + xoff, 152 + yoff]],
        // OR1
        [[90 + xoff, 206 + yoff], [130 + xoff, 206 + yoff]],
        [[33 + xoff, 223 + yoff], [130 + xoff, 223 + yoff]],
        // NOT
        [[190 + xoff, 145 + yoff], [243 + xoff, 145 + yoff]],
        [[305 + xoff, 145 + yoff], [337 + xoff, 145 + yoff]],
        // AND3
        [[193 + xoff, 215 + yoff], [320 + xoff, 215 + yoff]],
        [[320 + xoff, 215 + yoff], [320 + xoff, 160 + yoff]],
        [[320 + xoff, 160 + yoff], [340 + xoff, 160 + yoff]],
        // overflow
        [[190 + xoff, 75 + yoff], [450 + xoff, 75 + yoff]],
        // answer
        [[410 + xoff, 153 + yoff], [450 + xoff, 153 + yoff]],
        // A line
        [[90 + xoff, 67 + yoff], [90 + xoff, 137 + yoff], true, true],
        [[90 + xoff, 137 + yoff], [90 + xoff, 206 + yoff]],
        // B line
        [[70 + xoff, 82 + yoff], [70 + xoff, 152 + yoff]],
        [[70 + xoff, 152 + yoff], [70 + xoff, 223 + yoff],true,true],
    ];
    conns.forEach(c => {
        connectors.push(new elmConnector(...c));
    });

    // title and others
    var title = createDiv('半加算器の動作<br/>A+B の結果がj,kに計算される(0+0=0,0+1=1,1+0=1,1+1=10)<br/>jは繰上りに相当する(2進数だから1+1=10に注意))');
    title.style('font-size','13px');
    title.position(10,10);
    // input A,B
    var capA = createDiv('A');
    capA.position(15 + xoff, 36 + yoff);

    var divA = createDiv('');
    divA.position(0 + xoff, 60 + yoff);
    divA.style('width', '30px')
    divA.style('height', '50px')
    divA.style('border', 'solid 1px');
    divA.style('background', c_A);

    inA = createRadio(divA);
    inA.option('0');
    inA.option('1');
    inA.style('width', '40px');
    inA.changed(logicPropagation);
    textAlign(CENTER);

    var capB = createDiv('B');
    capB.position(15 + xoff, 176 + yoff);

    var divB = createDiv('');
    divB.position(0 + xoff, 200 + yoff);
    divB.style('width', '30px')
    divB.style('height', '50px')
    divB.style('border', 'solid 1px');
    divB.style('background', c_B);

    inB = createRadio(divB);
    inB.option('0');
    inB.option('1');
    inB.style('width', '40px');
    inB.changed(logicPropagation);    
    textAlign(CENTER);

    let valp = [
        ['a', 100, 50, c_A, '10px', true],
        ['b', 100, 90, c_B, '10px', true],
        ['c', 100, 125, c_A, '10px', true],
        ['d', 100, 160, c_B, '10px', true],
        ['e', 100, 194, c_A, '10px', true],
        ['f', 100, 230, c_B, '10px', true],
        ['g', 210, 130, c_0, '10px', true],
        ['h', 330, 130, c_0, '10px', true],
        ['i', 330, 170, c_0, '10px', true],
        ['j', 440, 55, c_0, '10px', true],
        ['k', 440, 160, c_0, '10px', true],
        ['答え', 470, 150, c_0, '50px', false],
        ['繰上り', 470, 70, c_0, '50px', false],
        ['? + ? = ?', 200, 30, c_0, '100px', false],
    ];
    
    valp.forEach((v,i) => {
        labels[i] = createDiv(v[0]);
        labels[i].position(v[1] + xoff, v[2] + yoff);
        [['width', v[4]]].forEach(s => { labels[i].style(...s) });
        if(v[5]) {
            vals[i] = createSpan('?');
            vals[i].position(v[1] + xoff + 12, v[2] + yoff );
            [['font-weight', 'bold'], ['width', '8px'],
            ['color',v[3]]].forEach(s => {
                vals[i].style(...s) 
            });
        }
    });

    //make_connection(e1 = 0, i1 = 0, e2 = 1);
    //make_connection(e1 = 3, i1 = 1, e2 = 5);
    noLoop();
}

function logicPropagation() {
    vA = inA.selected();
    vB = inB.selected();
    if (vA !== undefined) { 
        [0, 2, 4].map(vs => { vals[vs].html(vA) }); 
        labels[13].html(vA + ' + ? = ?');
    };
    if (vB !== undefined) { 
        [1, 3, 5].map(vs => { vals[vs].html(vB) }); 
        labels[13].html('? + ' + vB + ' = ?');
    };

    if(vA !== undefined && vB !== undefined ) {
        bA = (vA == '1');
        bB = (vB == '1');
        vals[6].html(int(bA && bB));
        vals[7].html(int(!(bA && bB)));
        vals[8].html(int(bA || bB));
        vals[9].html(int(bA && bB));
        vals[10].html(int(!(bA && bB) && (bA || bB)));
        labels[13].html(
            vA + ' + ' + vB + ' = ' + 
            str(int(bA && bB)) + str(int(!(bA && bB) && (bA || bB)))
        );
    }
}

function draw() {
    background(255);
    elements.forEach( e => {
        e.draw();
    });
    connectors.forEach( c => {
        c.draw();
    });
}

function mouseClicked() {
}

function mouseMoved() {
}



//document.oncontextmenu = (e) => { e.preventDefault(); }
//document.oncontextmenu = (e) => { mouseClicked(); e.preventDefault(); }
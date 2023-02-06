const default_size = 50.0;
const mesh_unit = 5.0;

class mazeInfo {
    constructor(cx,cy,mesh=5.0) {
        this.mx = Math.ceil(cx / mesh);
        this.my = Math.ceil(cy / mesh);
        this.mesh = mesh;
        this.cells = [...Array(this.mx)].map((x) => [...Array(this.my)].map((y) => 0));
    }

    markCellsRect(oid,x1,y1,x2,y2) {
        [x1, y1, x2, y2] = [x1, y1, x2, y2].map((v) => Math.ceil(v / this.mesh));
        this.cells = this.cells.map((m, x) => m.map((v, y) => x>=x1&&x<=x2&&y>=y1&&y<=y2 ? oid : v)); 
    }

    clearCellsId(oid) {
        this.cells= this.cells.map(m => m.map(v => v == oid ? 0 : v));
    }

    makeConnection(x1,y1,x2,y2) {
        //console.log(x1,y1,x2,y2);
        [x1, y1, x2, y2] = [x1, y1, x2, y2].map((v) => Math.ceil(v / this.mesh));
        this.dir = [[1,0],[-1,0],[0,1],[0,-1]];

        this.target = this.cells.map(m => m.map(v => v));
        this.prev = this.cells.map(m => m.map(v => v));
        this.q = [[x1,y1]];
        this.path = []
        
        this.found = false;
        while(this.q.length > 0 && !this.found ) {
            this.cur = this.q.shift();
            for( this.d of this.dir ) {
                this.nx = this.cur[0] + this.d[0];
                this.ny = this.cur[1] + this.d[1];
                //console.log(this.nx,this.ny);
                if(this.nx < 0||this.ny < 0||this.nx >= this.mx||this.ny >= this.my) {
                    continue;
                }
                if( this.nx == x2 && this.ny == y2) {
                    this.prev[this.nx][this.ny] = [this.cur[0], this.cur[1]];
                    [this.rx, this.ry] = [this.nx, this.ny];
                    this.path.push([this.nx, this.ny])
                    while(this.rx != x1 && this.ry != y1 ) {
                        //console.log('shortest', this.path, this.rx, this.ry);
                        this.path.push(this.prev[this.rx][this.ry]);
                        [this.rx, this.ry] = this.prev[this.rx][this.ry];
                    }
                    //console.log('found!');
                    this.found = true;
                    break;
                }
                if(this.target[this.nx][this.ny] == 0) {
                    this.target[this.nx][this.ny] = 1;
                    this.q.push([this.nx, this.ny]);
                    this.prev[this.nx][this.ny] = [this.cur[0], this.cur[1]];
                }
            };
        } 
        //console.log('result',this.dist);
        //console.log(this.q.length,this.path.length);
        //saveStrings(this.target,'target.txt');
        return this.path
    }
}

function affine(p,xy,s) {
    return p.map((c, i) => { return c * s + xy[i % 2]; });    
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

class connector {
    constructor(nodes=[],color=c_normal,style=[],status='normal') {
        this.nodes = nodes;
        this.color = color;
        this.style = style;
        this.status = status;
    }

    draw() {
        stroke(this.color);
        this.current_style = drawingContext.getLineDash();
        this.nodes.forEach((n) => {
            line(...n);
        })
        drawingContext.setLineDash(this.current_style);
    }
}

class logicElement {
    singles = ['BUFFER', 'NOT'];
    constructor(maze,x=100.0,y = 100.0, etype = null, s = default_size, weight=1,con_len=0.25) {
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
        
        this.oid = Math.ceil(Math.random() * 99999);
        this.mark2maze(maze);
    };
    mark2maze(maze) {
        maze.markCellsRect(this.oid, this.x, this.y, this.x + this.s, this.y + this.s);
    }
    clear2maze(maze) {
        maze.clearCellsId(this.oid);
    }
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
    
    in_area(x,y){
        return x - this.x <= this.s*this.area && y - this.y < this.s*this.area;
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

    near_connector(x,y,nbr=10) {
        let c = this.out_xy()[0];
        if( Math.abs(c[0]-x) < nbr && Math.abs(c[1]-y) < nbr ) { return { conn: this.out, x: c[0], y:c[1] }; }
        
        return null;
    }
};

function merge_boundary(a1,b1,a2,b2) {
    let s1 = (a1 - a2) * (b1 - b2);
    let s2 = (a1 - b2) * (b1 - a2);
    if ( s1 > 0 && s2 > 0 ) {
        return []
    } 
    return [Math.min(a1, a2), Math.max(b1, b2)]
}

function get_boundaries(v) { // v = [[l1,r1],...]
    let result = [];
    while( v.length > 0) {
        let segment = v.pop();
        let matched = [];
        v.forEach((line,i) => {
            let incr = merge_boundary(...segment,...line);
            if( incr.length == 2) { // 0: no overwrap, 2: overwrapped
                segment = incr;
                matched.push(i);
            }
        });
        v = v.filter((v0, i) => { return !matched.includes(i);});        
        result.push(segment);
    }

    return result
}

var cc = ['red','blue','green','orange','pink','purple','yellow','black'];
class circuitInfo {
    constructor(maze,elements=[],connectors=[]) {
        this.elements = elements.map((p) => new logicElement(maze,...p));
        this.connectors = connectors.map((n) => new connector(n,c_normal,[],'normal'));
    }
    make_connection(e1,i1,e2) {
        this.elements[e1].input[i1] = this.elements[e2];
        this.a = this.elements[e1].in_xy()[i1];
        this.b = this.elements[e2].out_xy()[0];
        
    }

    bounding_boxes() {
        return this.elements.map((e) => {
            return [e.x,e.y,e.x+e.s,e.y+e.s]
        });
    }

    get_inclusions() {
        this.boxes = this.bounding_boxes();
        this.vertical_inclusions = get_boundaries(this.boxes.map(bb => [bb[0], bb[2]]));
        this.horizontal_inclusions = get_boundaries(this.boxes.map(bb => [bb[1], bb[3]]));

        /*this.vertical_inclusions.forEach((v, i) => {
            noFill();
            stroke(cc[i]);
            line(v[0] + i * 2, 0, v[0] + i * 2, canvas.height);
            line(v[1] + i * 2, 0, v[1] + i * 2, canvas.height);
            stroke(c_normal);
        })
        this.horizontal_inclusions.forEach((v, i) => {
            noFill();
            stroke(cc[i]);
            line(0,v[0] + i * 2, canvas.width, v[0] + i * 2);
            line(0,v[1] + i * 2, canvas.width, v[1] + i * 2);
            stroke(c_normal);
        })*/
        return this.vertical_inclusions;
    }

    connect_nodes(maze,a, b) {
        res = this.connect_lines = maze.makeConnection(a[0],a[1],b[0],b[1]);
        stroke('red');
        res.forEach(p => {
            circle(p[0]*mesh_unit,p[1]*mesh_unit,3);
        })
        stroke('black');

        line(a[0], a[1], a[0], a[1] + (b[1] - a[1]) / 2);
        line(a[0], a[1] + (b[1] - a[1]) / 2, b[0], a[1] + (b[1] - a[1]) / 2);
        line(b[0], a[1] + (b[1] - a[1]) / 2, b[0], b[1]);
    }

}

var circuit,maze;
var conn_lead = null;
const cx = 650, cy=600
function setup() {
    createCanvas(cx,cy);
    maze = new mazeInfo(cx,cy,mesh_unit);
    circuit = new circuitInfo(maze,elements=[
        [30, 80, 'AND'],[35, 205, 'OR'],[30, 320, 'BUFFER'],
        [30, 440, 'XOR'],[200, 80, 'NAND'], [200, 200, 'NOR'],
        [200, 320, 'NOT'],[200, 440, 'XNOR'], ],
        connectors = [
        //    [[40,40,40,100],[40,100,180,100]],
        ],
    );

    loopCheck = createCheckbox('Loop',false);
    loopCheck.changed(toggleLoop);
    loopCheck.position(0,0);

    showGrid = createCheckbox('Grid',false);
    showGrid.position(80,0);

    circuit.make_connection(e1 = 0, i1 = 0, e2 = 1);
    circuit.make_connection(e1 = 3, i1 = 1, e2 = 5);
    //circuit.make_connection(e1 = 2, i1 = 0, e2 = 4);
    //frameRate(0.3);
    noLoop();
}

function toggleLoop() { if(this.checked()) {loop();} else {noLoop();} }

var res;
function draw() {
    background(255);

    circuit.get_inclusions();
    circuit.elements.forEach( e => {
        e.draw();
        e.input.forEach((inp,k) => {
            if(inp) {
                a = e.in_xy()[k];
                b = inp.out_xy()[0];
                circuit.connect_nodes(maze,a,b);
            }
        });
        noFill();
        rect(e.x,e.y,e.s,e.s);
    });
    circuit.connectors.forEach( c => {
        c.draw();
    });

    if (conn_lead) {
        stroke(c_connecting);
        drawingContext.setLineDash([3]);
        line(conn_lead.x, conn_lead.y, conn_lead.x + (mouseX - conn_lead.x) / 2, conn_lead.y);
        line(conn_lead.x + (mouseX - conn_lead.x) / 2, conn_lead.y, conn_lead.x + (mouseX - conn_lead.x) / 2, mouseY);
        line(conn_lead.x + (mouseX - conn_lead.x) / 2, mouseY, mouseX, mouseY);

        stroke(c_normal);
        drawingContext.setLineDash([0]);
    }
}

function mouseClicked() {
    if (mouseButton == RIGHT) {
        console.log('right')
        circuit.elements.some(e => {
            conn_lead = e.near_connector(mouseX, mouseY);
            if(conn_lead) {
                return true;
            }
        })
    } else if (mouseButton == LEFT) {
        circuit.elements.some(e => {
            if (e.moving) {
                e.moving = false;
                e.color = c_normal;
                e.clear2maze(maze);
                e.mark2maze(maze);
                return true;
            }
            if (e.in_area(mouseX, mouseY)) {
                e.moving = true;
                e.color = c_moving
                return true;
            }
        })
    }
}

function mouseMoved() {
    circuit.elements.some(e => {
        if (e.moving) {
            e.x = mouseX;
            e.y = mouseY;
        }
    });
}



//document.oncontextmenu = (e) => { e.preventDefault(); }
document.oncontextmenu = (e) => { mouseClicked(); e.preventDefault(); }
let keyboards = {
    'JP': [
        {
            '1': '!', '2': '"', '3': '#', '4': '$','5':'%','6':'&','7':"'",'8':'(','9':')','0':'','-':'=','^':'~','\\':'|'
        },
        {
            'q': 'Q','w':'W','e':'E','r':'R','t':'T','y':'Y','u':'U','i':'I','o':'O','p':'P','@':'`','[':'{'
        },
        {
            'a':'A','s':'S','d':'D','f':'F','g':'G','h':'H','j':'J','k':'K','l':'L',';':'+',':':'*',']':'}'
        },
        {
            'z':'Z','x':'X','c':'C','v':'V','b':'B','n':'N','m':'M',',':'<','.':'>','/':'?','\\':'_'
        }
    ]
}
let kbd;
let kbtype = 'JP';

let pos = -1;
let start = 0.0;
let running = 0.0.toFixed(3);
let typing,elapsed,text;
let ccolor = 'red';

let texts = { 
    'default': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'hosei': 'Hosei University',
};
let target = 'default';

function makeKeyboard(kb,sh,x,y,dx,dy) {
    let shifted = [Object.keys,Object.values];
    let kbd0 = kb.map( (ks,j) => {
        let row = shifted[sh](ks).map((k, i) => {
            let ktop = createSpan(k);
            ktop.position(x + i*dx + j * dx/2 ,y + j*dy);
            ktop.style(`border: 1px solid; height: ${dy}px; width: ${dx}px;`)
            ktop.class('keytop');
            return [k,ktop];
        });
        return row;
    });
    let kbdflat = kbd0.reduce((a,b) => a.concat(b),[]);

    return kbdflat.reduce((obj, x) => Object.assign(obj, { [x[0]]: x[1] }), {})
}

function letterMarkUp(t,x,y,dx) {
    let letters = [...t].map((c) => createSpan(c));
    [...letters].map((s, i) => {
        s.id(`tchar${i}`);
        s.position(x + dx * i, y);
        s.class('letters');
    });

    return letters
}

function setup() {
    elapsed = createDiv("0.0");
    elapsed.style('font-size: 16px;');
    elapsed.position(200, 100);

    typing = createDiv("A");
    typing.style('font-size: 18px;');
    typing.position(200, 150);

    text = letterMarkUp(texts[target],200,125,16);

    kbd = makeKeyboard(keyboards[kbtype],0,200,200,30,30);
}

function draw() {
    let p = pos > 0 ? pos : 0;

    if( p > 0) {
        running = ((millis() - start) / 1000.0).toFixed(3); 
    }
    elapsed.html(`Time: ${running} sec`);
    selectAll(`.letters`).map(s => s.style('color: black'));
    select(`#tchar${p}`).style('color: red');
    typing.html(`Next: <u>${texts[target][p]}</u>`);
    
    selectAll('.keytop').map(k => k.style('color:black'));
    kbd[texts[target][p].toLowerCase()].style('color:red');
}

function keyTyped() {
    if(pos > 0) {
        if( texts[target][pos].toUpperCase() == key.toUpperCase() ) {
             pos = (pos + 1) % texts[target].length;
             if( pos == 0 ) { pos = -1; }
        }      
    } else {
        if (texts[target][0].toUpperCase() == key.toUpperCase()) {
            start = millis(); 
            pos = 1;
        }
    }
}

function keyPressed() {
    if( keyCode == TAB ) { return false; }
    if( keyCode == ESCAPE ) { pos = -1; }
}
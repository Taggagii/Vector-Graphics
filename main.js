var screen = document.getElementById("screen");
var context = screen.getContext("2d");

var screenSize = Math.min(window.innerHeight, window.innerWidth);
screen.width = screenSize;
screen.height = screenSize;

function clear() {
    context.fillStyle = "white";
    context.fillRect(0, 0, screen.width, screen.height);
}

function reduce(numerator, denominator){
    let ns = Math.sign(numerator);
    let ds = Math.sign(denominator);
    numerator = Math.abs(numerator);
    denominator = Math.abs(denominator);
    if (!numerator && !denominator) return [0, 0];
    if (!numerator) return [0, ds];
    if (!denominator) return [ns, 0];
    var gcd = function gcd(a,b){
      return b ? gcd(b, a%b) : a;
    };
    gcd = gcd(numerator, denominator);
    return [ns * numerator/gcd, ds * denominator/gcd];
  }

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class Image {
    constructor(points = [], color = "black", thickness = 1) {
        this.points = [];
        for (var i = 0; i < points.length; ++i) {
            this.addPoint(points[i][0], points[i][1]);
        }
        this.thickness = thickness;
        this.color = color;
    }

    addPoint(x, y) {
        this.points.push(new Point(x, y));
    }
    
    addRandomPoint() {
        this.points.push(new Point(Math.floor(Math.random() * screen.width), Math.floor(Math.random() * screen.height)));
    }

    render() {
        if (!this.points.length) return;
        let color = context.strokeStyle;
        let thickness = context.lineWidth;
        context.strokeStyle = this.color;
        context.lineWidth = this.thickness;
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 1; i < this.points.length; ++i) {
            context.lineTo(this.points[i].x, this.points[i].y);
            context.moveTo(this.points[i].x, this.points[i].y);
        }
        context.stroke();
        context.strokeStyle = color;
        context.thickness = thickness;
    }
}

function colorToRGB(color) {
    let d = document.createElement("div");
    d.style.color = color;
    document.body.appendChild(d);
    let rgbColor = window.getComputedStyle(d).color;
    d.remove();
    return rgbColor;
}

function transition(imageOne, imageTwo, delay = 10) {
    let framesForRender = 100;
    console.log("testing things");
    if (imageOne.points.length != imageTwo.points.length) {
        console.log("this function does not work with different sized objects yet");
        return;
    }

    let dx = [];
    let dy = [];
    let values = [];
    console.log(imageOne.points, imageTwo.points);
    for (var i = 0; i < imageOne.points.length; ++i) {
        dx.push((imageTwo.points[i].x - imageOne.points[i].x) / framesForRender);
        dy.push((imageTwo.points[i].y - imageOne.points[i].y) / framesForRender);
    }

    let points = [];
    for (var i = 0; i < imageOne.points.length; ++i) {
        points.push([imageOne.points[i].x, imageOne.points[i].y]);
    }

    let translationImage = new Image(points, "blue", imageOne.thickness);
    console.log(dx, dy, translationImage);
    let todo = [];
    
    for (var i = 0; i < dx.length; ++i) {
        todo.push(1);
    }

    
    function move(frame = 0) {
        let stillGoing = false;
        clear();
        translationImage.render();
        

        for (var ii = 0; ii < dx.length; ++ii) {
            if (!todo[ii]) continue;
            stillGoing = true;

            translationImage.points[ii].x += dx[ii];
            translationImage.points[ii].y += dy[ii];

            // if (translationImage.points[ii].x == imageTwo.points[ii].x && 
            //     translationImage.points[ii].y == imageTwo.points[ii].y) {
            //         todo[ii] = 0;
            //     }
        }

        if (frame == framesForRender) return;
        setTimeout(() => {
            move(frame + 1);
        }, delay);
    }
    move();
}

// let one = new Image([[100, 100], [200, 200], [100, 200], [200, 100]], "black", 2);
// let two = new Image([[100, 500], [200, 140], [100, 200], [200, 100]], "red", 2);

function wait() {
    one.render();
    two.render();
    setTimeout(() => {
        transition(one, two, 0);
    }, 2000);
}

// wait();

let one = new Image([], "black", 2);
let two = new Image([], "red", 2);

screen.addEventListener("mousedown", (event) => {
    console.log(event.x, event.y);
    console.log(event.button);
    switch (event.button) {
        case 0:
            one.addPoint(event.x, event.y);
            one.render();
            break;
        case 2:
            two.addPoint(event.x, event.y);
            two.render();
            break;
    }
});

document.addEventListener("keypress", (event) => {
    console.log(event.key);
    if (event.key == "t") {
        console.log("testing things");
        transition(one, two, 0);
    }
})

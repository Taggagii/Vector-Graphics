var screen = document.getElementById("screen");
var context = screen.getContext("2d");

var screenSize = Math.min(window.innerHeight, window.innerWidth);
screen.width = screenSize;
screen.height = screenSize;

function clear() {
    context.fillStyle = "white";
    context.fillRect(0, 0, screen.width, screen.height);
}


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    constant_multiply(a) {
        return new Point(this.x * a, this.y * a);
    }

    add_points(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }

    sub_points(other) {
        return new Point(this.x - other.x, this.y - other.y);
    }

    render(color) {
        context.beginPath();
        context.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        context.fill();
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
        context.strokeStyle = this.color;
        context.fillStyle = this.color;
        context.lineWidth = this.thickness;
        // for (var i = 0 ; i < this.points.length; ++i) {
        //     this.points[i].render();
        // }
        // context.beginPath();
        
        // context.moveTo(this.points[0].x, this.points[0].y);
        // context.arc(this.points[0].x, this.points[0].y, 5, 0, 2 * Math.PI);
        // for (var i = 1; i < this.points.length; ++i) {
        //     context.arc(this.points[i].x, this.points[i].y, 5, 0, 2 * Math.PI);
        //     context.lineTo(this.points[i].x, this.points[i].y);
        //     context.moveTo(this.points[i].x, this.points[i].y);
        // }

        // context.stroke();

        // and we do special rendering in GREEN
        context.beginPath();
        
        // for every three points we treat the middle point as a bezier curve
        for (var i = 0; i < this.points.length - 2; i += 2) {
            let p1 = this.points[i];
            let p2 = this.points[i + 1];
            let p3 = this.points[i + 2]
            
            // let's iterate t for n times
            let n = 100;
            context.moveTo(p1.x, p1.y);
            let x = 0;
            let y = 0;
            let const1 = p2.sub_points(p1).constant_multiply(2);
            let const2 = p1.sub_points(p2.constant_multiply(2)).add_points(p3);
            for (var t_base = 0; t_base < n; ++t_base) {
                // treat t as t = t / n as 0 <= t <= 1
                // and generate the points
                let t = t_base / n;

                // let output = p1.constant_multiply(1 - t).add_points(p2.constant_multiply(t)).constant_multiply(1 - t).add_points(p2.constant_multiply(1 - t).add_points(p3.constant_multiply(t)).constant_multiply(t));
                let output = p1.add_points(const1.constant_multiply(t)).add_points(const2.constant_multiply(t * t));
                context.lineTo(output.x, output.y);
            }
            context.lineTo(p3.x, p3.y);
        }

        context.stroke();
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
    console.log(imageOne.points, imageTwo.points);
    if (!(imageOne.points.length > 1 && imageTwo.points.length > 1)) return;
    let framesForRender = 1000;
    // if (imageOne.points.length != imageTwo.points.length) {
    //     console.log("one: ", imageOne.points.length);
    //     console.log("two: ", imageTwo.points.length);
    //     console.log("this function does not work with different sized objects yet");
    //     return;
    // }

    let finalPoints = [];
    for (var i = 0; i < imageTwo.points.length; ++i) {
        finalPoints.push([imageTwo.points[i].x, imageTwo.points[i].y]);
    }

    let finalImage = new Image(finalPoints, imageTwo.color, imageTwo.thickness);

    let startCount = imageOne.points.length;
    let endCount = finalImage.points.length;

    let points = [];
    for (var i = 0; i < imageOne.points.length; ++i) {
        points.push([imageOne.points[i].x, imageOne.points[i].y]);
    }
    let translationImage = new Image(points, "blue", imageOne.thickness); 

    if (startCount <= endCount) {
        while (true) {
            for (var i = 0; i < translationImage.points.length - 1; i += 2) {
                if (startCount == endCount) break;
    
                translationImage.points.splice(i + 1, 0, new Point((translationImage.points[i].x + translationImage.points[i + 1].x) / 2, 
                                                               (translationImage.points[i].y + translationImage.points[i + 1].y) / 2));
    
                ++startCount;
            }
            if (startCount == endCount) break;        
        }
    } else {
        while (true) {
            for (var i = 0; i < finalImage.points.length - 1; i += 2) {
                if (endCount == startCount) break;
    
                finalImage.points.splice(i + 1, 0, new Point((finalImage.points[i].x + finalImage.points[i + 1].x) / 2, 
                                                         (finalImage.points[i].y + finalImage.points[i + 1].y) / 2));
    
                ++endCount;
            }
            if (endCount == startCount) break;        
        }
    }

    console.log(finalImage);

    

    let dx = [];
    let dy = [];
    for (var i = 0; i < translationImage.points.length; ++i) {
        dx.push((finalImage.points[i].x - translationImage.points[i].x) / framesForRender);
        dy.push((finalImage.points[i].y - translationImage.points[i].y) / framesForRender);
    }

    

    
    function move(frame = 0) {
        clear();
        translationImage.render();
        

        for (var ii = 0; ii < dx.length; ++ii) {
            stillGoing = true;

            translationImage.points[ii].x += dx[ii];
            translationImage.points[ii].y += dy[ii];

            // if (translationImage.points[ii].x == finalImage.points[ii].x && 
            //     translationImage.points[ii].y == finalImage.points[ii].y) {
            //         todo[ii] = 0;
            //     }
        }

        if (frame == framesForRender) {
            imageOne.render();
            imageTwo.render();
            return;
        };
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
    let rect = screen.getBoundingClientRect();
    let x = event.x - rect.x;
    let y = event.y - rect.y;

    switch (event.button) {
        case 0:
            clear();
            one.addPoint(x, y);
            one.render();
            two.render();
            break;
        case 1: //  moving a point
            clear();
            // find the point
            // to start off we'll only move points in the first image


            one.render();
            two.render();
            break;

        case 2:
            clear()
            two.addPoint(x, y);
            one.render();
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

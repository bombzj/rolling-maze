
var b2d, world, phyScale = 100
var myQueryCallback
var mouseJointGroundBody

function loadWorld() {

    if(world) {
        b2d.destroy(world)
        app.stage.removeChildren()
    }

    let gravity = new b2d.b2Vec2(0.0, 0.0)
    // debug
    // level.ball.x = level.debug.x
    // level.ball.y = level.debug.y
    // gravity = new b2d.b2Vec2(level.debug.dx, level.debug.dy)

    world = new b2d.b2World( gravity )

    addWall(wallLeft + 4 * wallLength, wallTop, 8 * wallLength, wallWidth )
    addWall(wallLeft + 4 * wallLength, wallTop + 8 * wallLength, 8 * wallLength, wallWidth)
    addWall(wallLeft + 8 * wallLength, wallTop + 4 * wallLength, wallWidth, 8 * wallLength)
    addWall(wallLeft, wallTop + 4 * wallLength, wallWidth, 8 * wallLength)

    for(let i = 0;i < level.wallH.length;i++) {
        let wall2 = level.wallH[i]
        for(let j = 0;j < wall2.length;j++) {
            if(wall2[j] == 1) {
                addWall(wallLeft + (j+0.5) * wallLength, wallTop + (i+1) * wallLength, wallLength, wallWidth)
            }
        }
    }
    for(let i = 0;i < level.wallV.length;i++) {
        let wall2 = level.wallV[i]
        for(let j = 0;j < wall2.length;j++) {
            if(wall2[j] == 1) {
                addWall(wallLeft + (j+1) * wallLength, wallTop + (i + 0.5) * wallLength, wallWidth, wallLength)
            }
        }
    }

    for(let i = 0;i < level.holes.length;i++) {
        let x = level.holes[i][0]
        let y = level.holes[i][1]
        addHole(wallLeft + (x+0.5) * wallLength, wallTop + (y+0.5) * wallLength, wallLength / 2.7)
    }

    addExit(wallLeft + (level.exit.x+0.5) * wallLength, wallTop + (level.exit.y+0.5) * wallLength, 10, 10)
    addBall(wallLeft + (level.ball.x+0.5) * wallLength, wallTop + (level.ball.y+0.5) * wallLength, 15)

    world.SetContactListener( listener )
    mouseJointGroundBody = world.CreateBody( new b2d.b2BodyDef() )
}

var listener
function initBox2d() {
    listener = new b2d.JSContactListener();
    listener.BeginContact = function (contactPtr) {
        var contact = b2d.wrapPointer( contactPtr, b2d.b2Contact )
        var fixtureA = contact.GetFixtureA()
        var fixtureB = contact.GetFixtureB()
        if(fixtureA.isExit) {
            if(fixtureB.isBall) {
                ballSprite.alpha = 0
                stopWorld()
                setTimeout(nextLevel, 200)
            }
        }
    }
    listener.EndContact = function() {}
    listener.PreSolve = function() {}
    listener.PostSolve = function() {}

    window.addEventListener('mousemove', function(e) {
        let pos = {x: e.clientX - app.view.offsetLeft, y: e.clientY - app.view.offsetTop}
        onMouseMove(pos);
    }, false);
    
    window.addEventListener('mousedown', function(e) {
        let pos = {x: e.clientX - app.view.offsetLeft, y: e.clientY - app.view.offsetTop}
        onMouseDown(pos);
    }, false);

    window.addEventListener('mouseup', function(e) {
        let pos = {x: e.clientX - app.view.offsetLeft, y: e.clientY - app.view.offsetTop}
        onMouseUp(pos);
    }, false);
    
    // window.addEventListener('mouseout', function(e) {
    //     onMouseOut(evt.data.global);
    // }, false);
}


var curLevel
var level
function nextLevel() {
    curLevel++
    if(curLevel >= levels.length) {
        resetLevel()
    } else {
        level = levels[curLevel]
        loadWorld()
    }
}
function resetLevel() {
    curLevel = 0
    level = levels[curLevel]
    loadWorld()
}


function addBall(x, y, r) {
    let shape = new b2d.b2CircleShape();
    shape.set_m_radius(r/phyScale);

    let bd = new b2d.b2BodyDef();
    bd.set_type(b2d.b2_dynamicBody)
    bd.set_position(new b2d.b2Vec2(x/phyScale , y/phyScale))
    bd.allowSleep = false
    // bd.set_friction(0.1)
    let body = world.CreateBody(bd)
    let fx = body.CreateFixture(shape, 10.0)
    fx.isBall = true
    fx.SetRestitution(0.25)
    // body.SetAwake(true)

    var ball = new PIXI.Graphics()
    ball.beginFill(0x0)
    ball.drawCircle(0, 0, r, r)
    ball.endFill()
    ball.x = x
    ball.y = y
    app.stage.addChild(ball)
    ballSprite = ball
    ballSprite.body = body
}

function addWall(x, y, w, h) {
    let shape = new b2d.b2PolygonShape()
    shape.SetAsBox(w/phyScale/2, h/phyScale/2)
    let bd = new b2d.b2BodyDef()
    bd.set_position(new b2d.b2Vec2(x/phyScale, y/phyScale))
    let body = world.CreateBody(bd)
    let fx = body.CreateFixture(shape, 5.0)
    fx.isExit = false

    var boundary = new PIXI.Graphics()
    boundary.beginFill(0x0)
    boundary.drawRect(x, y, w, h)
    boundary.endFill()
    boundary.x = -w/2
    boundary.y = -h/2
    app.stage.addChild(boundary)
}

function addExit(x, y, w, h) {
    let shape = new b2d.b2PolygonShape()
    shape.SetAsBox(w/phyScale/2, h/phyScale/2)
    let bd = new b2d.b2BodyDef()
    bd.set_position(new b2d.b2Vec2(x/phyScale, y/phyScale))
    let body = world.CreateBody(bd)
    let fx = body.CreateFixture(shape, 5.0)
    fx.isExit = true

    var boundary = new PIXI.Graphics()
    boundary.beginFill(0xff0000)
    boundary.drawRect(x, y, w, h)
    boundary.endFill()
    boundary.x = -w/2
    boundary.y = -h/2
    app.stage.addChild(boundary)
}

function addHole(x, y, size) {

    var ball = new PIXI.Graphics()
    ball.beginFill(0x00ffffff, 0)
    ball.lineStyle(2, 0, 1)
    ball.drawCircle(0, 0, size, size)
    ball.endFill(0x0)
    ball.x = x
    ball.y = y
    app.stage.addChild(ball)
}

function updateWorld() {
    if(!world.stop) {
        world.Step(1/60, 3, 2)
        let pos = ballSprite.body.GetPosition()
        ballSprite.x = pos.get_x()*phyScale
        ballSprite.y = pos.get_y()*phyScale

        for(let hole of level.holes) {
            let dx = wallLeft + (hole[0]+0.5) * wallLength - ballSprite.x
            let dy = wallTop + (hole[1]+0.5) * wallLength - ballSprite.y
            let r = wallLength / 2.7
            if(dx*dx + dy*dy < r*r) {
                ballSprite.alpha = 0
                stopWorld()
                setTimeout(function() {
                    resetLevel()
                }, 2000)
                break
            }
        }
    }
}

function stopWorld() {
    world.stop = true
    world.SetContactListener( null )
}


var levels = [
    {       // 1
        wallH: [
            [0,1,1,0,1,1,0,0,],
            [1,0,0,1,1,1,0,0,],
            [0,0,0,0,1,1,1,1,],
            [1,1,1,1,1,1,0,0,],
            [0,0,1,1,1,1,1,1,],
            [0,0,0,1,0,0,0,0,],
            [0,0,1,1,1,0,1,1,],
        ],
        wallV: [
            [0,1,0,1,1,0,1,],
            [0,0,0,0,0,0,0,],
            [1,1,1,0,0,0,1,],
            [0,1,0,0,0,0,1,],
            [1,0,0,0,0,0,1,],
            [1,1,0,0,1,0,0,],
            [1,0,1,0,0,0,1,],
            [0,1,0,1,0,0,0,],
        ],
        holes: [
            [6, 6],
            [2, 2.5],
        ],
        ball: {x: 7, y: 7},
        exit: {x: -0.4, y: 3},
        debug: {x: 1, y: 3, dx: -5, dy: 0}
    }, 
    {       // 2
        wallH: [
            [0,1,1,0,0,1,0,0,],
            [1,0,1,0,0,1,0,1,],
            [1,0,0,1,1,1,1,0,],
            [0,0,1,0,1,1,0,1,],
            [1,1,1,1,1,1,0,0,],
            [0,0,0,1,1,0,0,0,],
            [1,0,1,1,1,1,1,0,],
        ],
        wallV: [
            [1,0,0,1,0,1,1,],
            [1,0,0,1,0,0,1,],
            [1,1,0,0,1,0,0,],
            [0,1,0,0,0,0,1,],
            [1,0,0,0,0,0,1,],
            [1,0,0,0,0,0,1,],
            [1,1,0,0,0,1,1,],
            [1,1,0,1,0,0,1,],
        ],
        holes: [
            [2, 2.5],
            [4.5, 4],
            [3.5, 5],
        ],
        ball: {x: 7, y: 3},
        exit: {x: 1, y: 7.4},
        debug: {x: 1, y: 6, dx: 0, dy: 5}
    }, 
    {       // 3
        wallH: [
            [0,0,1,1,1,1,1,0],
            [0,0,0,1,0,0,0,1],
            [0,1,1,1,1,1,0,0],
            [1,0,1,0,1,0,0,1],
            [0,0,1,1,1,1,1,1],
            [1,0,1,0,1,0,0,1],
            [0,1,0,1,0,1,0,0],
        ],
        wallV: [
            [1,1,1,0,1,0,1],
            [1,1,0,0,1,0,1],
            [1,0,1,0,0,1,1],
            [1,0,1,0,0,1,1],
            [1,0,0,0,0,0,0],
            [0,1,0,0,0,1,0],
            [1,0,0,1,0,0,1],
            [1,0,0,1,0,1,1],
        ],
        holes: [
            [3, 2],
            [2, 3],
            [4, 4],
            [2, 5],
        ],
        ball: {x: 6, y: 7},
        exit: {x: 1, y: -0.4},
        debug: {x: 1, y: 1, dx: 0, dy: -5}
    }, 
    {       // 4
        wallH: [
            [1,1,0,1,0,0,0,1,],
            [0,0,1,0,1,0,1,0,],
            [1,0,1,0,0,1,0,1,],
            [1,1,0,0,0,0,1,0,],
            [1,0,1,1,0,1,1,1,],
            [0,0,0,0,1,0,0,0,],
            [1,1,1,1,1,1,0,1,],
        ],
        wallV: [
            [1,0,1,0,1,1,1,],
            [1,0,0,0,1,0,1,],
            [1,0,0,1,1,0,1,],
            [1,0,1,0,1,0,0,],
            [0,0,0,1,0,0,1,],
            [1,1,0,0,1,0,1,],
            [1,0,1,0,0,1,1,],
            [1,0,1,1,0,1,1,],
        ],
        holes: [
            [2,2],
            [3,4],
            [4,2],
            [4,5],
            [6,4],
        ],
        ball: {x: 6, y: 0},
        exit: {x: 6, y: 7.4},
    }, 
    {       // 5
        wallH: [
            [0,1,1,1,1,1,1,0,],
            [1,0,0,1,0,0,1,1,],
            [0,1,0,1,0,0,0,1,],
            [1,0,1,0,0,0,1,1,],
            [1,1,0,0,0,1,0,0,],
            [0,0,0,0,0,0,0,1,],
            [1,0,0,1,0,0,1,0,],
        ],
        wallV: [
            [1,1,0,1,0,0,1,],
            [1,1,0,0,1,0,1,],
            [1,0,0,0,0,1,0,],
            [1,0,1,0,1,0,0,],
            [0,0,1,1,1,0,1,],
            [1,1,1,0,0,1,1,],
            [1,0,1,1,1,0,1,],
            [1,1,0,1,1,0,1,],
        ],
        holes: [
            [1,2],
            [3,2],
            [5,2],
            [4,4],
            [4,6],
        ],
        ball: {x: 1, y: 7},
        exit: {x: 7.5, y: 2},
    }, 
    {       // 6
        wallH: [
            [0,1,0,0,1,0,1,0,],
            [1,0,0,0,0,1,0,1,],
            [0,1,1,1,1,0,0,0,],
            [1,0,0,1,0,1,0,1,],
            [1,0,1,0,1,1,1,1,],
            [1,0,0,1,0,0,0,1,],
            [0,1,0,1,1,0,0,0,],
        ],
        wallV: [
            [1,0,1,1,1,0,1,],
            [0,0,1,0,1,0,0,],
            [0,0,0,1,0,0,0,],
            [1,0,0,0,1,0,1,],
            [1,0,0,1,0,0,1,],
            [1,0,0,1,0,1,0,],
            [0,0,0,0,1,0,1,],
            [1,0,1,0,1,1,0,],
        ],
        holes: [
            [6,1],
            [5,3],
            [1,3],
            [3,5],
        ],
        ball: {x: 7, y: 5},
        exit: {x: 1.5, y: 1.5},
    }, 
    {       // 7
        wallH: [
            [0,0,0,0,0,0,0,0,],
            [0,0,0,0,1,0,0,0,],
            [0,0,0,0,0,0,0,0,],
            [0,0,0,0,0,0,0,0,],
            [0,1,1,1,0,1,1,0,],
            [0,0,0,0,0,0,0,1,],
            [0,0,0,0,0,0,0,0,],
        ],
        wallV: [
            [1,0,0,0,0,0,0,],
            [1,0,0,1,0,0,0,],
            [1,0,0,0,1,0,0,],
            [1,0,0,0,1,0,0,],
            [1,0,0,0,1,0,0,],
            [0,0,1,0,1,0,0,],
            [0,0,0,0,1,0,0,],
            [0,0,0,0,1,0,0,],
        ],
        holes: [
            [1,0],
            [5,0],
            [3,1],
            [6,1],
            [2,2],
            [7,2],
            [5,3],
            [7,3],
            [1,4],
            [3,4],
            [0,6],
            [2,6],
            [4,6],
            [6,6],
            [0,7],
        ],
        ball: {x: 7, y: 7},
        exit: {x: 0, y: 0},
    }, 

]

var wallLength = 60, wallWidth = 3
var wallLeft = 60, wallTop = 60





var mouseDown = false
var mouseJoint = null
function onMouseDown(pos) {            
    startMouseJoint(pos)
    mouseDown = true
}
function onMouseMove(pos) {
    if ( mouseDown && mouseJoint != null ) {
        mouseJoint.SetTarget( new b2d.b2Vec2(pos.x/phyScale, pos.y/phyScale) );
    }
}
function onMouseUp() {
    mouseDown = false
    world.DestroyJoint(mouseJoint)
    mouseJoint = null
}
function startMouseJoint(pos) {
    if ( mouseJoint != null )
        return
    
    let body = ballSprite.body
    var md = new b2d.b2MouseJointDef();
    md.set_bodyA(mouseJointGroundBody);
    md.set_bodyB(body);
    md.set_target( new b2d.b2Vec2(pos.x/phyScale, pos.y/phyScale) );
    md.set_maxForce( 100 * body.GetMass() );
    md.set_collideConnected(true);
    
    mouseJoint = b2d.castObject( world.CreateJoint(md), b2d.b2MouseJoint );
    body.SetAwake(true);
}
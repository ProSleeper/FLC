const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
    AIR,
    FLUX,
    UNBREAKABLE,
    PLAYER,
    STONE,
    FALLING_STONE,
    BOX,
    FALLING_BOX,
    KEY1,
    LOCK1,
    KEY2,
    LOCK2,
}

interface FallingState {
    isFalling(): boolean;
    moveHorizontal(tile: Tile, dx: number): void;
}

class Falling implements FallingState {
    isFalling(): boolean {
        return true;
    }
    moveHorizontal(tile: Tile, dx: number): void {}
}

class Resting implements FallingState {
    isFalling(): boolean {
        return false;
    }
    moveHorizontal(tile: Tile, dx: number): void {
        if (map[playery][playerx + dx + dx].isAir() && !map[playery + 1][playerx + dx].isAir()) {
            map[playery][playerx + dx + dx] = tile;
            moveToTile(playerx + dx, playery);
        }
    }
}

class FallStrategy {
    constructor(private falling: FallingState) {}
    isFalling() {
        return this.falling;
    }
    update(tile: Tile, x: number, y: number): void {
        this.falling = map[y + 1][x].isAir() ? new Falling() : new Resting();
        this.drop(tile, x, y);
    }
    drop(tile: Tile, x: number, y: number) {
        if (this.falling.isFalling()) {
            map[y + 1][x] = tile;
            map[y][x] = new Air();
        }
    }
}

interface Tile {
    isAir(): boolean;
    isLock1(): boolean;
    isLock2(): boolean;
    draw(g: CanvasRenderingContext2D, x: number, y: number): void;
    moveHorizontal(dx: number): void;
    moveVertical(dy: number): void;
    update(x: number, y: number): void;
}
class Air implements Tile {
    isAir() {
        return true;
    }
    isLock1() {
        return false;
    }
    isLock2() {
        return false;
    }
    draw(g: CanvasRenderingContext2D, x: number, y: number): void {}

    moveVertical(dy: number): void {
        moveToTile(playerx, playery + dy);
    }

    moveHorizontal(dx: number): void {
        moveToTile(playerx + dx, playery);
    }
    update(x: number, y: number): void {}
}

class Flux implements Tile {
    isAir() {
        return false;
    }

    isLock1() {
        return false;
    }

    isLock2() {
        return false;
    }

    draw(g: CanvasRenderingContext2D, x: number, y: number): void {
        g.fillStyle = "#ccffcc";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    moveVertical(dy: number): void {
        moveToTile(playerx, playery + dy);
    }

    moveHorizontal(dx: number): void {
        moveToTile(playerx + dx, playery);
    }
    update(x: number, y: number): void {}
}

class Unbreakable implements Tile {
    isAir() {
        return false;
    }

    isLock1() {
        return false;
    }

    isLock2() {
        return false;
    }

    draw(g: CanvasRenderingContext2D, x: number, y: number): void {
        g.fillStyle = "#999999";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    moveVertical(dy: number): void {}

    moveHorizontal(dx: number): void {}

    update(x: number, y: number): void {}
}

class Player implements Tile {
    isAir() {
        return false;
    }

    isLock1() {
        return false;
    }

    isLock2() {
        return false;
    }

    draw(g: CanvasRenderingContext2D, x: number, y: number): void {}

    moveVertical(dy: number): void {}

    moveHorizontal(dx: number): void {}

    update(x: number, y: number): void {}
}

class Stone implements Tile {
    private fallStrategy: FallStrategy;
    constructor(falling: FallingState) {
        this.fallStrategy = new FallStrategy(falling);
    }
    isAir() {
        return false;
    }

    isLock1() {
        return false;
    }

    isLock2() {
        return false;
    }

    draw(g: CanvasRenderingContext2D, x: number, y: number): void {
        g.fillStyle = "#0000cc";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    moveVertical(dy: number): void {}
    moveHorizontal(dx: number): void {
        this.fallStrategy.isFalling().moveHorizontal(this, dx);
    }
    update(x: number, y: number): void {
        this.fallStrategy.update(this, x, y);
    }
}

class Box implements Tile {
    private fallStrategy: FallStrategy;
    constructor(falling: FallingState) {
        this.fallStrategy = new FallStrategy(falling);
    }
    isAir() {
        return false;
    }
    isLock1() {
        return false;
    }

    isLock2() {
        return false;
    }

    draw(g: CanvasRenderingContext2D, x: number, y: number): void {
        g.fillStyle = "#8b4513";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    moveVertical(dy: number): void {}

    moveHorizontal(dx: number): void {
        this.fallStrategy.isFalling().moveHorizontal(this, dx);
    }
    update(x: number, y: number): void {
        this.fallStrategy.update(this, x, y);
    }
}

class Key implements Tile {
    constructor(private keyConf: KeyConfiguration) {}
    isAir() {
        return false;
    }
    isLock1() {
        return false;
    }

    isLock2() {
        return false;
    }
    draw(g: CanvasRenderingContext2D, x: number, y: number): void {
        g.fillStyle = this.keyConf.getColor();
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    moveVertical(dy: number): void {
        remove(this.keyConf.getRemoveStrategy());
        moveToTile(playerx, playery + dy);
    }

    moveHorizontal(dx: number): void {
        remove(this.keyConf.getRemoveStrategy());
        moveToTile(playerx + dx, playery);
    }
    update(x: number, y: number): void {}
}

class LockTile implements Tile {
    // constructor(private color: string, private lock1: boolean) {}
    constructor(private keyConf: KeyConfiguration) {}
    isAir() {
        return false;
    }

    isLock1() {
        return this.keyConf.isLock1();
    }

    isLock2() {
        return !this.keyConf.isLock1();
    }
    draw(g: CanvasRenderingContext2D, x: number, y: number): void {
        g.fillStyle = this.keyConf.getColor();
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    moveVertical(dy: number): void {}

    moveHorizontal(dx: number): void {}
    update(x: number, y: number): void {}
}

class KeyConfiguration {
    constructor(private color: string, private lock1: boolean, private removeStrategy: RemoveStrategy) {}
    getColor() {
        return this.color;
    }
    getRemoveStrategy() {
        return this.removeStrategy;
    }
    isLock1() {
        return this.lock1;
    }
}

interface RemoveStrategy {
    check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
    check(tile: Tile) {
        return tile.isLock1();
    }
}

class RemoveLock2 implements RemoveStrategy {
    check(tile: Tile) {
        return tile.isLock2();
    }
}

interface Input {
    isRight(): boolean;
    isLeft(): boolean;
    isUp(): boolean;
    isDown(): boolean;
    handle(): void;
}

class Right implements Input {
    isRight() {
        return true;
    }
    isLeft() {
        return false;
    }
    isUp() {
        return false;
    }
    isDown() {
        return false;
    }
    handle = () => {
        map[playery][playerx + 1].moveHorizontal(1);
    };
}

class Left implements Input {
    isRight() {
        return false;
    }
    isLeft() {
        return true;
    }
    isUp() {
        return false;
    }
    isDown() {
        return false;
    }
    handle = () => {
        map[playery][playerx + -1].moveHorizontal(-1);
    };
}

class Up implements Input {
    isRight() {
        return false;
    }
    isLeft() {
        return false;
    }
    isUp() {
        return true;
    }
    isDown() {
        return false;
    }
    handle = () => {
        map[playery + -1][playerx].moveVertical(-1);
    };
}

class Down implements Input {
    isRight() {
        return false;
    }
    isLeft() {
        return false;
    }
    isUp() {
        return false;
    }
    isDown() {
        return true;
    }
    handle = () => {
        map[playery + 1][playerx].moveVertical(1);
    };
}

let playerx = 1;
let playery = 1;

let rawMap: RawTile[][] = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 3, 0, 1, 1, 2, 0, 2],
    [2, 4, 2, 6, 1, 2, 0, 2],
    [2, 8, 4, 1, 1, 2, 0, 2],
    [2, 4, 1, 1, 1, 9, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][];

//핸드북에서 이해한 내용으로 assertExhausted 함수를 설명하자면
//x:never니까 Error형태만 가능하다.
//반환값이 never는 assertExhausted 함수는 절대 함수의 끝에 도달할 수 없다. 즉 }부분을 만나지 못하는 것이다.
function assertExhausted(x: never): never {
    throw new Error("Unexpected object: " + x);
}
const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const BLUE_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());

function transformTile(tile: RawTile) {
    switch (tile) {
        case RawTile.AIR:
            return new Air();
        case RawTile.PLAYER:
            return new Player();
        case RawTile.UNBREAKABLE:
            return new Unbreakable();
        case RawTile.STONE:
            return new Stone(new Resting());
        case RawTile.FALLING_STONE:
            return new Stone(new Falling());
        case RawTile.BOX:
            return new Box(new Resting());
        case RawTile.FALLING_BOX:
            return new Box(new Falling());
        case RawTile.FLUX:
            return new Flux();
        case RawTile.KEY1:
            return new Key(YELLOW_KEY);
        case RawTile.LOCK1:
            return new LockTile(YELLOW_KEY);
        case RawTile.KEY2:
            return new Key(BLUE_KEY);
        case RawTile.LOCK2:
            return new LockTile(BLUE_KEY);
        default:
            assertExhausted(tile);
    }
}

function transformMap() {
    map = new Array(rawMap.length);
    for (let y = 0; y < rawMap.length; y++) {
        map[y] = new Array(rawMap[y].length);
        for (let x = 0; x < rawMap[y].length; x++) {
            map[y][x] = transformTile(rawMap[y][x]);
        }
    }
}

let inputs: Input[] = [];

function remove(shouldRemove: RemoveStrategy) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (shouldRemove.check(map[y][x])) {
                map[y][x] = new Air();
            }
        }
    }
}

function moveToTile(newx: number, newy: number) {
    map[playery][playerx] = new Air();
    map[newy][newx] = new Player();
    playerx = newx;
    playery = newy;
}

function update() {
    //handleInput
    handleInputs();

    //updateMap
    updateMap();
}

const handleInputs = () => {
    while (inputs.length > 0) {
        let input: Input = inputs.pop();
        input.handle();
    }
};

const updateMap = () => {
    for (let y = map.length - 1; y >= 0; y--) {
        for (let x = 0; x < map[y].length; x++) {
            map[y][x].update(x, y);
        }
    }
};
function draw() {
    const g: CanvasRenderingContext2D = createGraphics();
    drawMap(g);
    drawPlayer(g);
}

const createGraphics = (): CanvasRenderingContext2D => {
    const canvas: HTMLCanvasElement = document.getElementById("GameCanvas") as HTMLCanvasElement;
    const g: CanvasRenderingContext2D = canvas.getContext("2d");
    g.clearRect(0, 0, canvas.width, canvas.height);
    return g;
};

const drawMap = (g: CanvasRenderingContext2D): void => {
    // Draw map
    for (let y: number = 0; y < map.length; y++) {
        for (let x: number = 0; x < map[y].length; x++) {
            map[y][x].draw(g, x, y);
        }
    }
};

const drawPlayer = (g: CanvasRenderingContext2D) => {
    g.fillStyle = "#ff0000";
    g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
};

function gameLoop() {
    let before = Date.now();
    update();
    draw();
    let after = Date.now();
    let frameTime = after - before;
    let sleep = SLEEP - frameTime;
    setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
    transformMap();
    gameLoop();
};

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", (e) => {
    if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
    else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
    else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
    else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});

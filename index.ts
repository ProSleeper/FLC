const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

interface RawTileValue {
    transform(): Tile;
}

class AirValue implements RawTileValue {
    transform(): Tile {
        return new Air();
    }
}
class FluxValue implements RawTileValue {
    transform(): Tile {
        return new Flux();
    }
}
class UnbreakableValue implements RawTileValue {
    transform(): Tile {
        return new Unbreakable();
    }
}
class PlayerValue implements RawTileValue {
    transform(): Tile {
        return new PlayerTile();
    }
}
class StoneValue implements RawTileValue {
    transform(): Tile {
        return new Stone(new Resting());
    }
}
class FallingStoneValue implements RawTileValue {
    transform(): Tile {
        return new Stone(new Falling());
    }
}
class BoxValue implements RawTileValue {
    transform(): Tile {
        return new Box(new Resting());
    }
}
class FallingBoxValue implements RawTileValue {
    transform(): Tile {
        return new Box(new Falling());
    }
}
class Key1Value implements RawTileValue {
    transform(): Tile {
        return new Key(YELLOW_KEY);
    }
}
class Lock1Value implements RawTileValue {
    transform(): Tile {
        return new LockTile(YELLOW_KEY);
    }
}
class Key2Value implements RawTileValue {
    transform(): Tile {
        return new Key(BLUE_KEY);
    }
}
class Lock2Value implements RawTileValue {
    transform(): Tile {
        return new LockTile(BLUE_KEY);
    }
}

class RawTile {
    static readonly AIR = new RawTile(new AirValue());
    static readonly FLUX = new RawTile(new FluxValue());
    static readonly UNBREAKABLE = new RawTile(new UnbreakableValue());
    static readonly PLAYER = new RawTile(new PlayerValue());

    static readonly STONE = new RawTile(new StoneValue());
    static readonly FALLING_STONE = new RawTile(new FallingStoneValue());
    static readonly BOX = new RawTile(new BoxValue());
    static readonly FALLING_BOX = new RawTile(new FallingBoxValue());

    static readonly KEY1 = new RawTile(new Key1Value());
    static readonly LOCK1 = new RawTile(new Lock1Value());
    static readonly KEY2 = new RawTile(new Key2Value());
    static readonly LOCK2 = new RawTile(new Lock2Value());

    private constructor(private value: RawTileValue) {}
    transform() {
        return this.value.transform();
    }
}

const RAW_TILES = [
    RawTile.AIR,
    RawTile.FLUX,
    RawTile.UNBREAKABLE,
    RawTile.PLAYER,
    RawTile.STONE,
    RawTile.FALLING_STONE,
    RawTile.BOX,
    RawTile.FALLING_BOX,
    RawTile.KEY1,
    RawTile.LOCK1,
    RawTile.KEY2,
    RawTile.LOCK2,
];

interface FallingState {
    isFalling(): boolean;
    moveHorizontal(map: Map, tile: Tile, dx: number): void;
    drop(map: Map, tile: Tile, x: number, y: number): void;
}

class Falling implements FallingState {
    isFalling(): boolean {
        return true;
    }
    moveHorizontal(map: Map, tile: Tile, dx: number): void {}
    drop(map: Map, tile: Tile, x: number, y: number) {
        map.drop(tile, x, y);
    }
}

class Resting implements FallingState {
    isFalling(): boolean {
        return false;
    }
    moveHorizontal(map: Map, tile: Tile, dx: number): void {
        player.pushHorizontal(map, tile, dx);
    }
    drop(map: Map, tile: Tile, x: number, y: number) {}
}

class FallStrategy {
    constructor(private falling: FallingState) {}
    moveHorizontal(map: Map, tile: Tile, dx: number): void {
        this.falling.moveHorizontal(map, tile, dx);
    }
    update(map: Map, tile: Tile, x: number, y: number): void {
        this.falling = map.getBlockOnTopState(x, y + 1);
        this.falling.drop(map, tile, x, y);
    }
}

interface Tile {
    isAir(): boolean;
    isLock1(): boolean;
    isLock2(): boolean;
    draw(g: CanvasRenderingContext2D, x: number, y: number): void;
    moveHorizontal(map: Map, player: Player, dx: number): void;
    moveVertical(map: Map, player: Player, dy: number): void;
    update(map: Map, x: number, y: number): void;
    getBlockOnTopState(): FallingState;
}
class Air implements Tile {
    getBlockOnTopState(): FallingState {
        return new Falling();
    }
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

    moveHorizontal(map: Map, player: Player, dx: number): void {
        player.move(map, dx, 0);
    }

    moveVertical(map: Map, player: Player, dy: number): void {
        player.move(map, 0, dy);
    }

    update(map: Map, x: number, y: number): void {}
}

class Flux implements Tile {
    getBlockOnTopState(): FallingState {
        return new Resting();
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
        g.fillStyle = "#ccffcc";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    moveHorizontal(map: Map, player: Player, dx: number): void {
        player.move(map, dx, 0);
    }

    moveVertical(map: Map, player: Player, dy: number): void {
        player.move(map, 0, dy);
    }

    update(map: Map, x: number, y: number): void {}
}

class Unbreakable implements Tile {
    getBlockOnTopState(): FallingState {
        return new Resting();
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
        g.fillStyle = "#999999";
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    moveHorizontal(map: Map, player: Player, dx: number): void {}

    moveVertical(map: Map, player: Player, dy: number): void {}

    update(map: Map, x: number, y: number): void {}
}

class PlayerTile implements Tile {
    getBlockOnTopState(): FallingState {
        return new Resting();
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

    draw(g: CanvasRenderingContext2D, x: number, y: number): void {}

    moveHorizontal(map: Map, player: Player, dx: number): void {}

    moveVertical(map: Map, player: Player, dy: number): void {}

    update(map: Map, x: number, y: number): void {}
}

class Stone implements Tile {
    private fallStrategy: FallStrategy;
    constructor(falling: FallingState) {
        this.fallStrategy = new FallStrategy(falling);
    }
    getBlockOnTopState(): FallingState {
        return new Resting();
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

    moveHorizontal(map: Map, player: Player, dx: number): void {
        this.fallStrategy.moveHorizontal(map, this, dx);
    }

    moveVertical(map: Map, player: Player, dy: number): void {}

    update(map: Map, x: number, y: number): void {
        this.fallStrategy.update(map, this, x, y);
    }
}

class Box implements Tile {
    private fallStrategy: FallStrategy;
    constructor(falling: FallingState) {
        this.fallStrategy = new FallStrategy(falling);
    }
    getBlockOnTopState(): FallingState {
        return new Resting();
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

    moveHorizontal(map: Map, player: Player, dx: number): void {
        this.fallStrategy.moveHorizontal(map, this, dx);
    }

    moveVertical(map: Map, player: Player, dy: number): void {}

    update(map: Map, x: number, y: number): void {
        this.fallStrategy.update(map, this, x, y);
    }
}

class Key implements Tile {
    constructor(private keyConf: KeyConfiguration) {}
    getBlockOnTopState(): FallingState {
        return new Resting();
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
        this.keyConf.setColor(g);
        this.keyConf.setRect(g, x, y);
    }

    moveHorizontal(map: Map, player: Player, dx: number): void {
        this.keyConf.removeLock();
        player.move(map, dx, 0);
    }

    moveVertical(map: Map, player: Player, dy: number): void {
        this.keyConf.removeLock();
        player.move(map, 0, dy);
    }

    update(map: Map, x: number, y: number): void {}
}

class LockTile implements Tile {
    constructor(private keyConf: KeyConfiguration) {}
    getBlockOnTopState(): FallingState {
        return new Resting();
    }
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
        this.keyConf.setColor(g);
        this.keyConf.setRect(g, x, y);
    }

    moveHorizontal(map: Map, player: Player, dx: number): void {}

    moveVertical(map: Map, player: Player, dy: number): void {}

    update(map: Map, x: number, y: number): void {}
}

class KeyConfiguration {
    constructor(private color: string, private lock1: boolean, private removeStrategy: RemoveStrategy) {}
    setColor(g: CanvasRenderingContext2D) {
        g.fillStyle = this.color;
    }

    setRect(g: CanvasRenderingContext2D, x: number, y: number) {
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    removeLock() {
        map.remove(this.removeStrategy);
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
        player.moveHorizontal(map, 1);
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
        player.moveHorizontal(map, -1);
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
        player.moveVertical(map, -1);
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
        player.moveVertical(map, 1);
    };
}

class Player {
    constructor(private x: number, private y: number) {}
    drawPlayer = (g: CanvasRenderingContext2D) => {
        g.fillStyle = "#ff0000";
        g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };

    moveHorizontal(map: Map, dx: number) {
        map.moveHorizontal(this, this.x, this.y, dx);
    }

    moveVertical(map: Map, dy: number) {
        map.moveVertical(this, this.x, this.y, dy);
    }

    pushHorizontal(map: Map, tile: Tile, dx: number) {
        map.pushHorizontal(this, tile, this.x, this.y, dx);
    }

    move(map: Map, dx: number, dy: number) {
        this.moveToTile(map, this.x + dx, this.y + dy);
    }

    moveToTile(map: Map, newx: number, newy: number) {
        map.movePlayer(this.x, this.y, newx, newy);
        this.x = newx;
        this.y = newy;
    }
}
const player = new Player(1, 1);

let rawMap: number[][] = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 3, 0, 1, 1, 2, 0, 2],
    [2, 4, 2, 6, 1, 2, 0, 2],
    [2, 8, 4, 1, 1, 2, 0, 2],
    [2, 4, 1, 1, 1, 9, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
];

const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const BLUE_KEY = new KeyConfiguration("#00ccff", false, new RemoveLock2());

class Map {
    private map: Tile[][];
    constructor() {
        this.map = new Array(rawMap.length);
        for (let y = 0; y < rawMap.length; y++) {
            this.map[y] = new Array(rawMap[y].length);
            for (let x = 0; x < rawMap[y].length; x++) {
                this.map[y][x] = RAW_TILES[rawMap[y][x]].transform();
            }
        }
    }

    update = () => {
        for (let y = this.map.length - 1; y >= 0; y--) {
            for (let x = 0; x < this.map[y].length; x++) {
                this.map[y][x].update(this, x, y);
            }
        }
    };

    // private transform() {
    //     for (let y = 0; y < rawMap.length; y++) {
    //         this.map[y] = new Array(rawMap[y].length);
    //         for (let x = 0; x < rawMap[y].length; x++) {
    //             this.map[y][x] = RAW_TILES[rawMap[y][x]].transform();
    //         }
    //     }
    // }

    draw = (g: CanvasRenderingContext2D): void => {
        // Draw map
        for (let y: number = 0; y < this.map.length; y++) {
            for (let x: number = 0; x < this.map[y].length; x++) {
                this.map[y][x].draw(g, x, y);
            }
        }
    };

    drop(tile: Tile, x: number, y: number) {
        this.map[y + 1][x] = tile;
        this.map[y][x] = new Air();
    }

    pushHorizontal(player: Player, tile: Tile, x: number, y: number, dx: number) {
        if (this.map[y][x + dx + dx].isAir() && !this.map[y + 1][x + dx].isAir()) {
            this.map[y][x + dx + dx] = tile;
            player.moveToTile(this, x + dx, y);
        }
    }

    moveHorizontal(player: Player, x: number, y: number, dx: number) {
        this.map[y][x + dx].moveHorizontal(this, player, dx);
    }

    moveVertical(player: Player, x: number, y: number, dy: number) {
        this.map[y + dy][x].moveVertical(this, player, dy);
    }

    movePlayer(x: number, y: number, newx: number, newy: number) {
        this.map[y][x] = new Air();
        this.map[newy][newx] = new PlayerTile();
    }

    remove(shouldRemove: RemoveStrategy) {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (shouldRemove.check(this.map[y][x])) {
                    this.map[y][x] = new Air();
                }
            }
        }
    }

    getBlockOnTopState(x: number, y: number) {
        return this.map[y][x].getBlockOnTopState();
    }
}

const map: Map = new Map();

let inputs: Input[] = [];

function update() {
    //handleInput
    handleInputs();

    //updateMap
    map.update();
}

const handleInputs = () => {
    while (inputs.length > 0) {
        let input: Input = inputs.pop();
        input.handle();
    }
};

function draw() {
    const g: CanvasRenderingContext2D = createGraphics();
    map.draw(g);
    player.drawPlayer(g);
}

const createGraphics = (): CanvasRenderingContext2D => {
    const canvas: HTMLCanvasElement = document.getElementById("GameCanvas") as HTMLCanvasElement;
    const g: CanvasRenderingContext2D = canvas.getContext("2d");
    g.clearRect(0, 0, canvas.width, canvas.height);
    return g;
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

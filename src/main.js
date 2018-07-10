var game = new Phaser.Game(375, 667, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('map', 'assets/sprites/gta_place.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/sprites/catastrophi_tiles_16.png');
    game.load.spritesheet('player', 'assets/sprites/spaceman.png', 16, 16);
    game.load.image('bullet', 'assets/sprites/bullet.png');
    game.load.image('enemie', 'assets/sprites/sprite.png');

}

var map;
var layer;
var cursors;
var player;

var bullets;
var bullet;
var bulletX = 0;
var bulletY = 0;
var bulletTime = 0;

var enemies;

function create() {

    //  Because we're loading CSV map data we have to specify the tile size here or we can't render it
    map = game.add.tilemap('map', 16, 16);

    //  Now add in the tileset
    map.addTilesetImage('tiles');
    
    //  Create our layer
    layer = map.createLayer(0);

    //  Resize the world
    layer.resizeWorld();

    //  This isn't totally accurate, but it'll do for now
    map.setCollisionBetween(9, 200);

    //  Un-comment this on to see the collision tiles
    // layer.debug = true;

    //  Player
    player = game.add.sprite(150, 100, 'player', 1);
    player.animations.add('left', [8,9], 10, true);
    player.animations.add('right', [1,2], 10, true);
    player.animations.add('up', [11,12,13], 10, true);
    player.animations.add('down', [4,5,6], 10, true);

    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.setSize(10, 14, 2, 1);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();

    /////// bullet

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 20; i++)
    {
        var b = bullets.create(0, 0, 'bullet');
        b.name = 'bullet' + i;
        b.exists = false;
        b.visible = false;
        b.checkWorldBounds = true;
        b.events.onOutOfBounds.add(resetBullet, this);
    }
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

    // enemie
    enemies = game.add.group();
    enemies.enableBody = true;

    var enemie1 = enemies.create(250, 200, 'enemie');
    var enemie2 = enemies.create(150, 500, 'enemie');
    //for (var i = 0; i < 10; i++)
    //{
    //    var enemie = enemies.create(game.world.randomX, game.world.randomY, 'enemie');
    //}
}

function update() {

    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(enemies, layer);
    game.physics.arcade.overlap(bullets, layer, bulletsLayerCollisionHandler, null, this);
    game.physics.arcade.overlap(enemies, bullets, enemiesBulletsCollisionHandler, null, this);
    game.physics.arcade.overlap(player, enemies, playerEnemiesCollisionHandler, null, this);

    player.body.velocity.set(0);

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -100;
        player.play('left');
        bulletX = 1;
        bulletY = 0;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 100;
        player.play('right');
        bulletX = -1;
        bulletY = 0;
    }
    else if (cursors.up.isDown)
    {
        player.body.velocity.y = -100;
        player.play('up');
        bulletX = 0;
        bulletY = 1;
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 100;
        player.play('down');
        bulletX = 0;
        bulletY = -1;
    }
    else
    {
        player.animations.stop();
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        fireBullet();
    }

    if(player.body){
      enemies.forEach( enemie => {
        var distance = game.physics.arcade.distanceBetween(enemie, player.body);
        if(distance < 100){
          game.physics.arcade.moveToObject(enemie, player.body, 80);
        }else{
          enemies.set(enemie,'body.velocity.x', 0);
          enemies.set(enemie,'body.velocity.y', 0);
        }
      })
    }
}

function bulletsLayerCollisionHandler (weapon, layer) {
  if(layer.index >= 9){
    weapon.kill();
  }
}

function enemiesBulletsCollisionHandler (enemies, weapon) {
  enemies.kill();
  weapon.kill();
}

function playerEnemiesCollisionHandler (player, enemies) {
  player.kill();
}

function fireBullet () {

  if (game.time.now > bulletTime)
  {
      bullet = bullets.getFirstExists(false);

      if (bullet)
      {
          bullet.reset(player.x + bulletX , player.y + bulletY);
          bullet.body.velocity.y = -300;
          bulletTime = game.time.now + 150;
          game.physics.arcade.moveToXY(bullet, player.x , player.y, 300);
      }
  }

}

function resetBullet (bullet) {

  bullet.kill();

}

function render() {

    // game.debug.body(player);

}
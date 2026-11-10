let spriteFrames = []; // 儲存 walk/0.png 至 walk/9.png 的十張走路影格
let attackSheet; // 儲存 fight/111.png 的攻擊精靈圖
let specialSheet; // 儲存大招/1111.png 的大招精靈圖
let rangedSheet; // 儲存暈/11111.png 的遠攻精靈圖
let currentFrame = 0; // 記錄目前要顯示的動畫影格
let frameBottomRows = []; // 儲存每格角色可見像素的底緣位置
let attackBottomRows = []; // 儲存每格攻擊圖片可見像素的底緣位置
let specialBottomRows = []; // 儲存每格大招圖片可見像素的底緣位置
let rangedBottomRows = []; // 儲存每格遠攻圖片可見像素的底緣位置
let characterX = 0; // 記錄角色在畫布上的水平中心位置
let animationTime = 0; // 記錄角色開始移動後的動畫時間
let facingRight = false; // 記錄角色目前面向右邊或左邊
let attackFacingRight = false; // 記錄本次攻擊開始時角色的面向
let isAttacking = false; // 記錄角色目前是否正在攻擊
let attackStartedAt = 0; // 記錄本次攻擊動畫開始的時間
let attackFrame = 0; // 記錄目前播放的攻擊影格
let isUsingSpecial = false; // 記錄角色目前是否正在施放大招
let specialStartedAt = 0; // 記錄本次大招動畫開始的時間
let specialFrame = 0; // 記錄目前播放的大招影格
let specialFacingRight = false; // 記錄本次大招開始時角色的面向
let isUsingRanged = false; // 記錄角色目前是否正在施放遠攻
let rangedStartedAt = 0; // 記錄本次遠攻動畫開始的時間
let rangedFrame = 0; // 記錄目前播放的遠攻影格
let rangedFacingRight = false; // 記錄本次遠攻開始時角色的面向
const frameCount = 10; // 設定精靈圖內的影格總數
const attackFrameCount = 7; // 設定攻擊精靈圖內的影格總數
const attackFrameWidth = 87; // 設定攻擊精靈圖每格的寬度
const specialFrameCount = 8; // 設定大招精靈圖內的影格總數
const specialFrameWidth = 133; // 設定大招精靈圖每格的寬度
const rangedFrameCount = 4; // 設定遠攻精靈圖內的影格總數
const rangedFrameWidth = 118; // 設定遠攻精靈圖每格的寬度
const frameInterval = 100; // 設定每 100 毫秒切換影格一次
const spriteScale = 5; // 將原始像素角色放大五倍以便觀看
const movementSpeed = 300; // 設定角色每秒移動的像素距離
const grassColor = "#70ad43"; // 設定草地色的畫布背景
function preload() { // 在畫布開始繪製前載入角色精靈圖
  spriteFrames = Array.from({ length: frameCount }, (_, frameIndex) => loadImage(`walk/${frameIndex}.png`)); // 載入 walk/0.png 至 walk/9.png 的十張影格
  attackSheet = loadImage("fight/111.png"); // 載入七格攻擊動作精靈圖
  specialSheet = loadImage("大招/1111.png"); // 載入八格大招動作精靈圖
  rangedSheet = loadImage("暈/11111.png"); // 載入四格遠攻動作精靈圖
} // 結束載入函式
function setup() { // 初始化全螢幕動畫畫布
  createCanvas(windowWidth, windowHeight); // 讓畫布尺寸符合整個瀏覽器視窗
  pixelDensity(1); // 固定像素密度以保持精靈圖清晰
  noSmooth(); // 關閉平滑縮放以保留像素風格
  imageMode(CORNER); // 使用圖片左上角作為繪製定位點
  characterX = width * 2 / 3; // 將角色初始位置放在畫布寬度的三分之二處
  spriteFrames.forEach((frame, frameIndex) => { // 逐一檢查每張走路影格
    frame.loadPixels(); // 讀取目前影格像素以計算角色底緣
    for (let row = frame.height - 1; row >= 0; row--) { // 從影格最底列往上尋找角色
      let rowHasSprite = false; // 記錄目前影格列是否含有不透明角色像素
      for (let column = 0; column < frame.width; column++) { // 掃描目前影格的所有像素欄
        const alphaIndex = (row * frame.width + column) * 4 + 3; // 計算目前像素的透明度索引
        if (frame.pixels[alphaIndex] > 0) { // 找到不透明像素時記錄此列
          rowHasSprite = true; // 標記目前列含有可見角色像素
          break; // 結束目前列的像素掃描
        } // 結束不透明像素判斷
      } // 結束目前列的像素欄掃描
      if (rowHasSprite) { // 找到目前影格最底部的角色像素列
        frameBottomRows[frameIndex] = row + 1; // 儲存可見像素底緣的位置
        break; // 結束目前影格的列掃描
      } // 結束影格底緣判斷
    } // 結束目前影格的列掃描
  }); // 結束十張影格的底緣計算
  attackSheet.loadPixels(); // 讀取攻擊精靈圖像素以計算每格的角色底緣
  for (let frameIndex = 0; frameIndex < attackFrameCount; frameIndex++) { // 逐一檢查七張攻擊影格
    const sourceStartX = frameIndex * attackFrameWidth; // 計算目前攻擊影格在圖集中的起始位置
    const sourceEndX = Math.min(sourceStartX + attackFrameWidth, attackSheet.width); // 計算目前影格在圖集內可讀取的結束位置
    for (let row = attackSheet.height - 1; row >= 0; row--) { // 從影格最底列往上尋找角色
      let rowHasSprite = false; // 記錄目前影格列是否含有不透明角色像素
      for (let column = sourceStartX; column < sourceEndX; column++) { // 掃描目前影格的像素欄
        const alphaIndex = (row * attackSheet.width + column) * 4 + 3; // 計算目前像素的透明度索引
        if (attackSheet.pixels[alphaIndex] > 0) { // 找到不透明像素時記錄此列
          rowHasSprite = true; // 標記目前列含有可見角色像素
          break; // 結束目前列的像素掃描
        } // 結束不透明像素判斷
      } // 結束目前列的像素欄掃描
      if (rowHasSprite) { // 找到目前影格最底部的角色像素列
        attackBottomRows[frameIndex] = row + 1; // 儲存攻擊影格可見像素的底緣
        break; // 結束目前影格的列掃描
      } // 結束攻擊影格底緣判斷
    } // 結束目前攻擊影格的列掃描
  } // 結束七張攻擊影格的底緣計算
  specialSheet.loadPixels(); // 讀取大招精靈圖像素以計算每格的角色底緣
  for (let frameIndex = 0; frameIndex < specialFrameCount; frameIndex++) { // 逐一檢查八張大招影格
    const sourceStartX = frameIndex * specialFrameWidth; // 計算目前大招影格在圖集中的起始位置
    const sourceEndX = Math.min(sourceStartX + specialFrameWidth, specialSheet.width); // 計算目前影格在圖集內可讀取的結束位置
    for (let row = specialSheet.height - 1; row >= 0; row--) { // 從影格最底列往上尋找角色
      let rowHasSprite = false; // 記錄目前影格列是否含有不透明角色像素
      for (let column = sourceStartX; column < sourceEndX; column++) { // 掃描目前影格的像素欄
        const alphaIndex = (row * specialSheet.width + column) * 4 + 3; // 計算目前像素的透明度索引
        if (specialSheet.pixels[alphaIndex] > 0) { // 找到不透明像素時記錄此列
          rowHasSprite = true; // 標記目前列含有可見角色像素
          break; // 結束目前列的像素掃描
        } // 結束不透明像素判斷
      } // 結束目前列的像素欄掃描
      if (rowHasSprite) { // 找到目前影格最底部的角色像素列
        specialBottomRows[frameIndex] = row + 1; // 儲存大招影格可見像素的底緣
        break; // 結束目前影格的列掃描
      } // 結束大招影格底緣判斷
    } // 結束目前大招影格的列掃描
  } // 結束八張大招影格的底緣計算
  rangedSheet.loadPixels(); // 讀取遠攻精靈圖像素以計算每格的角色底緣
  for (let frameIndex = 0; frameIndex < rangedFrameCount; frameIndex++) { // 逐一檢查四張遠攻影格
    const sourceStartX = frameIndex * rangedFrameWidth; // 計算目前遠攻影格在圖集中的起始位置
    const sourceEndX = Math.min(sourceStartX + rangedFrameWidth, rangedSheet.width); // 計算目前影格在圖集內可讀取的結束位置
    for (let row = rangedSheet.height - 1; row >= 0; row--) { // 從影格最底列往上尋找角色
      let rowHasSprite = false; // 記錄目前影格列是否含有不透明角色像素
      for (let column = sourceStartX; column < sourceEndX; column++) { // 掃描目前影格的像素欄
        const alphaIndex = (row * rangedSheet.width + column) * 4 + 3; // 計算目前像素的透明度索引
        if (rangedSheet.pixels[alphaIndex] > 0) { // 找到不透明像素時記錄此列
          rowHasSprite = true; // 標記目前列含有可見角色像素
          break; // 結束目前列的像素掃描
        } // 結束不透明像素判斷
      } // 結束目前列的像素欄掃描
      if (rowHasSprite) { // 找到目前影格最底部的角色像素列
        rangedBottomRows[frameIndex] = row + 1; // 儲存遠攻影格可見像素的底緣
        break; // 結束目前影格的列掃描
      } // 結束遠攻影格底緣判斷
    } // 結束目前遠攻影格的列掃描
  } // 結束四張遠攻影格的底緣計算
} // 結束初始化函式
function draw() { // 每一畫格重繪草地並更新角色動畫
  background(grassColor); // 將整個畫布填滿草地綠色
  const movingLeft = keyIsDown(65); // 偵測是否按住 A 鍵向左移動
  const movingRight = keyIsDown(68); // 偵測是否按住 D 鍵向右移動
  const moveDirection = Number(movingRight) - Number(movingLeft); // 計算向左、向右或停止的移動方向
  if (moveDirection !== 0) { // 角色移動時更新目前面向
    facingRight = moveDirection > 0; // 依移動方向記錄角色面向
  } // 結束目前面向更新
  if (isUsingRanged) { // 遠攻狀態優先播放遠攻動作
    rangedFrame = floor((millis() - rangedStartedAt) / frameInterval); // 依播放時間計算目前遠攻影格
    if (rangedFrame < rangedFrameCount) { // 遠攻動畫尚未播放完畢時繪製目前影格
      const sourceX = rangedFrame * rangedFrameWidth; // 計算目前遠攻影格的圖集起始位置
      const sourceWidth = Math.min(rangedFrameWidth, rangedSheet.width - sourceX); // 取得目前影格實際可用的圖集寬度
      const rangedDisplayWidth = rangedFrameWidth * spriteScale; // 計算遠攻影格放大後的固定顯示寬度
      const rangedDisplayHeight = rangedSheet.height * spriteScale; // 計算遠攻影格放大後的顯示高度
      const rangedDisplayX = characterX - rangedDisplayWidth / 2; // 將遠攻影格中心對齊角色位置
      const rangedDisplayY = height - rangedBottomRows[rangedFrame] * spriteScale; // 將遠攻角色可見像素底緣對齊畫布底部
      drawFacingImage(rangedSheet, rangedDisplayX, rangedDisplayY, rangedDisplayWidth, rangedDisplayHeight, rangedFacingRight, sourceX, sourceWidth, rangedSheet.height); // 依遠攻開始時的朝向繪製目前影格
      return; // 遠攻播放期間暫停一般走路繪製
    } // 結束遠攻動畫播放判斷
    isUsingRanged = false; // 遠攻動畫結束後回到一般狀態
    animationTime = 0; // 重設走路動畫時間
    currentFrame = 0; // 將待機影格設回 walk/0.png
  } // 結束遠攻狀態判斷
  if (isUsingSpecial) { // 大招狀態優先播放大招動作
    specialFrame = floor((millis() - specialStartedAt) / frameInterval); // 依播放時間計算目前大招影格
    if (specialFrame < specialFrameCount) { // 大招動畫尚未播放完畢時繪製目前影格
      const sourceX = specialFrame * specialFrameWidth; // 計算目前大招影格的圖集起始位置
      const sourceWidth = Math.min(specialFrameWidth, specialSheet.width - sourceX); // 取得目前影格實際可用的圖集寬度
      const specialDisplayWidth = specialFrameWidth * spriteScale; // 計算大招影格放大後的固定顯示寬度
      const specialDisplayHeight = specialSheet.height * spriteScale; // 計算大招影格放大後的顯示高度
      const specialDisplayX = characterX - specialDisplayWidth / 2; // 將大招影格中心對齊角色位置
      const specialDisplayY = height - specialBottomRows[specialFrame] * spriteScale; // 將大招角色可見像素底緣對齊畫布底部
      drawFacingImage(specialSheet, specialDisplayX, specialDisplayY, specialDisplayWidth, specialDisplayHeight, specialFacingRight, sourceX, sourceWidth, specialSheet.height); // 依大招開始時的朝向繪製目前影格
      return; // 大招播放期間暫停一般走路繪製
    } // 結束大招動畫播放判斷
    isUsingSpecial = false; // 大招動畫結束後回到一般狀態
    animationTime = 0; // 重設走路動畫時間
    currentFrame = 0; // 將待機影格設回 walk/0.png
  } // 結束大招狀態判斷
  if (isAttacking) { // 攻擊狀態優先播放攻擊動作
    attackFrame = floor((millis() - attackStartedAt) / frameInterval); // 依播放時間計算目前攻擊影格
    if (attackFrame < attackFrameCount) { // 攻擊動畫尚未播放完畢時繪製目前影格
      const sourceX = attackFrame * attackFrameWidth; // 計算目前攻擊影格的圖集起始位置
      const sourceWidth = Math.min(attackFrameWidth, attackSheet.width - sourceX); // 取得目前影格實際可用的圖集寬度
      const attackDisplayWidth = attackFrameWidth * spriteScale; // 計算攻擊影格放大後的固定顯示寬度
      const attackDisplayHeight = attackSheet.height * spriteScale; // 計算攻擊影格放大後的顯示高度
      const attackDisplayX = characterX - attackDisplayWidth / 2; // 將攻擊影格中心對齊角色位置
      const attackDisplayY = height - attackBottomRows[attackFrame] * spriteScale; // 將攻擊角色可見像素底緣對齊畫布底部
      drawFacingImage(attackSheet, attackDisplayX, attackDisplayY, attackDisplayWidth, attackDisplayHeight, attackFacingRight, sourceX, sourceWidth, attackSheet.height); // 依攻擊開始時的朝向繪製目前攻擊影格
      return; // 攻擊播放期間暫停一般走路繪製
    } // 結束攻擊動畫播放判斷
    isAttacking = false; // 攻擊動畫結束後回到一般狀態
    animationTime = 0; // 重設走路動畫時間
    currentFrame = 0; // 將待機影格設回 walk/0.png
  } // 結束攻擊狀態判斷
  if (moveDirection === 0) { // 沒有按住 A 或 D 時切回待機狀態
    currentFrame = 0; // 固定顯示 walk/0.png 待機影格
    animationTime = 0; // 重設走路動畫時間以便下次從第一格開始
  } else { // 按住 A 或 D 時開始移動角色
    const elapsedTime = min(deltaTime, 50); // 限制單次時間差以避免切回分頁時角色瞬移
    characterX += moveDirection * movementSpeed * elapsedTime / 1000; // 依方向與經過時間更新角色位置
    animationTime += elapsedTime; // 累積角色移動期間的動畫時間
    currentFrame = floor(animationTime / frameInterval) % (frameCount - 1) + 1; // 移動時循環播放 walk/1.png 至 walk/9.png
  } // 結束移動狀態判斷
  const frame = spriteFrames[currentFrame]; // 取得目前要繪製的角色影格
  const displayWidth = frame.width * spriteScale; // 按目前影格寬度計算放大後的顯示寬度
  const displayHeight = frame.height * spriteScale; // 按目前影格高度計算放大後的顯示高度
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); // 限制角色不會移出畫布左右邊界
  const displayX = characterX - displayWidth / 2; // 以角色水平中心計算圖片左側位置
  const displayY = height - frameBottomRows[currentFrame] * spriteScale; // 將角色可見像素底端對齊畫布底端
  drawFacingImage(frame, displayX, displayY, displayWidth, displayHeight, facingRight); // 依角色目前面向繪製走路或待機影格
} // 結束每畫格繪製函式
function drawFacingImage(source, x, y, imageWidth, imageHeight, faceRight, sourceX, sourceWidth, sourceHeight) { // 依指定朝向繪製角色圖片或圖集影格
  push(); // 儲存目前畫布座標狀態
  if (faceRight) { // 角色面向右邊時水平翻轉圖片
    translate(characterX * 2, 0); // 將鏡射軸移至角色中心的相對位置
    scale(-1, 1); // 沿水平軸翻轉角色圖片
  } // 結束水平翻轉判斷
  if (sourceWidth === undefined) { // 沒有指定來源寬度時繪製整張圖片
    image(source, x, y, imageWidth, imageHeight); // 繪製完整的角色影格
  } else { // 指定來源寬度時從精靈圖裁切影格
    image(source, x, y, imageWidth, imageHeight, sourceX, 0, sourceWidth, sourceHeight); // 裁切並繪製指定攻擊影格
  } // 結束圖片繪製方式判斷
  pop(); // 還原畫布座標狀態
} // 結束角色朝向繪製函式
function keyPressed() { // 按下方向鍵或攻擊鍵時更新角色狀態
  if (key === "a" || key === "A") { // 按下 A 鍵時面向左邊
    facingRight = false; // 記錄角色目前面向左邊
  } // 結束 A 鍵判斷
  if (key === "d" || key === "D") { // 按下 D 鍵時面向右邊
    facingRight = true; // 記錄角色目前面向右邊
  } // 結束 D 鍵判斷
  if ((key === "f" || key === "F") && !isAttacking && !isUsingSpecial && !isUsingRanged) { // 按下 F 鍵且目前沒有動作時開始攻擊
    isAttacking = true; // 啟動攻擊狀態
    attackFrame = 0; // 從第一張攻擊影格開始播放
    attackStartedAt = millis(); // 記錄攻擊動畫開始時間
    attackFacingRight = facingRight; // 鎖定攻擊開始時角色的面朝方向
  } // 結束 F 鍵攻擊判斷
  if ((key === "r" || key === "R") && !isAttacking && !isUsingSpecial && !isUsingRanged) { // 按下 R 鍵且目前沒有動作時開始大招
    isUsingSpecial = true; // 啟動大招狀態
    specialFrame = 0; // 從第一張大招影格開始播放
    specialStartedAt = millis(); // 記錄大招動畫開始時間
    specialFacingRight = facingRight; // 鎖定大招開始時角色的面朝方向
  } // 結束 R 鍵大招判斷
  if ((key === "c" || key === "C") && !isAttacking && !isUsingSpecial && !isUsingRanged) { // 按下 C 鍵且目前沒有動作時開始遠攻
    isUsingRanged = true; // 啟動遠攻狀態
    rangedFrame = 0; // 從第一張遠攻影格開始播放
    rangedStartedAt = millis(); // 記錄遠攻動畫開始時間
    rangedFacingRight = facingRight; // 鎖定遠攻開始時角色的面朝方向
  } // 結束 C 鍵遠攻判斷
} // 結束按鍵事件函式
function windowResized() { // 視窗尺寸變動時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿瀏覽器視窗
} // 結束視窗尺寸調整函式

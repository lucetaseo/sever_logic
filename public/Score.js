class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageId = 1000; // 기본 스테이지 ID
  stageChange = true; // 스테이지 변경 가능 여부 초기화
  stageData = [];
  items = [];

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.loadStageData()
      .then(() => this.loadItemData())
      .catch(error => console.error('Failed to initialize Score:', error));
  }

  async loadStageData() {
    try {
      const response = await fetch('./assets/Stage.json', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      this.stageData = await response.json();
    } catch (error) {
      console.error('Failed to load stage data:', error);
    }
  }

  getCurrentStageData() {
    const stage = this.stageData.data.find(stage => stage.id === this.stageId);
    return stage || { score: 0, scoreMultiplier: 1 };
  }

  async loadItemData() {
    try {
      const response = await fetch('./assets/Item.json');
      this.itemData = await response.json();
    } catch (error) {
      console.error('Failed to load item data:', error);
    }
  }

  getItem(itemId) {
    // 아이템을 획득하면 특정 동작을 수행
    console.log(`아이템 ${itemId}를 획득했습니다.`);
    // 여기에 획득한 아이템에 대한 추가 동작을 추가할 수 있습니다.
  }
  
  createItems() {
    const currentStageItems = this.getCurrentStageItems();
    // 여기서 생성된 아이템을 활용하여 필요한 로직 수행
    console.log('현재 스테이지 아이템:', currentStageItems);
  }

  update(deltaTime) {
    const currentStage = this.getCurrentStageData();
    this.score += deltaTime * 0.001;
    // 점수가 100점 이상이 될 시 서버에 메세지 전송
    if (Math.floor(this.score) === 100 && this.stageChange) {
      this.stageChange = false;
      const nextStageId = this.stageId + 1;
      sendEvent(11, { currentStage: this.stageId, targetStage: nextStageId });
    }
  }

  reset() {
    this.score = 0;
    this.stageChange = true;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;

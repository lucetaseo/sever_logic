import { sendEvent } from './Socket.js';
import stageFile from './assets/Stage.json' with { type: 'json' };
import itemFile from './assets/Item.json' with { type: 'json' };
import itemUnlockFile from './assets/Item_unlock.json' with { type: 'json' };

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageId = 1000; // 기본 스테이지 ID
  stageChange = true; // 스테이지 변경 가능 여부 초기화
  stageData = stageFile.data;
  itemData = itemFile.data;
  itemUnlockData = itemUnlockFile.data;
  currentItems = []; // 현재 스테이지의 아이템 목록

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.createItemsForCurrentStage(); // 초기 스테이지의 아이템 생성
  }

  // 현재 스테이지 ID에 해당하는 데이터를 반환
  getCurrentStageData() {
    return this.stageData.find(stage => stage.id === this.stageId) || { scorePerSecond: 1 };
  }

  // 현재 스테이지에 해당하는 아이템 데이터를 반환
  getCurrentStageItems() {
    const stageItems = this.itemUnlockData
      .filter(item => item.stage_id === this.stageId) // 현재 스테이지의 아이템 데이터 필터링
      .map(item => this.itemData.find(i => i.id === item.item_id)) // 아이템 ID를 기반으로 실제 아이템 데이터 매핑
      .filter(item => item); // 필터링 후에도 유효한 아이템만 반환

    return stageItems;
  }

  // 아이템 획득 시 점수 변화를 처리하는 메서드
  getItem(itemId) {
    const item = this.currentItems.find(item => item.id === itemId);
    if (item) {
      this.score += item.score;
      console.log(`Item ${itemId} obtained, score increased by ${item.score}`);
    }
  }

  // 현재 스테이지의 아이템 목록을 업데이트하는 메서드
  createItemsForCurrentStage() {
    this.currentItems = this.getCurrentStageItems();
    console.log(`Items for stage ${this.stageId}:`, this.currentItems);
    // 여기서 필요한 로직을 추가하여 아이템을 화면에 그리거나 초기화할 수 있습니다.
  }

  // 점수 업데이트 및 스테이지 변경 로직
  update(deltaTime) {
    const currentStage = this.getCurrentStageData();
    this.score += deltaTime * 0.001 * currentStage.scorePerSecond;
    // 점수가 10 이상이 되면 다음 스테이지로 이동
    if (Math.floor(this.score) >= 10 && this.stageChange) {
      this.stageChange = false; // 스테이지 변경 가능 여부를 false로 설정

      // 다음 스테이지 찾기
      const nextStage = this.stageData.find(stage => stage.id === this.stageId + 1);
      if (nextStage) {
        sendEvent(11, { currentStage: this.stageId, targetStage: nextStage.id });
        console.log(`Moved to stage ${nextStage.id}`);
        this.stageId = nextStage.id; // 다음 스테이지로 변경
        this.createItemsForCurrentStage(); // 새 스테이지에 해당하는 아이템 생성
      } else {
        console.log(`No next stage found for id ${this.stageId + 1}`);
      }

      // 일정 시간 후에 스테이지 변경 가능 여부를 true로 설정
      setTimeout(() => {
        this.stageChange = true;
      }, 1000); // 1초 후에 다시 스테이지 변경 가능
    }
  }

  // 게임 리셋
  reset() {
    this.score = 0;
    this.stageChange = true;
    this.stageId = 1000; // 초기 스테이지 ID로 리셋
    this.createItemsForCurrentStage(); // 초기화 시 초기 스테이지 아이템 생성
  }

  // 최고 점수 설정
  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  // 현재 점수 반환
  getScore() {
    return this.score;
  }

  // 화면에 점수와 최고 점수를 그리는 메서드
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

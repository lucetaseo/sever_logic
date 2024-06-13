import { sendEvent } from './Socket.js';
import stageFile from './assets/Stage.json' with { type: 'json' };

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageId = 1000; // 기본 스테이지 ID
  stageChange = true; // 스테이지 변경 가능 여부 초기화
  stageData = stageFile.data;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  // 현재 스테이지 ID에 해당하는 데이터를 반환
  getCurrentStageData() {
    return this.stageData.find(stage => stage.id === this.stageId) || { scorePerSecond: 1 };
  }

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
      } else {
        console.log(`No next stage found for id ${this.stageId + 1}`);
      }

      // 일정 시간 후에 스테이지 변경 가능 여부를 true로 설정
      setTimeout(() => {
        this.stageChange = true;
      }, 1000); // 1초 후에 다시 스테이지 변경 가능
    }
  }

  reset() {
    this.score = 0;
    this.stageChange = true;
    this.stageId = 1000; // 초기 스테이지 ID로 리셋
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

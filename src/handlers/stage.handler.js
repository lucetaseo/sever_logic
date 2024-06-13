import { getStage, setStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

export const moveStageHandler = (userId, payload) => {
  // 유저의 현재 스테이지 배열을 가져오고, 최대 스테이지 ID를 찾는다.
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 오름차순 정렬 후 가장 큰 스테이지 ID 확인 = 가장 상위의 스테이지 = 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 클라이언트 서버 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: 'Current stage mismatch' };
  }

  // 점수 검증
  const serverTime = Date.now();
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000; // 초 단위로 계산

  // 클라이언트에서 받은 점수와 서버에서 계산한 점수를 비교
  const { score: clientScore, targetStage } = payload;
  const serverCalculatedScore = Math.floor(elapsedTime * currentStage.scorePerSecond);

  if (clientScore !== serverCalculatedScore) {
    return { status: 'fail', message: 'Score mismatch' };
  }

  // 1초당 1점, 10점 이상이면 다음 스테이지로 이동, 오차범위 0.5초
  // 클라이언트와 서버 간의 통신 지연시간을 고려해서 오차범위 설정
  if (elapsedTime < 10 || elapsedTime > 10.5) {
    return { status: 'fail', message: 'Invalid elapsed time' };
  }

  // 게임 에셋에서 다음 스테이지의 존재 여부 확인
  const { stages } = getGameAssets();
  if (!stages.some((stage) => stage.id === targetStage)) {
    return { status: 'fail', message: 'Target stage not found' };
  }

  // 유저의 다음 스테이지 정보 업데이트 + 현재 시간
  setStage(userId, targetStage, serverTime);
  console.log('Stage:', getStage(userId));
  return { status: 'success' };
};

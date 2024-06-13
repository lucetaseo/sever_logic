import path from 'path';
import { fileURLToPath } from 'url';
import { getStage, setStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

// __filename 및 __dirname을 ESM에서 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 상대 경로를 사용하여 JSON 파일 가져오기
import itemUnlockData from '../../assets/Item_unlock.json' assert { type: 'json' };
import itemData from '../../assets/Item.json' assert { type: 'json' };

export const gameStart = (uuid, payload) => {
  // 서버 메모리에 있는 게임 에셋에서 stage 정보를 가지고 온다.
  const { stages } = getGameAssets();
  // stages 배열에서 0번째 = 첫번째 스테이지의 ID를 해당 유저의 stage에 저장한다.
  setStage(uuid, stages.data[0].id, payload.timestamp);
  // 로그를 찍어 확인.
  console.log('Stage:', getStage(uuid));

  return { status: 'success' };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트에서 받은 게임 종료 시 타임스탬프와 총 점수
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0;
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      // 마지막 스테이지의 경우 종료 시간이 게임의 종료 시간
      stageEndTime = gameEndTime;
    } else {
      // 다음 스테이지의 시작 시간을 현재 스테이지의 종료 시간으로 사용
      stageEndTime = stages[index + 1].timestamp;
    }

    const stageData = getGameAssets().stages.data.find(s => s.id === stage.stageId);
    const stageDuration = (stageEndTime - stage.timestamp) / 1000; // 스테이지 지속 시간 (초 단위)
    totalScore += stageDuration * stageData.scoreMultiplier; // 스테이지별 점수 배수 반영
  });

  // 점수와 타임스탬프 검증 (예: 클라이언트가 보낸 총점과 계산된 총점 비교)
  // 오차범위 5
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'Score verification failed' };
  }

  // 모든 검증이 통과된 후, 클라이언트에서 제공한 점수 저장하는 로직
  // saveGameResult(userId, clientScore, gameEndTime);
  // 검증이 통과되면 게임 종료 처리
  return { status: 'success', message: 'Game ended successfully', score };
};

export const handleStageChange = (uuid, payload) => {
  const { currentStage, targetStage } = payload;
  const stages = getGameAssets().stages.data;

  // 현재 스테이지가 유효한지 확인
  const currentStageData = stages.find(stage => stage.id === currentStage);
  if (!currentStageData) {
    return { status: 'fail', message: 'Invalid current stage' };
  }

  // 타겟 스테이지가 유효한지 확인
  const newStage = stages.find(stage => stage.id === targetStage);
  if (!newStage) {
    return { status: 'fail', message: 'Invalid target stage' };
  }

  // 타겟 스테이지로 변경
  setStage(uuid, targetStage, Date.now());

  // 다음 스테이지에 해당하는 아이템 로드
  const stageItems = itemUnlockData
    .filter(item => item.stage_id === targetStage)
    .map(item => itemData.find(i => i.id === item.item_id))
    .filter(item => item);

  console.log('Items for stage:', targetStage, stageItems);
  console.log('Stage:', getStage(uuid));

  return { status: 'success', message: 'Stage changed successfully' };
};

// 아이템 획득 이벤트 핸들러 추가
export const itemAcquisitionHandler = (uuid, payload) => {
  const { itemId } = payload;

  // 유저의 현재 스테이지 배열을 가져오고, 최대 스테이지 ID를 찾는다.
  let currentStages = getStage(uuid);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  const currentStage = currentStages[currentStages.length - 1];

  // 아이템 데이터에서 해당 아이템 찾기
  const item = itemData.find(i => i.id === itemId);
  if (!item) {
    return { status: 'fail', message: 'Item not found' };
  }

  // 아이템 획득 처리 로직
  // 점수 추가 등의 로직을 구현합니다.
  // 예: 사용자 점수 업데이트

  console.log(`User ${uuid} obtained item ${itemId}, score increased by ${item.score}`);

  return { status: 'success' };
};

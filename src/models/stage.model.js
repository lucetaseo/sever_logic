// // key
// const stages = {};

// // 스테이지 초기화
// export const createStage = (uuid) => {
//   stages[uuid] = []; // 초기 스테이지 배열 생성
// };

// export const getStage = (uuid) => {
//   return stages[uuid];
// };

// export const setStage = (uuid, id, timestamp) => {
//   return stages[uuid].push({ id, timestamp });
// };

// export const clearAllStages = () => {
//   return(stages[uuid]) = {};
// };

// key
const stages = {};

// 스테이지 초기화
export const createStage = (uuid) => {
  stages[uuid] = []; // 초기 스테이지 배열 생성
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (uuid, id, timestamp) => {
  // uuid에 대한 초기화가 되어있는지 확인
  if (!stages[uuid]) {
    createStage(uuid); // 초기화되지 않았다면 초기화
  }
  return stages[uuid].push({ id, timestamp });
};

export const clearAllStages = () => {
  for (const uuid in stages) {
    if (stages.hasOwnProperty(uuid)) {
      stages[uuid] = []; // 각 uuid에 대한 스테이지 배열 초기화
    }
  }
};

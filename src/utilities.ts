import {
  newHorizon,
  RATCap,
  canopyLime,
  olympicTeal,
  boldBlue,
} from './colorPalette'

type TMapFields = {
  [key: number]: string
}

export const mapDifficulty: TMapFields = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Neutral',
  4: 'Hard',
  5: 'Very Hard'
}

export const mapOverall: TMapFields = {
  1: 'Strongly Disliked',
  2: 'Disliked',
  3: 'Neutral',
  4: 'Liked',
  5: 'Strongly Liked',
}

export const mapStaffSupport: TMapFields = {
  1: 'Little/No Support',
  2: 'Some Support',
  3: 'Neutral',
  4: 'Supportive',
  5: 'Strong Support',
}

export const mapColorScheme: TMapFields = {
  1: newHorizon,
  2: RATCap,
  3: canopyLime,
  4: olympicTeal,
  5: boldBlue,
}

type TObject = {
  [key: string | number]: any
}

export const mapToArray = (map: TObject) => {
  const outputArray = []
  for (const key in map) {
    outputArray.push(map[key])
  }
  return outputArray
}

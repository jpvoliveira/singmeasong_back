import {jest} from '@jest/globals'
import { recommendationRepository } from '../../src/repositories/recommendationRepository'
import { recommendationService } from '../../src/services/recommendationsService'
import { conflictError } from '../../src/utils/errorUtils'

describe("Recommendation unit tests",()=>{
  beforeEach(()=>{
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it("Should throw a conflict error given a duplicate music name", async()=>{
    const music = {
      name: "House of the Rising Sun",
      youtubeLink: "https://www.youtube.com/watch?v=4-43lLKaqBQ&list=RD4-43lLKaqBQ&start_radio=1&ab_channel=TheAnimalsTributeChannel"
    }

    jest.spyOn(recommendationRepository, "findByName").mockResolvedValue({
      id: 1,
      score: 0,
      ...music
    })

    expect(recommendationService.insert(music)).rejects.toEqual(conflictError("Recommendations names must be unique"))
  })

  it("Should return recommendations give recommendations.length > 0", async()=>{
    const recommendations = 
      {
      id: 1,
      name: "House of the Rising Sun",
      youtubeLink: "https://www.youtube.com/watch?v=4-43lLKaqBQ&list=RD4-43lLKaqBQ&start_radio=1&ab_channel=TheAnimalsTributeChannel",
      score: 100
      }
    
    jest.spyOn(global.Math, "random").mockReturnValueOnce(1)

    expect(recommendationService.getScoreFilter(1)).toEqual('lte')
  })
})
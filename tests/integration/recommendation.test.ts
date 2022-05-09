import { prisma } from '../../src/database.js'
import supertest from 'supertest'
import app from '../../src/app.js'
import musicFactory from '../factories/musicFactory.js'
import scoreFactory from '../factories/scoreFactory.js'

describe('POST /recommendations', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should return 201', async () => {
    const music = musicFactory()

    const createdMusic = await supertest(app).post('/recommendations').send(music)
    const result = await prisma.recommendation.findUnique({ where: { name: music.name } })

    expect(result).not.toBeNull()
    expect(createdMusic.status).toEqual(201)
  })

  it('should return 422', async () => {
    const music = {
      name: 123,
      youtubeLink: musicFactory().youtubeLink
    }

    const response = await supertest(app).post('/recommendations').send(music)

    expect(response.status).toEqual(422)
  })

  it('should return 422', async () => {
    const music = {
      name: musicFactory().name,
      youtubeLink: "bananinha"
    }

    const response = await supertest(app).post('/recommendations').send(music)

    expect(response.status).toEqual(422)
  })
})

describe('POST /recommendations/:id/upvote', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should return upvote and 200', async () => {
    const music = musicFactory()

    await prisma.recommendation.create({ data: { ...music } })

    const result = await prisma.recommendation.findUnique({ where: { name: music.name } })
    const addScore = await supertest(app).post(`/recommendations/${result.id}/upvote`).send()
    const resultAddScore = await prisma.recommendation.findUnique({ where: { name: music.name } })

    expect(resultAddScore.score).toEqual(1)
    expect(addScore.status).toEqual(200)
  })
})

describe('POST /recommendations/:id/downvote', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should return downvote and 200', async () => {
    const music = musicFactory()

    await prisma.recommendation.create({ data: { ...music } })

    const result = await prisma.recommendation.findUnique({ where: { name: music.name } })
    const addScore = await supertest(app).post(`/recommendations/${result.id}/downvote`).send()
    const resultRemoveScore = await prisma.recommendation.findUnique({ where: { name: music.name } })

    expect(resultRemoveScore.score).toEqual(-1)
    expect(addScore.status).toEqual(200)
  })

  it('should exclude recomendation', async () => {
    const music = musicFactory()

    await prisma.recommendation.create({ data: { ...music } })

    const result = await prisma.recommendation.findUnique({ where: { name: music.name } })

    await scoreFactory(result.id, 7, 'downvote')

    const resultRemoveScore = await prisma.recommendation.findUnique({ where: { name: music.name } })

    expect(resultRemoveScore).toBeNull()
  })
})

describe('GET /recommendations', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should return music', async () => {
    const music = musicFactory()

    await prisma.recommendation.create({ data: { ...music } })

    const result = await supertest(app).get('/recommendations')

    expect(result.body.length).toBeGreaterThan(0)
  })
})

describe('GET /recommendations/:id', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should return the song of the selected id', async () => {
    const music = musicFactory()

    const createdMusic = await prisma.recommendation.create({ data: { ...music } })

    const result = await supertest(app).get(`/recommendations/${createdMusic.id}`)

    expect(result.body.id).toEqual(createdMusic.id)
  })
})

describe('GET /recommendations/random', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should return 404 if there are no songs', async () => {

    const result = await supertest(app).get('/recommendations/random')

    expect(404).toEqual(result.status)
  })

  it('should return a random recommendation', async () => {
    const recommendation = 
      {
        name: "House of the Rising Sun",
        youtubeLink: "https://www.youtube.com/watch?v=4-43lLKaqBQ&list=RD4-43lLKaqBQ&start_radio=1&ab_channel=TheAnimalsTributeChannel",
        score: Math.floor(Math.random() * 100)
      }
    const resultDb = await prisma.recommendation.create({data: { ...recommendation}})
    const newRecommendation = {id: resultDb.id, ...recommendation}
    const result = await supertest(app).get('/recommendations/random')
    expect(result.body).toEqual(newRecommendation)
  })
})

describe('GET /recommendations/top/:amount', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async () => {
    await prisma.$disconnect();
  })

  it('should return the songs with the highest score', async () => {
    const music = musicFactory()
    const createdMusic = await prisma.recommendation.create({ data: { ...music } })
    await scoreFactory(createdMusic.id, 12, 'upvote')

    const music1 = musicFactory()
    const createdMusic1 = await prisma.recommendation.create({ data: { ...music1 } })
    await scoreFactory(createdMusic1.id, 7, 'upvote')

    const result = await supertest(app).get(`/recommendations/top/2`)

    expect(result.body[0].score).toEqual(12)
  })
})
import { prisma } from '../src/database.js'
import supertest from 'supertest'
import app from '../src/app.js'

describe('POST /recommendations', ()=>{
  beforeEach(async()=>{
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async()=>{
    await prisma.$disconnect();
  })

  it('should return 201', async()=>{
    const music = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
    }

    const createdMusic = await supertest(app).post('/recommendations').send(music)
    const result = await prisma.recommendation.findUnique({where:{name: music.name}})
    
    expect(result).not.toBeNull()
    expect(createdMusic.status).toEqual(201)
  })

  it('should return 422', async()=>{
    const music = {
      name: 123,
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
    }

    const response = await supertest(app).post('/recommendations').send(music)
    
    expect(response.status).toEqual(422)
  })

  it('should return 422', async()=>{
    const music = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "bananinha"
    }

    const response = await supertest(app).post('/recommendations').send(music)
    
    expect(response.status).toEqual(422)
  })
})

describe('POST /recommendations/:id/upvote', ()=>{
  beforeEach(async()=>{
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async()=>{
    await prisma.$disconnect();
  })

  it('should return upvote and 200', async()=>{
    const music = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
    }

    await prisma.recommendation.create({data: {
      name: music.name,
      youtubeLink: music.youtubeLink
    }})

    const result = await prisma.recommendation.findUnique({where:{name: music.name}})
    const addScore = await supertest(app).post(`/recommendations/${result.id}/upvote`).send()
    const resultAddScore = await prisma.recommendation.findUnique({where:{name: music.name}})

    expect(resultAddScore.score).toEqual(1)
    expect(addScore.status).toEqual(200)
  })
})

describe('POST /recommendations/:id/downvote', ()=>{
  beforeEach(async()=>{
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async()=>{
    await prisma.$disconnect();
  })

  it('should return downvote and 200', async()=>{
    const music = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
    }

    await prisma.recommendation.create({data: {
      name: music.name,
      youtubeLink: music.youtubeLink
    }})

    const result = await prisma.recommendation.findUnique({where:{name: music.name}})
    const addScore = await supertest(app).post(`/recommendations/${result.id}/downvote`).send()
    const resultRemoveScore = await prisma.recommendation.findUnique({where:{name: music.name}})

    expect(resultRemoveScore.score).toEqual(-1)
    expect(addScore.status).toEqual(200)
  })

  it('should exclude recomendation', async()=>{
    const music = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
    }

    await prisma.recommendation.create({data: {
      name: music.name,
      youtubeLink: music.youtubeLink
    }})

    const result = await prisma.recommendation.findUnique({where:{name: music.name}})

    for (let i = 0; i < 7; i++) {  
      await supertest(app).post(`/recommendations/${result.id}/downvote`).send()
    }

    const resultRemoveScore = await prisma.recommendation.findUnique({where:{name: music.name}})

    expect(resultRemoveScore).toBeNull()
  })
})

describe('GET /recommendations', ()=>{
  beforeEach(async()=>{
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  })

  afterAll(async()=>{
    await prisma.$disconnect();
  })

  it('should return music', async()=>{
    const music = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
    }

    await prisma.recommendation.create({data: {
      name: music.name,
      youtubeLink: music.youtubeLink
    }})

    const result = await supertest(app).get('/recommendations')

    expect(result.body.length).toBeGreaterThan(0)
  })
})
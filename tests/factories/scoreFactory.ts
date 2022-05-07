import supertest from 'supertest'
import app from '../../src/app.js'

export default async function scoreFactory(id: number, max: number, type:string){
  for (let i = 0; i < max; i++) {  
    await supertest(app).post(`/recommendations/${id}/${type}`).send()
  }
}
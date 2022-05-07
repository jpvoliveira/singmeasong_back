import { faker } from "@faker-js/faker"

export default function musicFactory(){
  const music = {
    name: faker.lorem.sentence(2),
    youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
  }
  return music
}

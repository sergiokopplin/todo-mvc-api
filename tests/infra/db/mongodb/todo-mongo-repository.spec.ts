import { Collection } from 'mongodb'

import { MongoHelper, TodoMongoRepository } from '@/infra/db'
import { mockAddTodoParams, mockDeleteTodoParams } from '@/tests/domain/mocks'

const makeSut = (): TodoMongoRepository => {
  return new TodoMongoRepository()
}

let todosColletion: Collection

describe('TodoMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  beforeEach(async () => {
    todosColletion = await MongoHelper.getCollection('todos')
    await todosColletion.deleteMany({})
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  describe('add()', () => {
    test('Should return true on success', async () => {
      const sut = makeSut()
      const todo = mockAddTodoParams()
      const result = await sut.add(todo.title)
      expect(result.id).toBeTruthy()
      expect(result.completed).toBe(false)
      expect(result.title).toBe(todo.title)
    })
  })

  describe('delete()', () => {
    test('Should deletes properly and not returns an deleted todo', async () => {
      const sut = makeSut()
      const todo = mockDeleteTodoParams()
      await todosColletion.insertOne({ ...todo, _id: '1' })
      await todosColletion.insertOne({ ...todo, _id: '2' })
      await todosColletion.insertOne({ ...todo, _id: '3' })
      await sut.delete('2')
      const result1 = await todosColletion.findOne({ _id: '1' })
      const result2 = await todosColletion.findOne({ _id: '2' })
      const result3 = await todosColletion.findOne({ _id: '3' })
      expect(result1).toBeTruthy()
      expect(result2).toBe(null)
      expect(result3).toBeTruthy()
    })
  })
})

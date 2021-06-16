import { dbContext } from '../db/DbContext'

class CarsService {
  async deleteCar(id) {
    const car = await dbContext.Cars.findByIdAndDelete(id)
    return car
  }

  async updateCar(id, carData) {
    // NOTE removes the ability to modify the comments in a car update
    delete carData.comments
    const car = await dbContext.Cars.findByIdAndUpdate(id, carData, { new: true, runValidators: true })
    await car.populate('creator').execPopulate()
    return car
    // THE LONG WAY
    // let car = await dbContext.Cars.findById(id)
    // if(!car){
    //     throw new BadRequest("Invalid car id")
    // }
    // carData.id = id
    // await car.update(carData)
    // return car
  }

  async addComment(carId, comment) {
    const car = await dbContext.Cars.findByIdAndUpdate(carId, { $push: { comments: comment } }, { new: true })
    await car.populate('creator', 'name picture').populate('comments.creator', 'name picture').execPopulate()
    return car
  }

  async removeComment(carId, commentId, userId) {
    const car = await dbContext.Cars.findByIdAndUpdate(carId, {
      $pull: {
        comments: {
          _id: commentId,
          creatorId: userId
        }
      }
    }, { new: true })
    await car.populate('creator', 'name picture').populate('comments.creator', 'name picture').execPopulate()
    return car
  }

  async createCar(carData) {
    // Business Logic should you be able to do what you are doing
    const car = await dbContext.Cars.create(carData)
    await car.populate('creator', 'name picture').execPopulate()
    return car
  }

  async getCars(query = {}) {
    // REVIEW                            vv Query Object
    const cars = await dbContext.Cars.find(query).select('-comments').populate('creator', 'name picture')
    return cars
  }

  async getCar(id) {
    const car = await dbContext.Cars.findById(id).populate('creator', 'name picture').populate('comments.creator', 'name picture')
    return car
  }
}

export const carsService = new CarsService()

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let completed = event.completed
  try {
    return await db.collection('todos').where({
      completed: !completed
    }).update({
      completed: completed
    })
  } catch (e) {
    console.error(e)
  }
}
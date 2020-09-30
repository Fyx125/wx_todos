//index.js
//获取应用实例
const app = getApp()

//云开发数据库
const db = wx.cloud.database()
const todosCollection = db.collection('todos')
const _ = db.command

// { name: 'Learning HTML', completed: true },
// { name: 'Learning CSS', completed: false },
// { name: 'Learning JavaScript', completed: false }
// leftCount: 2
Page({
  data: {
    input:'',
    todos:[],
    leftCount:0,
    allCompleted:false
  },
  onLoad: function () {
    this.loadTodos()
  },
  loadTodos: function () {
    todosCollection.get({
      success: (res) => {
        if (res.data) {
          res.data.forEach(item => {
            if (!item.completed) {
              ++this.data.leftCount
            }
          })
        }
        this.setData({
          todos: res.data,
          leftCount: this.data.leftCount
        })
      }
    })
  },
  inputChange:function(e) {
    this.setData({
      input:e.detail.value
    })
  },
  addTodos:function () {
    if (!this.data.input) return;
    var todos=this.data.todos;
    todos.push({
      name:this.data.input,
      completed:false
    });

    todosCollection.add({
      data:{
        name: this.data.input,
        completed: false
      },
      success: res => {
        console.log(res);
        todosCollection.get({
          success: (res) => {
            console.log(res)
            this.setData({
              todos: res.data
            })
          }
        });
      }
    });

    this.setData({
      input: '',
      leftCount: this.data.leftCount + 1
    });
  },
  toggleTodos:function (e) {
    var item = this.data.todos[e.currentTarget.dataset.index];
    item.completed = !item.completed;
    //根据当前任务完成状态判断加减任务数量
    var leftCount = this.data.leftCount + (item.completed ? -1 : 1);

    todosCollection.doc(item._id).update({
      data: {
        completed: item.completed
      },
      success: res => {
        console.log(res);
      }
    });

    this.setData({
      todos:this.data.todos,
      leftCount
    });
  },
  removeTodos:function (e) {
    var todos = this.data.todos;
    var item=todos.splice(e.currentTarget.dataset.index,1)[0];
    var leftCount = this.data.leftCount - (item.completed ? 0 : 1);
    console.log(item)
    todosCollection.doc(item._id).remove({
      success: res => {
        console.log(res);
      }
    });
    this.setData({
      todos,
      leftCount
    });
  },
  toggleAll: function () {
    this.data.allCompleted = !this.data.allCompleted;
    var todos = this.data.todos;
    todos.forEach((item)=>{
      item.completed = this.data.allCompleted;
    });
    var leftCount = this.data.allCompleted ? 0 : this.data.todos.length;

    // wx.cloud.callFunction({
    //   name: 'toggleAll',
    //   data: {
    //     completed: this.data.allCompleted
    //   },
    //   success: res => {
    //     console.log(res)
    //   }
    // })

    todosCollection.where({
      completed: !this.data.allCompleted
    }).update({
      data: {
        completed: this.data.allCompleted
      },
      success: res => {
        console.log(res);
      }
    });

    this.setData({
      todos,
      leftCount
    });
  },
  clear: function () {
    var todos = this.data.todos.filter((item)=>{
      return !item.completed;
    });

    //单条删除
    // todosCollection.where({
    //   completed: true
    // }).remove({
    //   success: res => {
    //     console.log(res);
    //   }
    // });

    //多条删除
    wx.cloud.callFunction({
      name: 'deleteMore',
      success: res => {
        console.log(res)
      }
    })

    this.setData({
      todos
    })

  }
})
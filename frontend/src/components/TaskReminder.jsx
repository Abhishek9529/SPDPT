import React from 'react'

const TaskReminder = () => {
  return (
    <div className='taskReminder'>
        {/* text section */}
      <div>
        <h1>Hello Hemu!</h1>
        <p>You have 3 new tasks. it is a lot of work for today! So let's start!</p>
        <a>review it</a>
      </div>
      {/* image section */}
      <div>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhnU2Yc25xanTgbumGBmExkbPFPZl37B21VY-5GKoefg&s"></img>
      </div>
    </div>
  )
}

export default TaskReminder

users = [
    {
      id: '1697987463710',
      name: 'aaa',
      email: 'aaa@aaaa',
      password: '$2b$10$rVeOVWC3X95KKmAKSi3SeezkFIJzO6tky1nObI50/f4R9ZmJFM9AG'
    }
  ]

func = email => users.find(user => user.email === email)
console.log(func('aaa@aaa'))
const { io } = require('./app')
const { addUser, removeUser, getUser, isPaired, getOpponent, getUsersInRoom, getPairedUsers, getUnpairedUsers } = require('./utils/users')

io.on('connection', (socket) => {
    console.log('Web socket connected')
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }
        
        socket.join(user.room)
        console.log('Paired', getPairedUsers())
        console.log('Unpaired', getUnpairedUsers())
        callback()
    })

    socket.on('pair', (callback) => {
        if (isPaired(socket.id)) {
            callback(true)
            const opponent = getOpponent(socket.id)
            io.to(opponent.id).emit('start')
            io.to(opponent.id).emit('freezePlayer')
            
        }
        else {
            callback(false)
        }
    })
    socket.on('click', (grid, player, callback) => {
        const user = getUser(socket.id)
        io.in(user.room).emit('move', grid, player)
        callback()
    })

    socket.on('freeze', (valid_move) => {
        if (valid_move) {
            const user = getUser(socket.id)
            socket.to(user.room).emit('unfreezeOpponent')
            io.to(socket.id).emit('freezePlayer')
        }
        else {
            console.log("invalid move")
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log('Paired', getPairedUsers())
        console.log('Unpaired', getUnpairedUsers())
    })

})
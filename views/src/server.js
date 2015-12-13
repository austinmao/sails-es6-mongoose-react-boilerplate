import Server from 'socket.io';

export function startServer(store) {
  // const io = new Server().attach(1337);

  store.subscribe(
    () => sails.io.emit('state', store.getState().toJS())
  );

  sails.io.on('connection', (socket) => {
    socket.emit('state', store.getState().toJS());
    socket.on('action', store.dispatch.bind(store));
  });

}

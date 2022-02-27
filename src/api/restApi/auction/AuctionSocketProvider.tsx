import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuctionContextProvider, AuctionContextProps } from './AuctionContext';

type TAuctionProviderProps = {
  url?: string,
  options?: unknown
}
const AuctionSocketProvider: FC<TAuctionProviderProps> = ({ url, children }) => {
  const [socket, setSocket] = useState<Socket | undefined>();

  const connectSocket = useCallback((url) => {
    if (!url) return;
    const socket = io(url, {
      path: '/api/socket.io'
    });
    setSocket(socket);

    socket.on('connection', () => {
      console.log('Socket connected');
    });
  }, []);

  useEffect(() => {
    console.log('try connect socket', url);
    connectSocket(url);
  }, [url, connectSocket]);

  const value = useMemo<AuctionContextProps>(() => ({
    socket
  }), []);

  return (<AuctionContextProvider value={value} >{children}</AuctionContextProvider>);
};

export default AuctionSocketProvider;

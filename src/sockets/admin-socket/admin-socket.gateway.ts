import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import * as polyline from '@mapbox/polyline';
import { getPathLength } from 'geolib';
import { PathService } from 'src/path/path.service';
import { connection } from '../driver-sokcet/driver-sokcet.gateway';

export let locations: any[] = [];
export let frequency: number = 5;
export let threshold: number = 5;

type timeFormat = {
  startTime: number;
  endTime: number;
};

let rawPath = locations;

let matchedPath = [];
let routedPath = [];
let matchedDistance = 0;
let estimatedDistance = 0;
let estimatedTime = 0;
export let time: timeFormat = {
  startTime: 0,
  endTime: 0,
};

const toCoordsArray = (latlngObject) => {
  return latlngObject.map(({ lat, lng }) => [lat, lng]);
};

const mapMatching = async () => {
  const polylineFromCoords = polyline.encode(toCoordsArray(rawPath));

  function filterBackslashes(URL: string) {
    return URL.replace(/\\/g, '%5C');
  }

  const matchURL = filterBackslashes(
    `https://osrm.srv656652.hstgr.cloud/match/v1/driving/polyline(${polylineFromCoords})?overview=false`,
  );

  const res = await fetch(matchURL);
  const json = await res.json();
  matchedPath = json.tracepoints
    .filter(Boolean)
    .map((p) => p.location.reverse());
  matchedDistance = getPathLength(
    matchedPath.map((point) => {
      return { latitude: point[0], longitude: point[1] };
    }),
  );
};

const routing = async () => {
  const startingPoint = [rawPath[0].lat, rawPath[0].lng];
  const endingPoint = [
    rawPath[rawPath.length - 1].lat,
    rawPath[rawPath.length - 1].lng,
  ];
  const matchURL = `https://osrm.srv656652.hstgr.cloud/route/v1/driving/${startingPoint[1]},${startingPoint[0]};${endingPoint[1]},${endingPoint[0]}?overview=full`;

  const res = await fetch(matchURL);
  const json = await res.json();
  routedPath = polyline.decode(json.routes[0].geometry);
  estimatedDistance = json.routes[0].distance;
  estimatedTime = json.routes[0].duration;
};

@WebSocketGateway({
  namespace: 'admin',
  cors: {
    origin: '*',
  },
})
export class AdminSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  io: Namespace;

  constructor(private readonly pathService: PathService) {}

  handleConnection(client: Socket) {
    client.emit('onConnection', { locations, frequency, time,threshold,driverConnection:connection });
  }

  @SubscribeMessage('clearPath')
  clearArrayOfLocations() {
    locations.length = 0;
    this.io.server.of('/driver').emit('clearPath')
  }

  @SubscribeMessage('setFrequency')
  setNewFrequency(@MessageBody() newFrequency: number) {
    frequency = +newFrequency;
    this.io.server.of('/driver').emit('frequency', { frequency });
  }

  @SubscribeMessage('setPathControl')
  setNewPath(@MessageBody() pathControl: boolean) {
    if (locations.length == 0 && +pathControl == 1)
      time.startTime = new Date().getTime();
    if (+pathControl == 0) time.endTime = new Date().getTime();
    this.io.server.of('/driver').emit('pathControl', { pathControl });
  }

  @SubscribeMessage('setThreshold')
  setNewThreShold(@MessageBody() newThreShold: number) {
    threshold = +newThreShold;
    this.io.server.of('/driver').emit('threshold', { threshold });
  }

  @SubscribeMessage('savePath')
  async savePath() {
    await Promise.all([routing(),mapMatching()])
    const savedPath = {
      date: new Date().getTime(),
      routedPath,
      rawPath,
      matchedPath,
      distance: {
        estimated: estimatedDistance,
        raw: getPathLength(
          rawPath.map((point) => {
            return { latitude: point.lat, longitude: point.lng };
          }),
        ),
        matched: matchedDistance,
      },
      time: { estimated: estimatedTime, actual: (time.endTime - time.startTime)/1000 },
    };
    await this.pathService.create(JSON.stringify(savedPath));
  }
}

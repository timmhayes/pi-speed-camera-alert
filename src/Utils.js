const reNMEA = /(\d{2,3})(\d{2}\.\d+)/;

const convertNMEACoordinate = (nmea, direction) => {
  const reMatch = nmea.match(reNMEA);
  if (!reMatch) return null;
  const [,degrees, minutes] = reMatch;
  const directionFactor = direction === 'N' || direction === 'E' ? 1 : -1;
  return (parseInt(degrees) + minutes/60) * directionFactor;
}

const toRadians = (degrees) => {
  return degrees * Math.PI / 180;
};

const toDegrees = (radians) => {
  return radians * 180 / Math.PI;
}

const pointToRadians = (point) => {
  return {
    lat: toRadians(point.lat),
    lng: toRadians(point.lng)
  }
}

const positionBetweenPoints = (point1, point2) => {
  const point1Rad = pointToRadians(point1);
  const point2Rad = pointToRadians(point2);

  const distance = distanceBetweenPoints(point1Rad, point2Rad);
  const bearing = bearingBetweenPoints(point1Rad, point2Rad);

  return { distance, bearing };
}

const distanceBetweenPoints = (point1Rad, point2Rad) => {
  // Haversine formula 
  const dlon = point2Rad.lng - point1Rad.lng;
  const dlat = point2Rad.lat - point1Rad.lat;
  const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(point1Rad.lat) *
    Math.cos(point2Rad.lat) * Math.pow(Math.sin(dlon / 2),2);

  const c = 2 * Math.asin(Math.sqrt(a));
  // Radius of earth in kilometers. Use 3956 for miles
  const r = 6371;

  return(c * r);
}

const bearingBetweenPoints = (point1Rad, point2Rad) => {
  const y = Math.sin(point2Rad.lng - point1Rad.lng) * Math.cos(point2Rad.lat);
  const x = Math.cos(point1Rad.lat) * Math.sin(point2Rad.lat) -
        Math.sin(point1Rad.lat) * Math.cos(point2Rad.lat) * Math.cos(point2Rad.lng - point1Rad.lng);
  let brng = toDegrees(Math.atan2(y, x));
  return (brng + 360) % 360;
}

const GPGGAtoPoint = (GPGGStatement) => {
  const [type, timestamp, NMEAlat, latDir, NMEAlng, lngDir, quality, sats, hdop, altitude, aUnits, undulation, uUnits, age, stnID] = GPGGStatement.split(',');
  return {
    time: timestamp,
    lat: convertNMEACoordinate(NMEAlat, latDir),
    lng: convertNMEACoordinate(NMEAlng, lngDir),
    quality, sats, hdop, altitude, aUnits, undulation, uUnits, age, stnID
  }
}

const GPRMCtoPoint = (GPRMCStatement) => {
  const [type, timestamp, status, NMEAlat, latDir, NMEAlng, lngDir, speed, course, date, variation, varDir] = GPRMCStatement.split(',');
  return {
    time: timestamp,
    lat: convertNMEACoordinate(NMEAlat, latDir),
    lng: convertNMEACoordinate(NMEAlng, lngDir),
    speed: parseFloat(speed) * 1.15078,
    course, date, variation, varDir
  }
}

const trackToGPX = (track) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <gpx version="1.1" creator="StravaGPX" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <time>${track[0].time}</time>
  </metadata>
  <trk>
    <name>StravaGPX</name>
    <trkseg>
      ${track.map(point => `<trkpt lat="${point.lat}" lon="${point.lng}"><ele>${point.altitude}</ele><time>${point.time}</time></trkpt>`).join('\n      ')}
    </trkseg>
  </trk>
  </gpx>`;
}

export default {convertNMEACoordinate, positionBetweenPoints, trackToGPX, GPGGAtoPoint, GPRMCtoPoint}
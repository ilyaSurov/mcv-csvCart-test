import csv from 'csv-parser';

export const MAX_ROWS = 100000;

export function parseCsvToGeoJSON(stream) {
  return new Promise((resolve, reject) => {
    const rows = [];
    let headersChecked = false;

    stream
      .pipe(csv())
      .on('data', (row) => {
        if (!headersChecked) {
          if (!('lat' in row) || !('lng' in row)) {
            stream.destroy();
            reject(new Error('CSV must contain lat and lng columns'));
            return;
          }
          headersChecked = true;
        }

        if (rows.length >= MAX_ROWS) {
          stream.destroy();
          reject(new Error(`CSV exceeds maximum of ${MAX_ROWS} rows`));
          return;
        }

        rows.push(row);
      })
      .on('end', () => {
        if (rows.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }

        try {
          resolve(rowsToFeatureCollection(rows));
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
}

function rowsToFeatureCollection(rows) {
  const features = rows.map((row, index) => {
    const lat = parseCoordinate(row.lat, 'lat', index + 1);
    const lng = parseCoordinate(row.lng, 'lng', index + 1);

    const properties = { ...row };
    delete properties.lat;
    delete properties.lng;

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lat, lng],
      },
      properties,
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

function parseCoordinate(value, field, rowNumber) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`Row ${rowNumber}: missing ${field}`);
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`Row ${rowNumber}: invalid ${field} value "${value}"`);
  }

  return num;
}

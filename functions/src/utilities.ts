export const createBlobArrayJSON = (stringData: object[]) => (
  new Blob(
      [JSON.stringify(stringData)],
      { type: 'application/json' },
  )
);

export const createBlobObjJSON = (stringData: object) => (
  new Blob(
      [JSON.stringify(stringData)],
      { type: 'application/json' },
  )
);

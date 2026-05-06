jest.mock('next/og', () => ({
  ImageResponse: jest.fn((element, options) => ({ element, options })),
}));

describe('course OG route', () => {
  beforeEach(() => {
    jest.resetModules();
    global.fetch = jest.fn(async () => ({
      json: async () => ({
        'CS-6200': { name: 'Graduate Introduction to Operating Systems' },
      }),
    })) as any;
  });

  it('renders an image response with fetched course data', async () => {
    const { GET, runtime } = await import('./[courseid]/route');

    expect(runtime).toBe('edge');
    const response = await GET({} as any, {
      params: Promise.resolve({ courseid: 'CS-6200' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/omshub/data/main/static/courses.json'
    );
    expect(response).toMatchObject({
      options: { width: 1200, height: 630 },
    });
  });

  it('falls back to the course id when the course fetch fails', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('network');
    }) as any;

    const { GET } = await import('./[courseid]/route');
    const response = await GET({} as any, {
      params: Promise.resolve({ courseid: 'CS-9999' }),
    });

    expect(response).toMatchObject({
      options: { width: 1200, height: 630 },
    });
  });
});

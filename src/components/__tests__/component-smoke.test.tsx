import React from 'react';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useCallback: (fn: any) => fn,
    useContext: jest.fn(() => ({})),
    useEffect: (fn: any) => {
      const cleanup = fn();
      if (typeof cleanup === 'function') cleanup();
    },
    useMemo: (fn: any) => fn(),
    useRef: (value: any) => ({ current: value }),
    useState: (initial: any) => [typeof initial === 'function' ? initial() : initial, jest.fn()],
  };
});

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, id }: any) => <script id={id}>{children}</script>,
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/course/cs-6200'),
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: any, options: any) => {
    const Dynamic = (props: any) => {
      if (options?.loading) return options.loading();
      return <div data-dynamic={loader.toString()} {...props} />;
    };
    return Dynamic;
  },
}));

jest.mock('@mantine/core', () => {
  const Primitive = ({ children, component, href, type, ...props }: any) => {
    const Tag = component || (href ? 'a' : type || 'div');
    return <Tag href={href} {...props}>{children}</Tag>;
  };
  const Button = ({ children, onClick, type = 'button', ...props }: any) => (
    <button type={type} onClick={onClick} {...props}>{children}</button>
  );
  const ActionIcon = Button;
  return {
    ActionIcon,
    Anchor: Primitive,
    Avatar: Primitive,
    Badge: Primitive,
    Box: Primitive,
    Burger: Button,
    Button,
    CopyButton: ({ children }: any) => (
      <>
        {children({ copied: false, copy: jest.fn() })}
        {children({ copied: true, copy: jest.fn() })}
      </>
    ),
    createTheme: (theme: any) => theme,
    ColorSwatch: Button,
    Container: Primitive,
    Divider: Primitive,
    Drawer: Primitive,
    Group: Primitive,
    Kbd: Primitive,
    Loader: Primitive,
    Menu: Object.assign(Primitive, {
      Target: Primitive,
      Dropdown: Primitive,
      Item: Button,
      Divider: Primitive,
      Label: Primitive,
    }),
    Modal: Primitive,
    NumberInput: ({ onChange, ...props }: any) => <input type="number" onChange={(e) => onChange?.(Number(e.currentTarget.value))} {...props} />,
    Paper: Primitive,
    Popover: Object.assign(Primitive, {
      Target: Primitive,
      Dropdown: Primitive,
    }),
    PinInput: ({ onChange, onComplete, ...props }: any) => <input onChange={(e) => onChange?.(e.currentTarget.value)} onBlur={() => onComplete?.('12345678')} {...props} />,
    Rating: ({ onChange, ...props }: any) => <input type="number" onChange={(e) => onChange?.(Number(e.currentTarget.value))} {...props} />,
    rem: (value: number) => `${value}px`,
    Select: ({ onChange, data = [], ...props }: any) => (
      <select onChange={(e) => onChange?.(e.currentTarget.value)} {...props}>
        {data.map((item: any) => <option key={item.value ?? item} value={item.value ?? item}>{item.label ?? item}</option>)}
      </select>
    ),
    SimpleGrid: Primitive,
    Stack: Primitive,
    Text: Primitive,
    TextInput: ({ onChange, ...props }: any) => <input onChange={onChange} {...props} />,
    ThemeIcon: Primitive,
    Tooltip: ({ children }: any) => <>{children}</>,
    Transition: ({ children }: any) => children({}),
    UnstyledButton: Button,
    useMantineColorScheme: jest.fn(() => ({ colorScheme: 'light', setColorScheme: jest.fn() })),
  };
});

jest.mock('@mantine/hooks', () => ({
  useDisclosure: jest.fn((initial = false) => [
    initial,
    { open: jest.fn(), close: jest.fn(), toggle: jest.fn() },
  ]),
    useLocalStorage: jest.fn(({ defaultValue }: any) => [defaultValue, jest.fn()]),
  useMediaQuery: jest.fn(() => false),
  useWindowScroll: jest.fn(() => [{ y: 400 }, jest.fn()]),
}));

jest.mock('@mantine/spotlight', () => ({
  Spotlight: ({ actions = [], filter }: any) => (
    <div data-testid="spotlight">
      {filter ? filter('gios', actions).map((action: any) => (
        <button key={action.id} onClick={action.onClick}>{action.label}</button>
      )) : null}
    </div>
  ),
  spotlight: { open: jest.fn() },
}));

jest.mock('@mantine/notifications', () => ({
  Notifications: ({ children }: any) => <div>{children}</div>,
  notifications: { show: jest.fn() },
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-1', email: 'student@gatech.edu', user_metadata: { full_name: 'Student', avatar_url: 'avatar.png' } },
    loading: false,
    logout: jest.fn(),
    signInWithProvider: jest.fn(),
    signInWithEmailOtp: jest.fn(),
  })),
  storeReturnUrl: jest.fn(),
}));

jest.mock('@/context/MenuContext', () => ({
  useMenu: jest.fn(() => ({
    loginOpen: false,
    handleLoginOpen: jest.fn(),
    handleLoginClose: jest.fn(),
  })),
}));

jest.mock('@/utils/notifications', () => ({
  notifyBookmarkAdded: jest.fn(),
  notifyBookmarkRemoved: jest.fn(),
  notifyError: jest.fn(),
  notifyLinkCopied: jest.fn(),
  notifyNoReviews: jest.fn(),
  notifySuccess: jest.fn(),
}));

jest.mock('@/lib/staticData', () => ({
  getCoursesDataStatic: jest.fn(async () => ({
    'CS-6200': { name: 'Operating Systems', aliases: ['GIOS'] },
  })),
}));

jest.mock('html-to-image', () => ({ toBlob: jest.fn(async () => new Blob(['x'], { type: 'image/png' })) }));
jest.mock('react-markdown', () => ({ __esModule: true, default: ({ children }: any) => <div>{children}</div> }));
jest.mock('string-width', () => ({ __esModule: true, default: (value: string) => value.length }));
jest.mock('remark-gfm', () => ({}));
jest.mock('remark-math', () => ({}));
jest.mock('rehype-katex', () => ({}));
jest.mock('rehype-raw', () => ({}));
jest.mock('@tiptap/react', () => ({
  EditorContent: () => <div data-testid="editor-content" />,
  useEditor: jest.fn((options: any) => {
    const chain = new Proxy(
      { run: jest.fn(() => true) },
      { get: (target, prop) => (prop in target ? (target as any)[prop] : () => chain) }
    );
    const can = new Proxy(
      {},
      { get: () => () => true }
    );
    const editor = {
      chain: () => chain,
      can: () => can,
      isActive: jest.fn(() => false),
      getAttributes: jest.fn(() => ({ color: '#000000' })),
      getHTML: jest.fn(() => '<p>body</p>'),
      commands: { setContent: jest.fn() },
      isEmpty: true,
    };
    options?.onUpdate?.({ editor });
    return editor;
  }),
}));
jest.mock('@tiptap/starter-kit', () => ({ __esModule: true, default: { configure: jest.fn(() => ({})) } }));
for (const mod of [
  '@tiptap/extension-link',
  '@tiptap/extension-placeholder',
  '@tiptap/extension-code-block-lowlight',
  '@tiptap/extension-highlight',
  '@tiptap/extension-text-align',
  '@tiptap/extension-superscript',
  '@tiptap/extension-subscript',
  '@tiptap/extension-underline',
  '@tiptap/extension-color',
  '@tiptap/extension-text-style',
  '@tiptap/extension-task-item',
  '@tiptap/extension-task-list',
]) {
  jest.mock(mod, () => ({ __esModule: true, default: { configure: jest.fn(() => ({})) }, Color: {}, TextStyle: {} }), { virtual: false });
}
jest.mock('lowlight', () => ({ common: {}, createLowlight: jest.fn(() => ({})) }));
jest.mock('react-hook-form', () => ({
  Controller: ({ render }: any) => render({ field: { value: '', onChange: jest.fn() }, fieldState: {} }),
  useForm: jest.fn(() => ({
    control: {},
    handleSubmit: (fn: any) => (event?: any) => fn({}, event),
    getValues: jest.fn(() => ({})),
    trigger: jest.fn(async () => true),
    reset: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn((field: string) => ({ workload: 12, difficulty: 4, overall: 5 }[field] ?? null)),
    formState: { errors: {}, isDirty: true, isValid: true, isSubmitting: false },
  })),
}));

function execute(element: any): string {
  if (element === null || element === undefined || typeof element === 'boolean') return '';
  if (typeof element === 'string' || typeof element === 'number') return String(element);
  if (Array.isArray(element)) return element.map(execute).join('');
  if (!React.isValidElement(element)) return '';
  if (element.type === React.Fragment) return execute((element.props as any).children);
  if (typeof element.type === 'function') {
    return execute(element.type(element.props));
  }
  const props = element.props as any;
  if (typeof props.onChange === 'function') {
    props.onChange({
      currentTarget: { value: props.type === 'number' ? '12' : 'student@gatech.edu' },
      target: { value: 'https://omshub.org/course/CS-6200' },
    });
  }
  if (typeof props.onBlur === 'function') props.onBlur();
  if (typeof props.onKeyDown === 'function') {
    props.onKeyDown({ key: 'Enter', preventDefault: jest.fn(), stopPropagation: jest.fn() });
  }
  if (element.type === 'form' && typeof props.onSubmit === 'function') {
    props.onSubmit({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
  }
  if (typeof props.onClick === 'function') props.onClick({ currentTarget: document.createElement('button') });
  return execute(props.children);
}

function mount(element: React.ReactElement) {
  document.body.textContent += execute(element);
}

describe('component smoke coverage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Object.defineProperty(global.navigator, 'userAgent', {
      configurable: true,
      value: 'Firefox',
    });
    Object.assign(global.navigator, {
      clipboard: { write: jest.fn(async () => undefined) },
    });
    (global as any).ClipboardItem = function ClipboardItem(value: unknown) {
      return value;
    };
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({}),
    })) as any;
  });

  it('renders shared navigation and presentation components', async () => {
    const { default: AutoBreadcrumbs } = await import('@/components/AutoBreadcrumbs');
    const { default: Breadcrumbs } = await import('@/components/Breadcrumbs');
    const { default: Footer } = await import('@/components/Footer');
    const { Hero } = await import('@/components/Hero');
    const { default: HighlightedText } = await import('@/components/HighlightedText');
    const MicrosoftClarity = (await import('@/components/analytics/MicrosoftClarity')).default;
    const { NavBarMantine } = await import('@/components/NavBarMantine');
    const { useAuth } = await import('@/context/AuthContext');

    mount(
      <>
        <AutoBreadcrumbs />
        <Breadcrumbs items={[{ label: 'Courses', href: '/course' }, { label: 'CS-6200' }]} />
        <Footer />
        <Hero title="OMSHub" subtitle="Courses" showSearch stats={[{ icon: <span>i</span>, value: 1, label: 'Review' }]} />
        <HighlightedText text="Operating systems" highlight="systems" />
        <MicrosoftClarity projectId="abc" />
        <NavBarMantine />
      </>
    );

    expect(document.body.textContent).toContain('OMSHub');
    expect(document.body.textContent).toContain('Operating');

    (useAuth as jest.Mock).mockReturnValueOnce({
      user: null,
      loading: false,
      logout: jest.fn(),
      signInWithProvider: jest.fn(),
      signInWithEmailOtp: jest.fn(),
    });
    mount(<NavBarMantine />);
  });

  it('renders course actions, structured data, search, editor, forms, and cards', async () => {
    const CourseActionBar = (await import('@/components/CourseActionBar')).default;
    const ReviewCard = (await import('@/components/ReviewCard')).default;
    const ReviewForm = (await import('@/components/ReviewForm')).default;
    const LoginDrawer = (await import('@/components/LoginDrawer')).default;
    const SpotlightSearch = (await import('@/components/SpotlightSearch')).default;
    const TipTapEditor = (await import('@/components/TipTapEditor')).default;
    const MantineProviderModule = await import('@/components/providers/MantineProvider');
    const MantineThemeProvider = MantineProviderModule.default;
    const ProvidersModule = await import('@/components/providers/Providers');
    const Providers = ProvidersModule.default;
    const Structured = await import('@/components/StructuredData');

    document.body.innerHTML = '';
    mount(<CourseActionBar courseId="CS-6200" courseName="Operating Systems" isLoggedIn reviewCount={2} onAddReview={jest.fn()} />);

    document.body.innerHTML = '<div data-review-card>review</div>';
    document.querySelector('[data-review-card]')!.scrollIntoView = jest.fn();
    const review = {
      reviewId: 'review-1',
      courseId: 'CS-6200',
      courseName: 'Operating Systems',
      body: 'This course has systems content',
      overall: 5,
      difficulty: 3,
      workload: 12,
      semesterId: 'fa',
      created: Date.UTC(2025, 1, 1),
      modified: null,
      year: 2025,
      reviewerId: 'user-1',
      isLegacy: false,
      isGTVerifiedReviewer: true,
      upvotes: 1,
      downvotes: 0,
    } as any;

    mount(
      <>
        <CourseActionBar courseId="CS-6200" courseName="Operating Systems" isLoggedIn reviewCount={2} onAddReview={jest.fn()} />
        <LoginDrawer opened onClose={jest.fn()} />
        <ReviewCard {...review} searchHighlight="systems" />
        <ReviewForm courseId="CS-6200" courseName="Operating Systems" reviewInput={review} handleReviewModalClose={jest.fn()} />
        <SpotlightSearch courses={{ 'CS-6200': { courseId: 'CS-6200', name: 'Operating Systems', aliases: ['GIOS'], numReviews: 10, avgDifficulty: 3, avgWorkload: 12, avgOverall: 4.5 } as any }} />
        <SpotlightSearch />
        <TipTapEditor initialValue="<p>hello</p>" onChange={jest.fn()} />
        <MantineThemeProvider><div>theme child</div></MantineThemeProvider>
        <Providers><div>provider child</div></Providers>
        <Structured.CourseSchema course={{ courseId: 'CS-6200', name: 'Operating Systems', numReviews: 1, avgOverall: 4.5, avgDifficulty: 3, avgWorkload: 12, isFoundational: true, url: 'https://example.com' } as any} reviews={[review]} />
        <Structured.OrganizationSchema />
        <Structured.WebsiteSchema />
        <Structured.BreadcrumbSchema items={[{ name: 'Home', url: '/' }]} />
        <Structured.FAQSchema course={{ courseId: 'CS-6200', name: 'Operating Systems', numReviews: 1, avgOverall: 4.5, avgDifficulty: 3, avgWorkload: 12 } as any} />
      </>
    );

    await expect(ProvidersModule.loadSpotlightSearch()).resolves.toBeDefined();
    await expect(ProvidersModule.loadLoginDrawer()).resolves.toBeDefined();
    expect(MantineProviderModule.resolver({} as any)).toHaveProperty('variables');

    expect(document.body.textContent).toContain('Operating Systems');
  });
});

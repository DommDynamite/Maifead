import type { ContentItem } from '@maifead/types';

export const mockFeedItems: ContentItem[] = [
  {
    id: 'youtube-1',
    source: {
      type: 'rss',
      name: 'Fireship',
      url: 'https://www.youtube.com/@Fireship',
      icon: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRQ7HKXJjkJR4fXBDjVjJGmR8lFZgVp2P91WZ=s176-c-k-c0x00ffffff-no-rj',
    },
    title: 'React in 100 Seconds',
    content: {
      text: 'React is a little JavaScript library with a big influence over the webdev world. Learn the basics of React in 100 Seconds',
      html: '<p>React is a little JavaScript library with a big influence over the webdev world. Learn the basics of React in 100 Seconds</p>',
      excerpt: 'React is a little JavaScript library with a big influence over the webdev world...',
    },
    media: [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=2gcgv3_JvE4',
        thumbnail: 'https://i.ytimg.com/vi/2gcgv3_JvE4/maxresdefault.jpg',
        embedUrl: 'https://www.youtube.com/embed/2gcgv3_JvE4',
        width: 1280,
        height: 720,
      },
    ],
    author: {
      name: 'Fireship',
      url: 'https://www.youtube.com/@Fireship',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    url: 'https://www.youtube.com/watch?v=2gcgv3_JvE4',
    isRead: false,
    tags: ['react', 'javascript', 'tutorial', 'video'],
    language: 'en',
  },
  {
    id: '1',
    source: {
      type: 'rss',
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com/feed/',
      icon: 'https://css-tricks.com/favicon.ico',
    },
    title: 'Understanding CSS Grid Layout: A Complete Guide',
    content: {
      text: 'CSS Grid Layout is a powerful two-dimensional layout system that allows you to create complex responsive layouts with ease. In this comprehensive guide, we will explore the fundamentals of CSS Grid and how to leverage its features to build modern web layouts.',
      html: '<p>CSS Grid Layout is a powerful two-dimensional layout system that allows you to create complex responsive layouts with ease. In this comprehensive guide, we will explore the fundamentals of CSS Grid and how to leverage its features to build modern web layouts.</p>',
      excerpt:
        'CSS Grid Layout is a powerful two-dimensional layout system that allows you to create complex responsive layouts with ease...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/grid/1200/630',
        alt: 'CSS Grid example layout',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'Chris Coyier',
      url: 'https://css-tricks.com/author/chriscoyier/',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    url: 'https://css-tricks.com/understanding-css-grid-layout/',
    isRead: false,
    tags: ['css', 'grid', 'layout'],
    language: 'en',
  },
  {
    id: '2',
    source: {
      type: 'rss',
      name: 'Rust Blog',
      url: 'https://blog.rust-lang.org/feed.xml',
      icon: 'https://www.rust-lang.org/favicon.ico',
    },
    title: 'Announcing Rust 1.77.0',
    content: {
      text: "The Rust team is happy to announce a new version of Rust, 1.77.0. Rust is a programming language empowering everyone to build reliable and efficient software. This release includes several improvements to the language, compiler, and libraries.",
      html: "<p>The Rust team is happy to announce a new version of Rust, 1.77.0. Rust is a programming language empowering everyone to build reliable and efficient software. This release includes several improvements to the language, compiler, and libraries.</p>",
      excerpt:
        'The Rust team is happy to announce a new version of Rust, 1.77.0. This release includes several improvements...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/rust/1200/630',
        alt: 'Rust programming language logo',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'The Rust Team',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    url: 'https://blog.rust-lang.org/2024/03/15/Rust-1.77.0.html',
    isRead: false,
    tags: ['rust', 'programming', 'release'],
    language: 'en',
  },
  {
    id: '3',
    source: {
      type: 'rss',
      name: 'A List Apart',
      url: 'https://alistapart.com/feed/',
      icon: 'https://alistapart.com/favicon.ico',
    },
    title: 'Designing for Accessibility: Best Practices',
    content: {
      text: 'Accessibility is not just about complying with standards; it\'s about creating inclusive experiences for all users. This article explores practical strategies for designing accessible web interfaces that work for everyone, regardless of their abilities.',
      html: '<p>Accessibility is not just about complying with standards; it\'s about creating inclusive experiences for all users. This article explores practical strategies for designing accessible web interfaces that work for everyone, regardless of their abilities.</p>',
      excerpt:
        "Accessibility is not just about complying with standards; it's about creating inclusive experiences for all users...",
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    url: 'https://alistapart.com/article/designing-for-accessibility/',
    isRead: true,
    tags: ['accessibility', 'design', 'ux'],
    language: 'en',
  },
  {
    id: '4',
    source: {
      type: 'rss',
      name: 'Smashing Magazine',
      url: 'https://www.smashingmagazine.com/feed/',
      icon: 'https://www.smashingmagazine.com/favicon.ico',
    },
    title: 'Modern JavaScript: ES2024 Features You Should Know',
    content: {
      text: 'JavaScript continues to evolve with new features that make development more efficient and code more readable. Let\'s explore the latest additions to the language in ES2024, including new array methods, improved error handling, and more.',
      html: '<p>JavaScript continues to evolve with new features that make development more efficient and code more readable. Let\'s explore the latest additions to the language in ES2024, including new array methods, improved error handling, and more.</p>',
      excerpt:
        'JavaScript continues to evolve with new features that make development more efficient and code more readable...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/javascript/1200/630',
        alt: 'JavaScript code on screen',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'Sarah Drasner',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    url: 'https://www.smashingmagazine.com/2024/03/modern-javascript-es2024/',
    isRead: false,
    tags: ['javascript', 'es2024', 'programming'],
    language: 'en',
  },
  {
    id: '5',
    source: {
      type: 'rss',
      name: 'The Verge',
      url: 'https://www.theverge.com/rss/index.xml',
      icon: 'https://www.theverge.com/favicon.ico',
    },
    title: 'The Future of AI: Trends and Predictions for 2024',
    content: {
      text: 'Artificial intelligence is rapidly transforming industries across the globe. From healthcare to transportation, AI technologies are becoming more sophisticated and accessible. This article examines the key trends shaping the future of AI and what we can expect in the coming years.',
      html: '<p>Artificial intelligence is rapidly transforming industries across the globe. From healthcare to transportation, AI technologies are becoming more sophisticated and accessible. This article examines the key trends shaping the future of AI and what we can expect in the coming years.</p>',
      excerpt:
        'Artificial intelligence is rapidly transforming industries across the globe. Key trends shaping the future...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/ai/1200/630',
        alt: 'AI concept illustration',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'James Vincent',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
    url: 'https://www.theverge.com/2024/3/15/future-ai-trends-2024',
    isRead: false,
    tags: ['ai', 'technology', 'future'],
    language: 'en',
  },
  {
    id: '6',
    source: {
      type: 'rss',
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com/feed/',
      icon: 'https://css-tricks.com/favicon.ico',
    },
    title: 'Flexbox vs Grid: When to Use Which',
    content: {
      text: 'Both Flexbox and Grid are powerful CSS layout systems, but they excel in different scenarios. Understanding when to use each can significantly improve your layout code and development workflow. Let\'s break down the differences and best use cases for both.',
      html: '<p>Both Flexbox and Grid are powerful CSS layout systems, but they excel in different scenarios. Understanding when to use each can significantly improve your layout code and development workflow. Let\'s break down the differences and best use cases for both.</p>',
      excerpt:
        'Both Flexbox and Grid are powerful CSS layout systems, but they excel in different scenarios...',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    url: 'https://css-tricks.com/flexbox-vs-grid/',
    isRead: true,
    tags: ['css', 'flexbox', 'grid'],
    language: 'en',
  },
  {
    id: '7',
    source: {
      type: 'rss',
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      icon: 'https://techcrunch.com/favicon.ico',
    },
    title: 'Startup Funding Hits Record High in Q1 2024',
    content: {
      text: 'Venture capital investment in startups reached unprecedented levels in the first quarter of 2024, with over $50 billion deployed across various sectors. The surge is driven by renewed interest in AI, clean tech, and healthcare innovation.',
      html: '<p>Venture capital investment in startups reached unprecedented levels in the first quarter of 2024, with over $50 billion deployed across various sectors. The surge is driven by renewed interest in AI, clean tech, and healthcare innovation.</p>',
      excerpt:
        'Venture capital investment in startups reached unprecedented levels in Q1 2024, with over $50 billion deployed...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/startup/1200/630',
        alt: 'Startup office environment',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'Alex Wilhelm',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30), // 1.25 days ago
    url: 'https://techcrunch.com/2024/03/14/startup-funding-q1-2024',
    isRead: false,
    tags: ['startups', 'funding', 'venture-capital'],
    language: 'en',
  },
  {
    id: '8',
    source: {
      type: 'rss',
      name: 'Hacker News',
      url: 'https://news.ycombinator.com/rss',
      icon: 'https://news.ycombinator.com/favicon.ico',
    },
    title: 'Show HN: I built a terminal-based RSS reader in Rust',
    content: {
      text: 'After being frustrated with existing RSS readers, I decided to build my own terminal-based solution in Rust. It\'s fast, customizable, and works entirely from the command line. The project is open source and I\'d love to get feedback from the community.',
      html: '<p>After being frustrated with existing RSS readers, I decided to build my own terminal-based solution in Rust. It\'s fast, customizable, and works entirely from the command line. The project is open source and I\'d love to get feedback from the community.</p>',
      excerpt:
        'After being frustrated with existing RSS readers, I decided to build my own terminal-based solution in Rust...',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
    url: 'https://news.ycombinator.com/item?id=39712345',
    isRead: false,
    tags: ['show-hn', 'rust', 'cli', 'rss'],
    language: 'en',
  },
  {
    id: '9',
    source: {
      type: 'rss',
      name: 'A List Apart',
      url: 'https://alistapart.com/feed/',
      icon: 'https://alistapart.com/favicon.ico',
    },
    title: 'Responsive Typography: Scaling Text with Viewport Units',
    content: {
      text: 'Creating truly responsive typography that scales smoothly across all device sizes can be challenging. Viewport units offer a powerful solution, but they need to be used carefully to maintain readability and accessibility.',
      html: '<p>Creating truly responsive typography that scales smoothly across all device sizes can be challenging. Viewport units offer a powerful solution, but they need to be used carefully to maintain readability and accessibility.</p>',
      excerpt:
        'Creating truly responsive typography that scales smoothly across all device sizes can be challenging...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/typography/1200/630',
        alt: 'Typography examples',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'Laura Kalbag',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    url: 'https://alistapart.com/article/responsive-typography/',
    isRead: false,
    tags: ['typography', 'responsive-design', 'css'],
    language: 'en',
  },
  {
    id: '10',
    source: {
      type: 'rss',
      name: 'The Verge',
      url: 'https://www.theverge.com/rss/index.xml',
      icon: 'https://www.theverge.com/favicon.ico',
    },
    title: 'Electric Vehicles Reach 20% Market Share in Europe',
    content: {
      text: 'Electric vehicle adoption continues to accelerate across Europe, with EVs now accounting for one in five new car sales. The milestone marks a significant shift in the automotive industry as countries push toward carbon neutrality.',
      html: '<p>Electric vehicle adoption continues to accelerate across Europe, with EVs now accounting for one in five new car sales. The milestone marks a significant shift in the automotive industry as countries push toward carbon neutrality.</p>',
      excerpt:
        'Electric vehicle adoption continues to accelerate across Europe, with EVs now accounting for one in five new car sales...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/ev/1200/630',
        alt: 'Electric vehicle charging',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'Andrew J. Hawkins',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 60), // 2.5 days ago
    url: 'https://www.theverge.com/2024/3/12/ev-market-share-europe-20-percent',
    isRead: true,
    tags: ['electric-vehicles', 'europe', 'sustainability'],
    language: 'en',
  },
  {
    id: '11',
    source: {
      type: 'rss',
      name: 'Smashing Magazine',
      url: 'https://www.smashingmagazine.com/feed/',
      icon: 'https://www.smashingmagazine.com/favicon.ico',
    },
    title: 'Building Resilient Frontend Architecture: A Deep Dive into Modern Web Applications',
    content: {
      text: 'In today\'s fast-paced web development landscape, building resilient frontend architectures has become more critical than ever. This comprehensive guide explores the principles, patterns, and practices that separate robust, maintainable applications from fragile ones. We\'ll examine state management strategies, component architecture, error handling, performance optimization, and deployment patterns that stand the test of time. Whether you\'re working on a small project or a large-scale enterprise application, these principles will help you build software that can adapt and evolve with changing requirements.',
      html: `
        <h2>Introduction</h2>
        <p>In today's fast-paced web development landscape, building resilient frontend architectures has become more critical than ever. As applications grow in complexity and user expectations continue to rise, the need for robust, maintainable, and scalable frontend solutions has never been greater.</p>

        <p>This comprehensive guide explores the principles, patterns, and practices that separate resilient applications from fragile ones. We'll examine real-world scenarios, discuss trade-offs, and provide actionable insights you can apply to your own projects.</p>

        <h2>The Foundation: Component Architecture</h2>
        <p>At the heart of any modern frontend application lies its component architecture. The way you organize, structure, and compose your components has a profound impact on your application's maintainability and scalability.</p>

        <h3>The Single Responsibility Principle</h3>
        <p>Each component should have one clear purpose. When a component tries to do too much, it becomes difficult to test, reuse, and maintain. Consider this example:</p>

        <blockquote>
          <p>"A component that fetches data, manages form state, handles validation, and renders UI is doing too much. Break it down into smaller, focused pieces."</p>
        </blockquote>

        <h3>Composition Over Inheritance</h3>
        <p>React and modern frameworks embrace composition as the primary way to build UIs. Instead of creating deep inheritance hierarchies, compose smaller components together to create complex interfaces. This approach offers several advantages:</p>

        <ul>
          <li>Better code reuse across different contexts</li>
          <li>Easier to understand and reason about</li>
          <li>More flexible when requirements change</li>
          <li>Simpler testing strategies</li>
        </ul>

        <h2>State Management Strategies</h2>
        <p>State management remains one of the most debated topics in frontend development. The key is understanding that different types of state require different solutions.</p>

        <h3>Local vs Global State</h3>
        <p>Not all state needs to be global. In fact, keeping state as local as possible leads to simpler, more maintainable code. Ask yourself: "What is the minimum scope this state needs to exist in?" If only one component and its children need access to a piece of state, keep it local.</p>

        <p>Global state should be reserved for truly application-wide concerns like user authentication, theme preferences, or data that needs to be accessed across many unrelated parts of your application.</p>

        <h3>Server State vs Client State</h3>
        <p>One of the most important distinctions in modern applications is between server state (data from your API) and client state (UI state like modals, form inputs, etc.). Tools like TanStack Query have revolutionized how we handle server state by providing:</p>

        <ul>
          <li>Automatic caching and invalidation</li>
          <li>Background refetching and updates</li>
          <li>Optimistic updates</li>
          <li>Built-in loading and error states</li>
        </ul>

        <h2>Error Handling and Resilience</h2>
        <p>Resilient applications gracefully handle failures. Network requests fail, APIs return unexpected data, and users do unexpected things. Your application needs to handle these scenarios without crashing or leaving users confused.</p>

        <h3>Error Boundaries</h3>
        <p>React's Error Boundaries provide a way to catch JavaScript errors anywhere in your component tree and display a fallback UI. Every significant section of your application should be wrapped in an error boundary to prevent a single component failure from crashing your entire app.</p>

        <h3>Retry Logic and Fallbacks</h3>
        <p>When network requests fail, implement intelligent retry logic with exponential backoff. Provide meaningful error messages and clear actions users can take. Consider offline support and graceful degradation for critical features.</p>

        <h2>Performance Optimization</h2>
        <p>Performance is a feature. Slow applications frustrate users and hurt business metrics. However, premature optimization can lead to complex code that's hard to maintain. The key is finding the right balance.</p>

        <h3>Measure First, Optimize Second</h3>
        <p>Before optimizing, measure. Use tools like React DevTools Profiler, Chrome DevTools, and Lighthouse to identify actual bottlenecks. You might be surprised by what's actually slow versus what you think is slow.</p>

        <h3>Code Splitting and Lazy Loading</h3>
        <p>Don't make users download code they might never use. Split your application into logical chunks and load them on demand. Modern bundlers make this straightforward with dynamic imports.</p>

        <h2>Testing Strategies</h2>
        <p>Tests give you confidence to refactor and add features without breaking existing functionality. A good testing strategy includes:</p>

        <ul>
          <li><strong>Unit tests</strong> for complex business logic and utility functions</li>
          <li><strong>Integration tests</strong> for how components work together</li>
          <li><strong>End-to-end tests</strong> for critical user journeys</li>
        </ul>

        <p>Focus your testing efforts on the most critical paths through your application. You don't need 100% code coverage—you need confidence that the most important features work correctly.</p>

        <h2>Conclusion</h2>
        <p>Building resilient frontend applications is an ongoing journey, not a destination. The patterns and practices discussed here provide a foundation, but every application is unique. The key is understanding the principles behind these practices so you can adapt them to your specific context.</p>

        <p>Remember: the best architecture is the one that allows your team to move quickly while maintaining quality. Stay pragmatic, measure results, and always be learning.</p>
      `,
      excerpt: 'In today\'s fast-paced web development landscape, building resilient frontend architectures has become more critical than ever. This comprehensive guide explores the principles, patterns, and practices...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/seed/architecture/1200/630',
        alt: 'Modern web application architecture diagram',
        width: 1200,
        height: 630,
      },
    ],
    author: {
      name: 'Addy Osmani',
      url: 'https://addyosmani.com',
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    url: 'https://www.smashingmagazine.com/2024/03/building-resilient-frontend-architecture/',
    isRead: false,
    tags: ['architecture', 'frontend', 'best-practices', 'performance'],
    language: 'en',
  },
];

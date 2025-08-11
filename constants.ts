
import { ReadingPlan } from './types';

export const BIBLE_VERSIONS = [
    { id: 'kjv', name: 'King James Version' },
    { id: 'web', name: 'World English Bible' },
    { id: 'webbe', name: 'World English Bible (British Edition)' },
    { id: 'bbe', name: 'Bible in Basic English' },
    { id: 'oeb-us', name: 'Open English Bible (US Edition)' },
    { id: 'ylt', name: "Young's Literal Translation" },
];

export const READING_PLANS_DATA: ReadingPlan[] = [
    {
        id: 'gospels-30-days',
        title: 'Gospels in 30 Days',
        description: 'Read through Matthew, Mark, Luke, and John in one month.',
        durationDays: 30,
        passages: [
            'Matthew 1-9', 'Matthew 10-15', 'Matthew 16-22', 'Matthew 23-28',
            'Mark 1-4', 'Mark 5-8', 'Mark 9-12', 'Mark 13-16',
            'Luke 1-3', 'Luke 4-6', 'Luke 7-9', 'Luke 10-12', 'Luke 13-15', 'Luke 16-18', 'Luke 19-21', 'Luke 22-24',
            'John 1-3', 'John 4-6', 'John 7-8', 'John 9-10', 'John 11-12', 'John 13-15', 'John 16-18', 'John 19-21',
            'Review: Matthew', 'Review: Mark', 'Review: Luke', 'Review: John', 'Reflect on Parables', 'Reflect on Miracles'
        ],
    },
    {
        id: 'proverbs-by-theme',
        title: 'Proverbs by Theme',
        description: 'A 1-week study of key themes in the book of Proverbs.',
        durationDays: 7,
        passages: [
            'Wisdom vs. Folly (Prov 1, 9)', 'The Power of Words (Prov 12, 18)', 'Diligence & Sloth (Prov 6, 26)',
            'Friendship (Prov 17, 27)', 'Wealth & Poverty (Prov 10, 22)', 'Humility & Pride (Prov 11, 16)',
            'Family & Children (Prov 4, 22:6)'
        ],
    },
    {
        id: 'psalms-of-praise',
        title: 'Psalms of Praise',
        description: 'Spend 10 days meditating on psalms of praise and worship.',
        durationDays: 10,
        passages: [
            'Psalm 8', 'Psalm 19', 'Psalm 29', 'Psalm 33', 'Psalm 66',
            'Psalm 95', 'Psalm 100', 'Psalm 103', 'Psalm 148', 'Psalm 150'
        ]
    }
];

export const DAILY_VERSE_SUGGESTIONS = [
    'John 3:16', 'Romans 8:28', 'Philippians 4:13', 'Proverbs 3:5-6', 'Jeremiah 29:11',
    '1 Corinthians 10:13', 'Psalm 23:1-4', 'Ephesians 2:8-9', 'Galatians 5:22-23', 'Hebrews 11:1'
];

export const NEW_TESTAMENT_BOOKS = [
    { name: 'Matthew', chapters: 28 },
    { name: 'Mark', chapters: 16 },
    { name: 'Luke', chapters: 24 },
    { name: 'John', chapters: 21 },
    { name: 'Acts', chapters: 28 },
    { name: 'Romans', chapters: 16 },
    { name: '1 Corinthians', chapters: 16 },
    { name: '2 Corinthians', chapters: 13 },
    { name: 'Galatians', chapters: 6 },
    { name: 'Ephesians', chapters: 6 },
    { name: 'Philippians', chapters: 4 },
    { name: 'Colossians', chapters: 4 },
    { name: '1 Thessalonians', chapters: 5 },
    { name: '2 Thessalonians', chapters: 3 },
    { name: '1 Timothy', chapters: 6 },
    { name: '2 Timothy', chapters: 4 },
    { name: 'Titus', chapters: 3 },
    { name: 'Philemon', chapters: 1 },
    { name: 'Hebrews', chapters: 13 },
    { name: 'James', chapters: 5 },
    { name: '1 Peter', chapters: 5 },
    { name: '2 Peter', chapters: 3 },
    { name: '1 John', chapters: 5 },
    { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 },
    { name: 'Jude', chapters: 1 },
    { name: 'Revelation', chapters: 22 }
];

import { Tool } from '../types';

export const TOOLS: Tool[] = [
  // Calculators
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    slug: 'age-calculator',
    description: 'Calculate your exact age in years, months, days, hours, and minutes from your birth date.',
    categories: ['calculators'],
    iconName: 'Calendar',
    route: '/tools/age-calculator',
    keywords: ['age', 'birthday', 'birth date', 'years', 'days', 'time lived', 'date difference'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Select or type your date of birth in the input field.',
      'Optionally specify an "as of" target date if you want to calculate your age at a specific point in time.',
      'Click "Calculate Age" to view your exact age breakdown and upcoming birthday countdown.',
      'Use the copy summary button to copy your age report to your clipboard.',
    ],
    about:
      'The Age Calculator computes the precise chronological difference between your date of birth and any target date (defaulting to today). It accurately accounts for leap years, differing month lengths, and gives details down to total days, weeks, and hours lived.',
    relatedToolSlugs: ['percentage-calculator', 'timestamp-converter', 'stopwatch-timer'],
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    slug: 'percentage-calculator',
    description: 'Solve percentage calculations, percentage increase/decrease, fractions, and percentage of total.',
    categories: ['calculators', 'student-tools'],
    iconName: 'Percent',
    route: '/tools/percentage-calculator',
    keywords: ['percentage', 'percent', 'discount', 'ratio', 'fraction', 'growth rate', 'math'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Choose the formula mode: What is X% of Y, X is what % of Y, or percentage increase/decrease.',
      'Enter the values into the respective numerical input fields.',
      'The computed result is updated automatically in real time.',
      'Click "Copy Result" or "Reset" to start over.',
    ],
    about:
      'A versatile percentage calculator designed for students, shoppers, accountants, and engineers. It simplifies finding portions, computing sales tax or markup, measuring relative differences, and analyzing growth rates.',
    relatedToolSlugs: ['discount-calculator', 'profit-margin-calculator', 'grade-calculator'],
  },
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    slug: 'gpa-calculator',
    description: 'Compute your Grade Point Average (GPA) across courses with custom credits, letter grades, or percentage scales.',
    categories: ['calculators', 'student-tools'],
    iconName: 'GraduationCap',
    route: '/tools/gpa-calculator',
    keywords: ['gpa', 'grades', 'college', 'semester', 'grade point', 'transcript', 'credits'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Add your courses, credit hours (weight), and received letter grades (A+, A, B, etc.).',
      'Click "+ Add Course" to include as many classes as needed for your term.',
      'View your calculated GPA dynamically on the standard 4.0 scale with weighted honours.',
      'Reset or copy your semester grade summary with one click.',
    ],
    about:
      'Designed for high school and university students, the GPA Calculator supports weighted credit calculations based on standard collegiate 4.0 grading systems.',
    relatedToolSlugs: ['cgpa-calculator', 'grade-calculator', 'attendance-calculator'],
  },
  {
    id: 'cgpa-calculator',
    name: 'CGPA Calculator',
    slug: 'cgpa-calculator',
    description: 'Calculate Cumulative Grade Point Average across multiple semesters or terms with total credit weighting.',
    categories: ['calculators', 'student-tools'],
    iconName: 'Award',
    route: '/tools/cgpa-calculator',
    keywords: ['cgpa', 'cumulative gpa', 'degree', 'semester credits', 'academic performance'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Enter the GPA and total credit hours achieved for each semester.',
      'Add more semesters using the "+ Add Semester" control.',
      'View the aggregate Cumulative GPA alongside total earned credits.',
      'Export or copy your cumulative grade breakdown.',
    ],
    about:
      'The CGPA Calculator accurately weights GPA across multiple academic years and semesters to produce a recognized cumulative academic benchmark for job applications and graduate admissions.',
    relatedToolSlugs: ['gpa-calculator', 'grade-calculator', 'percentage-calculator'],
  },
  {
    id: 'loan-calculator',
    name: 'EMI / Loan Calculator',
    slug: 'loan-calculator',
    description: 'Calculate monthly loan EMI payments, total interest payable, and full amortization schedules for mortgages or loans.',
    categories: ['calculators'],
    iconName: 'BadgeDollarSign',
    route: '/tools/loan-calculator',
    keywords: ['emi', 'loan', 'mortgage', 'interest', 'monthly installment', 'car loan', 'amortization'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Input the principal loan amount, annual interest rate, and loan tenure (in months or years).',
      'The monthly EMI, total interest, and gross payback amount will be determined instantly.',
      'Review the visual breakdown between principal and interest shares.',
      'Expand the Amortization Schedule to inspect yearly or monthly payments and export as CSV.',
    ],
    about:
      'The EMI Calculator uses standard reducing balance amortization equations to determine equal monthly installments for personal loans, home mortgages, and auto financing.',
    relatedToolSlugs: ['profit-margin-calculator', 'discount-calculator', 'currency-converter'],
  },
  {
    id: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    slug: 'profit-margin-calculator',
    description: 'Determine gross profit, profit margin percentage, and markup based on cost and selling price.',
    categories: ['calculators'],
    iconName: 'TrendingUp',
    route: '/tools/profit-margin-calculator',
    keywords: ['profit', 'margin', 'markup', 'revenue', 'cost price', 'business', 'ecommerce'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Choose between calculating Profit & Margin from cost and selling price, or calculating target Selling Price from desired margin.',
      'Enter your item cost price and final selling price (or desired profit margin).',
      'The tool computes the gross profit amount, net margin percentage, and markup ratio.',
      'Review the educational breakdown explaining the difference between Margin and Markup.',
    ],
    about:
      'Essential for merchants, business owners, and freelance estimators, this tool clarifies the difference between profit margin (profit / revenue) and markup (profit / cost).',
    relatedToolSlugs: ['discount-calculator', 'percentage-calculator', 'loan-calculator'],
  },
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    slug: 'discount-calculator',
    description: 'Calculate final prices after discounts, promotional percentage cuts, and sales tax.',
    categories: ['calculators'],
    iconName: 'Tag',
    route: '/tools/discount-calculator',
    keywords: ['discount', 'sale', 'clearance', 'coupon', 'savings', 'tax', 'shopping'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Select between finding final discounted price, calculating discount percentage from sale price, or calculating stacked double discounts.',
      'Enter the original retail price and the discount percentage (or flat deduction).',
      'Optionally include sales tax percentage.',
      'Inspect the final purchase price and the total money saved.',
    ],
    about:
      'Avoid shopping surprises by quickly figuring out the exact out-of-pocket cost of on-sale items before heading to the checkout counter.',
    relatedToolSlugs: ['percentage-calculator', 'profit-margin-calculator', 'currency-converter'],
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    slug: 'currency-converter',
    description: 'Convert between world currencies using updated international foreign exchange benchmarks.',
    categories: ['calculators'],
    iconName: 'Coins',
    route: '/tools/currency-converter',
    keywords: ['currency', 'forex', 'exchange rate', 'usd', 'eur', 'gbp', 'inr', 'jpy', 'money'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Choose your source currency and destination currency from the currency selectors or quick popular buttons.',
      'Input the amount you wish to convert.',
      'The conversion rate and target balance update instantaneously with live or reference rates.',
      'Review the quick conversion table for common amounts.',
    ],
    about:
      'Provides quick conversions across major global currencies (USD, EUR, GBP, JPY, CAD, AUD, INR, and more) for travelers, remote workers, and cross-border shoppers.',
    relatedToolSlugs: ['loan-calculator', 'discount-calculator', 'percentage-calculator'],
  },

  // Text Tools
  {
    id: 'word-counter',
    name: 'Word Counter',
    slug: 'word-counter',
    description: 'Count words, characters, sentences, paragraphs, reading time, and speaking time in real time.',
    categories: ['text-tools'],
    iconName: 'FileText',
    route: '/tools/word-counter',
    keywords: ['word count', 'character count', 'reading time', 'sentences', 'paragraphs', 'essay length', 'twitter limit'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Type or paste your text into the main content editor.',
      'Observe real-time metric cards updating words, characters (with and without spaces), sentences, and paragraphs.',
      'Check estimated reading and speaking duration at standard speeds.',
      'Use quick actions to copy, clear, or uppercase/lowercase the content.',
    ],
    about:
      'A responsive word counter built for writers, students, journalists, and SEO professionals who need to maintain strict length guidelines for articles, tweets, or academic submissions.',
    relatedToolSlugs: ['character-counter', 'case-converter', 'remove-extra-spaces'],
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    slug: 'character-counter',
    description: 'Detailed character frequency breakdown, space counting, letter counts, and social media limit trackers.',
    categories: ['text-tools'],
    iconName: 'Hash',
    route: '/tools/character-counter',
    keywords: ['characters', 'letters', 'length', 'social media', 'meta description limit', 'sms'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Input your draft into the text area.',
      'Inspect character limits for X/Twitter (280), Meta descriptions (160), and SMS (160).',
      'Review total characters, alphanumeric counts, and whitespace counts.',
    ],
    about:
      'The Character Counter provides instant feedback on whether your snippet complies with platform constraints, including search engine title/meta snippet bounds and messaging thresholds.',
    relatedToolSlugs: ['word-counter', 'case-converter', 'remove-extra-spaces'],
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    slug: 'case-converter',
    description: 'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case.',
    categories: ['text-tools'],
    iconName: 'Type',
    route: '/tools/case-converter',
    keywords: ['case', 'uppercase', 'lowercase', 'title case', 'camelcase', 'kebab-case', 'snake_case'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Paste your raw text into the input box.',
      'Click any case conversion pill (e.g., "Title Case", "camelCase", "UPPERCASE").',
      'The transformed text is updated in place or in the output box ready for one-click copying.',
    ],
    about:
      'Saves hours of manual retyping by converting inconsistent capitalization into standardized formats required for programming variables, headlines, or document titles.',
    relatedToolSlugs: ['word-counter', 'remove-extra-spaces', 'text-reverser'],
  },
  {
    id: 'remove-extra-spaces',
    name: 'Remove Extra Spaces',
    slug: 'remove-extra-spaces',
    description: 'Strip redundant spaces, repeated tabs, blank lines, and trailing whitespace from any text block.',
    categories: ['text-tools'],
    iconName: 'Minimize2',
    route: '/tools/remove-extra-spaces',
    keywords: ['spaces', 'whitespace', 'trim', 'clean text', 'double spaces', 'line breaks'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Paste messy text containing repeated spaces or tabs into the editor.',
      'Select cleaning options: Collapse multiple spaces to single, trim line ends, or remove empty lines.',
      'Review real-time character reduction and copy the sanitized result.',
    ],
    about:
      'Cleans up text copied from PDFs, OCR scanners, or messy word processors so that content conforms to proper typography standards.',
    relatedToolSlugs: ['case-converter', 'duplicate-line-remover', 'word-counter'],
  },
  {
    id: 'text-sorter',
    name: 'Text Sorter',
    slug: 'text-sorter',
    description: 'Sort lists and text lines alphabetically (A-Z or Z-A), numerically, or by line length.',
    categories: ['text-tools'],
    iconName: 'ArrowUpDown',
    route: '/tools/text-sorter',
    keywords: ['sort', 'alphabetize', 'order', 'numeric sort', 'reverse sort', 'lines'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Paste your list with each item on a separate line.',
      'Select your sorting criteria: Alphabetical (A-Z), Reverse (Z-A), Numeric, Length, or Random shuffle.',
      'Copy the organized output with one click.',
    ],
    about:
      'Organizes unorganized rosters, email lists, keywords, and code imports into clean, sorted order in seconds.',
    relatedToolSlugs: ['duplicate-line-remover', 'text-reverser', 'word-counter'],
  },
  {
    id: 'duplicate-line-remover',
    name: 'Duplicate Line Remover',
    slug: 'duplicate-line-remover',
    description: 'Deduplicate text lists, remove repeated lines, and extract unique records effortlessly.',
    categories: ['text-tools'],
    iconName: 'CopyX',
    route: '/tools/duplicate-line-remover',
    keywords: ['duplicates', 'deduplicate', 'unique lines', 'remove repeat', 'list cleaner'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Enter your multiline list containing duplicate entries.',
      'Toggle case sensitivity, whitespace trimming, or empty lines as desired.',
      'Copy the deduplicated list containing only unique items in preserved order.',
    ],
    about:
      'Indispensable for data cleaning, reconciling email subscriber lists, compiling keyword buckets, and managing distinct inventory sets.',
    relatedToolSlugs: ['text-sorter', 'remove-extra-spaces', 'word-counter'],
  },
  {
    id: 'text-reverser',
    name: 'Text Reverser',
    slug: 'text-reverser',
    description: 'Reverse entire text strings, reverse word orders, flip line sequencing, or invert upside down.',
    categories: ['text-tools'],
    iconName: 'Repeat',
    route: '/tools/text-reverser',
    keywords: ['reverse text', 'backwards', 'flip text', 'mirror', 'reverse words'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Type or paste your message.',
      'Choose the reversal mode: Character reverse, Word order reverse, Line reverse, or Word in-place reverse.',
      'Copy the resulting reversed text.',
    ],
    about:
      'Create backwards messages, test palindromes, or reverse ordered data sequences safely with full Unicode and emoji preservation.',
    relatedToolSlugs: ['case-converter', 'text-sorter', 'word-counter'],
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    slug: 'password-generator',
    description: 'Generate cryptographically strong, uncrackable passwords with customizable symbols, numbers, and entropy meters.',
    categories: ['text-tools', 'daily-tools'],
    iconName: 'ShieldCheck',
    route: '/tools/password-generator',
    keywords: ['password', 'generator', 'security', 'strong password', 'passphrase', 'random string', 'cipher'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Adjust the password length slider (recommended: 16+ characters).',
      'Toggle character sets: Uppercase, Lowercase, Numbers, and Symbols.',
      'Click "Generate Password" to produce a cryptographically secure token.',
      'Review the strength meter and copy it securely with one click.',
    ],
    about:
      'Uses the browser’s native Web Crypto API (`crypto.getRandomValues`) to produce high-entropy randomized strings that safeguard your online accounts against dictionary and brute-force attacks.',
    relatedToolSlugs: ['uuid-generator', 'hash-generator', 'qr-code-generator'],
  },

  // Image Tools
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    slug: 'image-compressor',
    description: 'Compress PNG, JPEG, and WebP images directly in your browser without sacrificing visual quality or privacy.',
    categories: ['image-tools'],
    iconName: 'FileArchive',
    route: '/tools/image-compressor',
    keywords: ['compress image', 'reduce file size', 'optimize image', 'jpeg compress', 'png compress', 'web optimization'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Drag and drop an image file or click to browse from your device.',
      'Choose your target quality level or maximum file size constraint.',
      'Click "Compress Image" to process the file in your browser memory.',
      'Preview the before/after comparison and download the compressed file.',
    ],
    about:
      'All image compression executes 100% locally via the browser HTML5 Canvas API. Your pictures are never uploaded to any external server, guaranteeing strict privacy and rapid processing.',
    relatedToolSlugs: ['image-resizer', 'image-format-converter', 'image-to-base64'],
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    slug: 'image-resizer',
    description: 'Resize image dimensions by pixels or percentage while maintaining or unlocking aspect ratios.',
    categories: ['image-tools'],
    iconName: 'Maximize',
    route: '/tools/image-resizer',
    keywords: ['resize image', 'image dimensions', 'scale photo', 'aspect ratio', 'width height', 'photo size'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Upload the image you want to resize.',
      'Specify target width and height in pixels, or scale by percentage.',
      'Keep "Lock Aspect Ratio" checked to preserve proportions without distortion.',
      'Apply resizing and download your scaled image.',
    ],
    about:
      'Quickly tailor photos and banner graphics to the exact dimensions needed for social media covers, website thumbnails, and email campaigns.',
    relatedToolSlugs: ['image-compressor', 'image-cropper', 'image-format-converter'],
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    slug: 'image-cropper',
    description: 'Crop images with preset aspect ratios (1:1, 16:9, 4:3) or freeform bounding boxes.',
    categories: ['image-tools'],
    iconName: 'Crop',
    route: '/tools/image-cropper',
    keywords: ['crop image', 'cut picture', 'avatar crop', 'square crop', 'aspect ratio crop'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Upload your image.',
      'Drag the bounding handles to select your desired crop region or pick a preset aspect ratio.',
      'Click "Crop" to render the clipped frame.',
      'Download your cropped image directly.',
    ],
    about:
      'Effortlessly frame portraits, prepare avatars, or eliminate unwanted edges from screenshots without needing bloated desktop photo editors.',
    relatedToolSlugs: ['image-resizer', 'image-compressor', 'color-picker'],
  },
  {
    id: 'image-format-converter',
    name: 'Image Format Converter',
    slug: 'image-format-converter',
    description: 'Convert images seamlessly between PNG, JPEG, WebP, SVG, and BMP formats in-browser.',
    categories: ['image-tools'],
    iconName: 'RefreshCw',
    route: '/tools/image-format-converter',
    keywords: ['convert image', 'png to jpg', 'jpg to webp', 'webp converter', 'image format'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Upload one or more source image files.',
      'Select the target output format (e.g. WebP for modern web performance, PNG for transparency).',
      'Click "Convert" and download the converted asset immediately.',
    ],
    about:
      'Converts modern WebP files back to standard PNG/JPEG for legacy apps, or converts heavy photos to lightweight WebP for lightning-fast page loading.',
    relatedToolSlugs: ['image-to-base64', 'image-compressor', 'image-resizer'],
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    slug: 'image-to-base64',
    description: 'Convert images into Base64 data URI strings for inlining directly into HTML, CSS, or JSON payloads.',
    categories: ['image-tools', 'developer-tools'],
    iconName: 'Binary',
    route: '/tools/image-to-base64',
    keywords: ['base64 image', 'data uri', 'inline image', 'img src base64', 'css background base64'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Select or drop any image file.',
      'The tool automatically encodes the binary into a `data:image/...;base64,...` string.',
      'Copy the raw Base64 string, CSS snippet, or HTML `<img>` tag with one click.',
    ],
    about:
      'Embed icons and small graphic elements directly into code files to eliminate HTTP request overhead and streamline offline asset delivery.',
    relatedToolSlugs: ['base64-encoder-decoder', 'color-picker', 'image-format-converter'],
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    slug: 'color-picker',
    description: 'Sample colors, generate harmonious color palettes, and copy HEX, RGB, HSL, and CMYK codes.',
    categories: ['image-tools', 'developer-tools'],
    iconName: 'Pipette',
    route: '/tools/color-picker',
    keywords: ['color picker', 'hex code', 'rgb', 'hsl', 'eyedropper', 'palette', 'css color'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Click the color swatch to open the visual hue/saturation canvas, or type any HEX/RGB/HSL string.',
      'Use the built-in browser Eyedropper API to sample any pixel from your display.',
      'View automatic color shades, tints, and contrast ratio scores against white and dark backgrounds.',
      'Copy HEX, RGB, or HSL values with one click.',
    ],
    about:
      'A must-have for web designers and front-end developers inspecting colors, verifying accessibility contrast ratios, and picking complementary color schemes.',
    relatedToolSlugs: ['image-to-base64', 'json-formatter', 'uuid-generator'],
  },
  {
    id: 'image-metadata-viewer',
    name: 'Image Metadata Viewer',
    slug: 'image-metadata-viewer',
    description: 'Inspect EXIF metadata, camera settings, shutter speed, ISO, GPS coordinates, and file dimensions.',
    categories: ['image-tools'],
    iconName: 'Info',
    route: '/tools/image-metadata-viewer',
    keywords: ['exif', 'metadata', 'camera info', 'iso', 'focal length', 'gps tags', 'photo details'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Upload a photograph from a digital camera or smartphone.',
      'The tool parses EXIF tags embedded inside the file header.',
      'Review aperture, shutter time, camera model, date taken, and geolocation data.',
    ],
    about:
      'Inspect metadata to learn photo shooting techniques, verify authentic creation timestamps, or review privacy-sensitive GPS coordinates before publishing images.',
    relatedToolSlugs: ['image-compressor', 'image-resizer', 'color-picker'],
  },

  // Developer Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    slug: 'json-formatter',
    description: 'Beautify, format, indent, validate, and minify messy JSON payloads with syntax error highlighting.',
    categories: ['developer-tools'],
    iconName: 'Code2',
    route: '/tools/json-formatter',
    keywords: ['json', 'formatter', 'beautifier', 'minify json', 'json parser', 'indent json', 'pretty print'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Paste your raw, minified, or disorganized JSON into the code input editor.',
      'Click "Format JSON" (with your preferred 2 or 4 space indentation) or "Minify JSON".',
      'The tool validates the structure and highlights any syntax discrepancies or trailing commas.',
      'Copy the polished JSON output or download it as a .json file.',
    ],
    about:
      'Fast, reliable, client-side JSON formatting for backend engineers, API testers, and frontend developers. Handles deeply nested structures and large payloads cleanly without leaking data.',
    relatedToolSlugs: ['json-validator', 'base64-encoder-decoder', 'url-encoder-decoder'],
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    slug: 'json-validator',
    description: 'Check if your JSON data is valid and pinpoint exact parse error line and column numbers.',
    categories: ['developer-tools'],
    iconName: 'CheckCircle2',
    route: '/tools/json-validator',
    keywords: ['json validator', 'lint json', 'json syntax error', 'validate json', 'json schema'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Paste the JSON content you want to inspect.',
      'Click "Validate JSON".',
      'Receive instant status: Valid (green) or an explicit breakdown of the invalid character position, line number, and error explanation.',
    ],
    about:
      'Quickly troubleshoot malfunctioning API responses and corrupted configuration files by catching unmatched brackets, illegal quotes, and rogue trailing commas.',
    relatedToolSlugs: ['json-formatter', 'base64-encoder-decoder', 'regex-tester'],
  },
  {
    id: 'base64-encoder-decoder',
    name: 'Base64 Encoder / Decoder',
    slug: 'base64-encoder-decoder',
    description: 'Encode plain text or UTF-8 strings into Base64 format or decode Base64 strings back to readable text.',
    categories: ['developer-tools'],
    iconName: 'Binary',
    route: '/tools/base64-encoder-decoder',
    keywords: ['base64', 'encode', 'decode', 'atob', 'btoa', 'binary to text', 'utf-8 base64'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Choose "Encode" or "Decode" mode.',
      'Enter your string into the input pane.',
      'The converted Base64 or plain text string appears immediately in real time.',
      'Copy the result with one click.',
    ],
    about:
      'Safely transmit arbitrary characters, passwords, authorization tokens, or binary representations across text-based protocols like email and HTTP headers.',
    relatedToolSlugs: ['url-encoder-decoder', 'hash-generator', 'image-to-base64'],
  },
  {
    id: 'url-encoder-decoder',
    name: 'URL Encoder / Decoder',
    slug: 'url-encoder-decoder',
    description: 'Encode special characters for safe query strings (percent-encoding) or decode percent-encoded URLs.',
    categories: ['developer-tools'],
    iconName: 'Link',
    route: '/tools/url-encoder-decoder',
    keywords: ['url encode', 'url decode', 'percent encoding', 'uri component', 'query string', 'slug'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Paste your raw URL or encoded query string.',
      'Click "Encode" to replace spaces and illegal characters with `%20`, `%26`, etc., or "Decode" to restore human-readable text.',
      'Copy the formatted URI with the copy button.',
    ],
    about:
      'Essential for building REST query strings, OAuth redirection endpoints, and debugging tracking URLs without breaking HTTP query parsing.',
    relatedToolSlugs: ['base64-encoder-decoder', 'json-formatter', 'uuid-generator'],
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    slug: 'uuid-generator',
    description: 'Generate bulk cryptographically secure Version 4 (v4) Universally Unique Identifiers (UUIDs / GUIDs).',
    categories: ['developer-tools'],
    iconName: 'Fingerprint',
    route: '/tools/uuid-generator',
    keywords: ['uuid', 'guid', 'v4', 'random id', 'unique identifier', 'bulk uuid', 'crypto uuid'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Select how many UUIDs you need (1 to 100).',
      'Toggle uppercase/lowercase or hyphen inclusion preferences.',
      'Click "Generate UUIDs" to output unique v4 identifiers.',
      'Copy individual UUIDs or the entire batch at once.',
    ],
    about:
      'UUID v4 tokens are 128-bit random identifiers with a collision probability so astronomically negligible that they can safely be generated decentralized without a central authority.',
    relatedToolSlugs: ['hash-generator', 'password-generator', 'timestamp-converter'],
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    slug: 'timestamp-converter',
    description: 'Convert Unix epoch timestamps (seconds and milliseconds) to human-readable dates and UTC / local ISO strings.',
    categories: ['developer-tools'],
    iconName: 'Clock',
    route: '/tools/timestamp-converter',
    keywords: ['timestamp', 'unix epoch', 'epoch converter', 'utc time', 'iso date', 'milliseconds', 'seconds'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Enter an epoch timestamp (in seconds or milliseconds) or click "Use Current Time".',
      'Alternatively, select a calendar date and time to convert it into its numeric epoch equivalent.',
      'Review conversions in your local time zone, UTC, ISO 8601, and RFC 2822 formats.',
    ],
    about:
      'Translates the integer count of seconds elapsed since January 1, 1970 (UTC) into understandable timestamps for software debugging and database queries.',
    relatedToolSlugs: ['age-calculator', 'uuid-generator', 'stopwatch-timer'],
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    slug: 'hash-generator',
    description: 'Generate cryptographic message digests in MD5, SHA-1, SHA-256, and SHA-512 in your browser.',
    categories: ['developer-tools'],
    iconName: 'ShieldAlert',
    route: '/tools/hash-generator',
    keywords: ['hash', 'sha256', 'sha512', 'sha1', 'md5', 'checksum', 'digest', 'cryptography'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Type or paste any text or string to hash.',
      'The tool computes SHA-256, SHA-512, and SHA-1 checksum digests instantly using standard SubtleCrypto.',
      'Copy the hexadecimal digest for verifying file integrity or generating cache keys.',
    ],
    about:
      'Cryptographic hash functions generate fixed-size string footprints from arbitrary input data, guaranteeing that even a single character change alters the resulting checksum entirely.',
    relatedToolSlugs: ['uuid-generator', 'base64-encoder-decoder', 'password-generator'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    slug: 'regex-tester',
    description: 'Test regular expressions in real-time with pattern highlighting, capture groups, and flag toggles.',
    categories: ['developer-tools'],
    iconName: 'Sliders',
    route: '/tools/regex-tester',
    keywords: ['regex', 'regular expression', 'pattern match', 'regex test', 'regex flags', 'capturing group'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Enter your regex pattern and select regex flags (e.g. `g` global, `i` case-insensitive, `m` multiline).',
      'Provide your sample test string in the test area.',
      'Matched text fragments and capture group matches are highlighted dynamically with hit counts.',
    ],
    about:
      'Refine complex parsing patterns before embedding them into your production codebase with instant visual match confirmation.',
    relatedToolSlugs: ['json-validator', 'word-counter', 'case-converter'],
  },

  // Student Tools
  {
    id: 'study-timer',
    name: 'Study Timer',
    slug: 'study-timer',
    description: 'Pomodoro-style study session timer with custom work intervals, short breaks, long breaks, and audio alerts.',
    categories: ['student-tools', 'daily-tools'],
    iconName: 'Hourglass',
    route: '/tools/study-timer',
    keywords: ['study timer', 'pomodoro', 'focus timer', 'productivity', 'study sessions', 'countdown', 'focus intervals', 'exam prep'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Select your session mode: Pomodoro (25m), Short Break (5m), Long Break (15m), or Custom duration.',
      'Press "Start Focus" to begin the countdown timer.',
      'Pause, reset, or skip sessions whenever needed, and configure custom intervals via the Settings dialog.',
      'Enjoy synthesized bell audio alerts and optional browser notifications when your study intervals end.',
    ],
    about:
      'Based on the scientifically validated Pomodoro Technique to maintain peak mental focus and avoid study burnout through spaced intervals. Uses timestamp-based time tracking for precision across background browser tabs.',
    relatedToolSlugs: ['stopwatch-timer', 'gpa-calculator', 'attendance-calculator', 'grade-calculator'],
  },
  {
    id: 'attendance-calculator',
    name: 'Attendance Calculator',
    slug: 'attendance-calculator',
    description: 'Calculate your current attendance percentage and determine how many classes you can skip or must attend to meet criteria.',
    categories: ['student-tools'],
    iconName: 'UserCheck',
    route: '/tools/attendance-calculator',
    keywords: ['attendance', 'bunk calculator', 'class attendance', 'minimum attendance', '75 percent rule', 'attendance planner', 'college attendance'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Enter total classes held so far and the number of classes you attended.',
      'Specify your institution’s required attendance threshold (e.g. 75% or 80%).',
      'The calculator advises whether your attendance is secure, how many upcoming classes you may safely skip, or how many you must attend consecutively.',
      'Switch to the Multi-Course Semester Tracker to manage all your courses with real-time +1 present/absent buttons.',
    ],
    about:
      'Eliminates college attendance anxiety by clearly calculating how many lectures are required to stay eligible for exams, complete with buffer projections and semester-wide course tracking.',
    relatedToolSlugs: ['gpa-calculator', 'percentage-calculator', 'grade-calculator', 'study-timer'],
  },
  {
    id: 'grade-calculator',
    name: 'Grade Calculator',
    slug: 'grade-calculator',
    description: 'Calculate weighted term grades and determine the score required on your final exam to achieve your target grade.',
    categories: ['student-tools'],
    iconName: 'BookOpen',
    route: '/tools/grade-calculator',
    keywords: ['grade calculator', 'final exam score needed', 'weighted grade', 'course grade', 'syllabus weighting', 'target grade', 'marks calculator'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Choose between Weighted Syllabus Mode (with % weights) or Simple Points Mode.',
      'Add coursework items (homework, midterm, projects) with their earned grades and syllabus weights.',
      'Enter your target final grade (e.g., 85% for an A) to calculate the score required on remaining assessments.',
      'Inspect the collegiate letter grade breakdown and copy your academic summary with one click.',
    ],
    about:
      'Strategic grade planning so you know exactly where to allocate your study hours before finals week, supporting both weighted syllabus distributions and standard point totals.',
    relatedToolSlugs: ['gpa-calculator', 'cgpa-calculator', 'percentage-calculator', 'attendance-calculator'],
  },

  // Daily Utilities
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    slug: 'qr-code-generator',
    description: 'Create custom, scannable QR codes for URLs, plain text, Wi-Fi credentials, and contact info with instant PNG download.',
    categories: ['daily-tools'],
    iconName: 'QrCode',
    route: '/tools/qr-code-generator',
    keywords: ['qr code', 'barcode', 'scan', 'wifi qr', 'url qr', 'download qr code', 'quick response'],
    isPopular: true,
    status: 'ready',
    howToUse: [
      'Enter your destination URL, text, or Wi-Fi configuration.',
      'Select QR error correction level and color customization if desired.',
      'The QR code generates in real time on a crisp canvas.',
      'Click "Download QR Code" to save the high-resolution PNG image.',
    ],
    about:
      'Quickly create smartphone-scannable QR codes for menus, event posters, marketing collateral, and Wi-Fi network sharing without expiration or watermarks.',
    relatedToolSlugs: ['barcode-generator', 'url-encoder-decoder', 'password-generator'],
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    slug: 'barcode-generator',
    description: 'Generate standard retail, logistics, and inventory barcodes including Code 128, EAN-13, EAN-8, UPC-A, Code 39, and ITF-14 formats.',
    categories: ['daily-tools'],
    iconName: 'ScanLine',
    route: '/tools/barcode-generator',
    keywords: ['barcode', 'code 128', 'ean 13', 'ean 8', 'upc', 'code 39', 'itf 14', 'inventory barcode', 'product tag', 'vector barcode'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Select the barcode symbology standard (Code 128, EAN-13, EAN-8, UPC, Code 39, or ITF-14).',
      'Type your alphanumeric or numeric identification code; automatic checksum validation ensures standard conformance.',
      'Adjust line width, height, quiet margin, text visibility, and custom colors.',
      'Download high-resolution vector SVG or raster PNG labels ready for optical laser and camera scanning.',
    ],
    about:
      'Create standard retail, warehouse, and shipping inventory labels compatible with all commercial handheld laser scanners and mobile camera apps.',
    relatedToolSlugs: ['qr-code-generator', 'uuid-generator', 'random-number-generator'],
  },
  {
    id: 'random-number-generator',
    name: 'Random Number Generator',
    slug: 'random-number-generator',
    description: 'Pick truly random numbers, roll virtual dice, or draw random lottery numbers within any min/max bounds.',
    categories: ['daily-tools'],
    iconName: 'Dices',
    route: '/tools/random-number-generator',
    keywords: ['random number', 'rng', 'dice roll', 'lottery', 'random integer', 'picker', 'crypto random'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Set the minimum and maximum range (e.g. 1 to 100).',
      'Choose how many numbers to generate and toggle whether duplicates are allowed.',
      'Select integer mode or floating-point decimals with precision control.',
      'Click "Generate Random Numbers" to view numbers, stats, and copy results in multiple formats.',
    ],
    about:
      'Uses cryptographic browser hardware randomization (crypto.getRandomValues) for unbiased giveaways, classroom drawings, dice rolls, and scientific simulations.',
    relatedToolSlugs: ['password-generator', 'uuid-generator', 'stopwatch-timer'],
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    slug: 'unit-converter',
    description: 'Convert between metric and imperial units for length, mass/weight, temperature, area, volume, time, and speed.',
    categories: ['daily-tools'],
    iconName: 'Scale',
    route: '/tools/unit-converter',
    keywords: ['unit converter', 'metric to imperial', 'kg to lbs', 'celsius to fahrenheit', 'km to miles', 'units', 'conversion formula'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Select the physical category (Length, Weight / Mass, Temperature, Area, Volume, Time, or Speed).',
      'Select your source unit and destination unit.',
      'Enter the numerical quantity to see instantaneous conversion with formula and step-by-step breakdown.',
      'Inspect the full category equivalent matrix table to view values across all units at once.',
    ],
    about:
      'A comprehensive, high-precision unit converter designed for science students, engineers, travelers, and chefs translating between metric and imperial measurement standards.',
    relatedToolSlugs: ['percentage-calculator', 'currency-converter', 'timestamp-converter'],
  },
  {
    id: 'stopwatch-timer',
    name: 'Stopwatch & Timer',
    slug: 'stopwatch-timer',
    description: 'Precision digital stopwatch with lap tracking alongside a countdown timer with audio chime notifications.',
    categories: ['daily-tools'],
    iconName: 'Timer',
    route: '/tools/stopwatch-timer',
    keywords: ['stopwatch', 'timer', 'lap timer', 'countdown', 'chronometer', 'seconds', 'focus timer'],
    isPopular: false,
    status: 'ready',
    howToUse: [
      'Switch between Stopwatch and Countdown Timer modes.',
      'In Stopwatch mode: Click Start, record intermediate Lap times, inspect fastest/slowest lap badges, and copy lap splits.',
      'In Timer mode: Select quick presets or enter hours, minutes, and seconds, then start the countdown alert.',
      'Enjoy synthesized chime audio alerts and background browser notifications when your timer finishes.',
    ],
    about:
      'Millisecond-accurate time tracking using monotonic timestamps that prevent time drift even when background browser tabs are throttled.',
    relatedToolSlugs: ['study-timer', 'age-calculator', 'timestamp-converter'],
  },
];

export const getToolBySlug = (slug: string): Tool | undefined => {
  if (!slug) return undefined;
  const cleanSlug = slug.split('?')[0].split('#')[0].replace(/\/$/, '').toLowerCase();

  // Aliases for common alternative URLs
  if (cleanSlug === 'emi-loan-calculator' || cleanSlug === 'emi-calculator' || cleanSlug === 'loan') {
    return TOOLS.find((tool) => tool.slug === 'loan-calculator');
  }
  if (cleanSlug === 'pomodoro' || cleanSlug === 'pomodoro-timer') {
    return TOOLS.find((tool) => tool.slug === 'study-timer');
  }
  if (cleanSlug === 'qr-code' || cleanSlug === 'qr-generator') {
    return TOOLS.find((tool) => tool.slug === 'qr-code-generator');
  }
  if (cleanSlug === 'image-compression' || cleanSlug === 'compress-image') {
    return TOOLS.find((tool) => tool.slug === 'image-compressor');
  }
  if (cleanSlug === 'word-count') {
    return TOOLS.find((tool) => tool.slug === 'word-counter');
  }
  if (cleanSlug === 'gpa') {
    return TOOLS.find((tool) => tool.slug === 'gpa-calculator');
  }
  if (cleanSlug === 'cgpa') {
    return TOOLS.find((tool) => tool.slug === 'cgpa-calculator');
  }
  if (cleanSlug === 'age') {
    return TOOLS.find((tool) => tool.slug === 'age-calculator');
  }

  return TOOLS.find((tool) => tool.slug.toLowerCase() === cleanSlug || tool.id.toLowerCase() === cleanSlug);
};

export const getToolsByCategory = (categoryId: string): Tool[] => {
  return TOOLS.filter((tool) => tool.categories.includes(categoryId as any));
};

export const getPopularTools = (): Tool[] => {
  return TOOLS.filter((tool) => tool.isPopular);
};

export const searchTools = (query: string): Tool[] => {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q)) ||
      tool.categories.some((c) => c.toLowerCase().includes(q))
    );
  });
};

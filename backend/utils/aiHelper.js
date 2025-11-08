const natural = require("natural");
const compromise = require("compromise");

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Common tech keywords for auto-tagging
const TECH_KEYWORDS = {
  javascript: [
    "javascript",
    "js",
    "node",
    "nodejs",
    "react",
    "vue",
    "angular",
    "typescript",
  ],
  python: ["python", "django", "flask", "pandas", "numpy", "tensorflow"],
  java: ["java", "spring", "hibernate", "maven", "gradle"],
  web: [
    "html",
    "css",
    "frontend",
    "backend",
    "fullstack",
    "api",
    "rest",
    "graphql",
  ],
  database: [
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "database",
    "query",
    "nosql",
  ],
  mobile: ["android", "ios", "react native", "flutter", "mobile", "app"],
  devops: [
    "docker",
    "kubernetes",
    "ci/cd",
    "aws",
    "azure",
    "cloud",
    "deployment",
  ],
  ai: [
    "machine learning",
    "ai",
    "artificial intelligence",
    "neural network",
    "deep learning",
  ],
  general: ["bug", "error", "help", "question", "tutorial", "guide", "how to"],
};

/**
 * Extract tags from text using NLP
 * @param {string} text - Text to analyze
 * @param {number} maxTags - Maximum number of tags to return
 * @returns {Array} - Array of suggested tags
 */
exports.extractTags = (text, maxTags = 5) => {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const suggestedTags = new Set();

  // Find matching keywords
  Object.entries(TECH_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        suggestedTags.add(category);
      }
    });
  });

  // Use compromise for entity extraction
  const doc = compromise(text);

  // Extract topics (nouns and proper nouns)
  const topics = doc.topics().out("array");
  topics.slice(0, 3).forEach((topic) => {
    if (topic.length > 2) {
      suggestedTags.add(topic.toLowerCase());
    }
  });

  // Extract technologies
  const acronyms = doc.acronyms().out("array");
  acronyms.forEach((acronym) => {
    suggestedTags.add(acronym.toLowerCase());
  });

  // Convert Set to Array and limit
  return Array.from(suggestedTags).slice(0, maxTags);
};

/**
 * Calculate similarity between two texts using cosine similarity
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score (0-1)
 */
exports.calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const tfidf = new TfIdf();
  tfidf.addDocument(text1);
  tfidf.addDocument(text2);

  // Get term frequencies
  const terms1 = {};
  const terms2 = {};

  tfidf.listTerms(0).forEach((item) => {
    terms1[item.term] = item.tfidf;
  });

  tfidf.listTerms(1).forEach((item) => {
    terms2[item.term] = item.tfidf;
  });

  // Calculate cosine similarity
  const allTerms = new Set([...Object.keys(terms1), ...Object.keys(terms2)]);
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  allTerms.forEach((term) => {
    const val1 = terms1[term] || 0;
    const val2 = terms2[term] || 0;
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Find duplicate or similar posts
 * @param {string} title - Post title
 * @param {string} content - Post content
 * @param {Array} existingPosts - Array of existing posts
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {Array} - Array of similar posts
 */
exports.findSimilarPosts = (title, content, existingPosts, threshold = 0.7) => {
  const newText = `${title} ${content}`;
  const similarPosts = [];

  existingPosts.forEach((post) => {
    const existingText = `${post.title} ${post.content}`;
    const similarity = exports.calculateSimilarity(newText, existingText);

    if (similarity >= threshold) {
      similarPosts.push({
        post,
        similarity: Math.round(similarity * 100),
      });
    }
  });

  return similarPosts.sort((a, b) => b.similarity - a.similarity);
};

/**
 * Analyze sentiment of text (basic implementation)
 * @param {string} text - Text to analyze
 * @returns {Object} - Sentiment analysis result
 */
exports.analyzeSentiment = (text) => {
  if (!text) return { score: 0, sentiment: "neutral" };

  const analyzer = new natural.SentimentAnalyzer(
    "English",
    natural.PorterStemmer,
    "afinn"
  );
  const tokens = tokenizer.tokenize(text);
  const score = analyzer.getSentiment(tokens);

  let sentiment = "neutral";
  if (score > 0.1) sentiment = "positive";
  else if (score < -0.1) sentiment = "negative";

  return {
    score: Math.round(score * 100) / 100,
    sentiment,
    isNegative: sentiment === "negative",
    isPositive: sentiment === "positive",
  };
};

/**
 * Extract keywords from text using TF-IDF
 * @param {string} text - Text to analyze
 * @param {number} topN - Number of keywords to return
 * @returns {Array} - Array of keywords with scores
 */
exports.extractKeywords = (text, topN = 5) => {
  if (!text) return [];

  const tfidf = new TfIdf();
  tfidf.addDocument(text);

  const keywords = [];
  tfidf.listTerms(0).forEach((item) => {
    if (item.term.length > 2) {
      keywords.push({
        word: item.term,
        score: Math.round(item.tfidf * 100) / 100,
      });
    }
  });

  return keywords.slice(0, topN);
};

/**
 * Get related questions based on content similarity
 * @param {Object} post - Current post
 * @param {Array} allPosts - All posts
 * @param {number} limit - Number of related posts to return
 * @returns {Array} - Array of related posts
 */
exports.getRelatedQuestions = (post, allPosts, limit = 5) => {
  const currentText = `${post.title} ${post.content}`;
  const related = [];

  allPosts.forEach((otherPost) => {
    if (otherPost._id.toString() === post._id.toString()) return;

    const otherText = `${otherPost.title} ${otherPost.content}`;
    const similarity = exports.calculateSimilarity(currentText, otherText);

    if (similarity > 0.3) {
      related.push({
        ...otherPost.toObject(),
        similarity: Math.round(similarity * 100),
      });
    }
  });

  return related.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
};

/**
 * Detect if content contains inappropriate or toxic language
 * @param {string} text - Text to analyze
 * @returns {Object} - Toxicity detection result
 */
exports.detectToxicity = (text) => {
  if (!text) return { isToxic: false, confidence: 0 };

  const toxicWords = [
    "spam",
    "scam",
    "hate",
    "abuse",
    "offensive",
    "stupid",
    "idiot",
    "dumb",
    "trash",
    "garbage",
  ];

  const lowerText = text.toLowerCase();
  let toxicCount = 0;

  toxicWords.forEach((word) => {
    if (lowerText.includes(word)) {
      toxicCount++;
    }
  });

  const confidence = Math.min(toxicCount / 3, 1);
  const isToxic = confidence > 0.3;

  return {
    isToxic,
    confidence: Math.round(confidence * 100),
    toxicWordCount: toxicCount,
  };
};

/**
 * Generate smart search ranking
 * @param {string} query - Search query
 * @param {Array} posts - Posts to rank
 * @returns {Array} - Ranked posts
 */
exports.rankSearchResults = (query, posts) => {
  if (!query || !posts.length) return posts;

  const rankedPosts = posts.map((post) => {
    const titleText = `${post.title} ${post.content}`;
    const similarity = exports.calculateSimilarity(query, titleText);

    // Boost score based on votes and replies
    const popularityBoost = post.votes * 0.1 + post.replies.length * 0.05;
    const finalScore = similarity + popularityBoost;

    return {
      ...post.toObject(),
      searchScore: Math.round(finalScore * 100),
    };
  });

  return rankedPosts.sort((a, b) => b.searchScore - a.searchScore);
};

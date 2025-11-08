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

/**
 * Summarize discussion from post and replies
 * @param {Object} post - Post with replies
 * @returns {Object} - Discussion summary
 */
exports.summarizeDiscussion = (post) => {
  if (!post || !post.replies) {
    return {
      summary: "No discussion to summarize",
      totalReplies: 0,
      keyTopics: [],
      sentiment: { overall: "neutral", positive: 0, negative: 0, neutral: 0 },
      topContributors: [],
    };
  }

  // Combine all text
  const allText = [post.content, ...post.replies.map((r) => r.content)].join(
    " "
  );

  // Extract key topics
  const keyTopics = exports.extractKeywords(allText, 8);

  // Analyze sentiment of each reply
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  post.replies.forEach((reply) => {
    const sentiment = exports.analyzeSentiment(reply.content);
    if (sentiment.isPositive) positiveCount++;
    else if (sentiment.isNegative) negativeCount++;
    else neutralCount++;
  });

  // Find top contributors
  const contributorMap = {};
  post.replies.forEach((reply) => {
    const author = reply.authorName || "Anonymous";
    contributorMap[author] = (contributorMap[author] || 0) + 1;
  });

  const topContributors = Object.entries(contributorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([author, count]) => ({ author, replies: count }));

  // Determine overall sentiment
  let overallSentiment = "neutral";
  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    overallSentiment = "positive";
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    overallSentiment = "negative";
  }

  // Extract important sentences (simple scoring)
  const sentences = allText.match(/[^.!?]+[.!?]+/g) || [];
  const importantSentences = sentences
    .map((sentence) => {
      const words = tokenizer.tokenize(sentence.toLowerCase());
      const score = words.filter((word) =>
        keyTopics.some((topic) => topic.word === word)
      ).length;
      return { sentence: sentence.trim(), score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.sentence);

  return {
    summary: importantSentences.join(" "),
    totalReplies: post.replies.length,
    keyTopics: keyTopics.slice(0, 5).map((t) => t.word),
    sentiment: {
      overall: overallSentiment,
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
    },
    topContributors,
    statistics: {
      totalWords: allText.split(" ").length,
      averageReplyLength: Math.round(
        post.replies.reduce((sum, r) => sum + r.content.length, 0) /
          post.replies.length || 0
      ),
    },
  };
};

/**
 * AI Assistant - Answer user questions
 * @param {string} question - User's question
 * @param {Object} context - Context (posts, stats, etc.)
 * @returns {Object} - AI response
 */
exports.getAIAssistantResponse = async (question, context) => {
  if (!question) {
    return {
      answer: "Hi! I'm your AI assistant. Ask me anything about the forum!",
      suggestions: [
        "What are the trending topics?",
        "Show me popular posts",
        "Find posts about React",
        "What's new today?",
      ],
    };
  }

  const lowerQuestion = question.toLowerCase();

  // Trending/Popular questions
  if (
    lowerQuestion.includes("trending") ||
    lowerQuestion.includes("popular") ||
    lowerQuestion.includes("hot") ||
    (lowerQuestion.includes("show") &&
      (lowerQuestion.includes("post") || lowerQuestion.includes("question")))
  ) {
    const topPosts = context.posts
      ? context.posts.sort((a, b) => b.votes - a.votes).slice(0, 5)
      : [];

    if (topPosts.length === 0) {
      return {
        answer: "No posts available yet. Be the first to create one!",
        suggestions: ["How to create a post?", "What can I do here?"],
      };
    }

    return {
      answer: `Here are the most popular posts right now (${topPosts.length} posts):`,
      posts: topPosts.map((p) => ({
        id: p._id,
        title: p.title,
        votes: p.votes,
        replyCount: p.replyCount || 0,
      })),
      suggestions: ["Show me recent posts", "What tags are trending?"],
    };
  }

  // Search for specific topic
  const searchTerms = [
    "react",
    "javascript",
    "python",
    "node",
    "database",
    "api",
    "css",
    "html",
  ];
  const foundTerm = searchTerms.find((term) => lowerQuestion.includes(term));

  if (
    foundTerm ||
    lowerQuestion.includes("find") ||
    lowerQuestion.includes("about")
  ) {
    const term = foundTerm || lowerQuestion.split(" ").pop();
    const matchingPosts = context.posts
      ? context.posts.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term) ||
            p.tags?.some((tag) => tag.toLowerCase().includes(term))
        )
      : [];

    if (matchingPosts.length > 0) {
      return {
        answer: `I found ${matchingPosts.length} post${
          matchingPosts.length > 1 ? "s" : ""
        } about "${term}":`,
        posts: matchingPosts.slice(0, 5).map((p) => ({
          id: p._id,
          title: p.title,
          votes: p.votes,
        })),
        suggestions: ["Show me more", "What else is trending?"],
      };
    } else {
      return {
        answer: `I couldn't find any posts about "${term}". Try asking about different topics!`,
        suggestions: [
          "What are the trending topics?",
          "Show me popular posts",
          "What's new today?",
        ],
      };
    }
  }

  // Recent/New questions
  if (
    lowerQuestion.includes("recent") ||
    lowerQuestion.includes("new") ||
    lowerQuestion.includes("latest")
  ) {
    const recentPosts = context.posts
      ? context.posts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      : [];
    return {
      answer: "Here are the most recent posts:",
      posts: recentPosts.map((p) => ({
        id: p._id,
        title: p.title,
        votes: p.votes,
      })),
      suggestions: ["Show popular posts", "What tags are trending?"],
    };
  }

  // Help/Guide questions
  if (
    lowerQuestion.includes("help") ||
    lowerQuestion.includes("how to") ||
    lowerQuestion.includes("guide")
  ) {
    return {
      answer:
        "I can help you navigate the forum! Here's what you can do:\n\n" +
        "• Ask questions and get answers from the community\n" +
        "• Upvote helpful posts\n" +
        "• Search for topics using the search bar\n" +
        "• View your profile and reputation\n" +
        "• Browse by trending tags",
      suggestions: [
        "Show me popular posts",
        "What are the trending topics?",
        "Find posts about React",
      ],
    };
  }

  // Statistics questions
  if (
    lowerQuestion.includes("how many") ||
    lowerQuestion.includes("statistics") ||
    lowerQuestion.includes("stats")
  ) {
    return {
      answer: context.stats
        ? `Forum Statistics:\n\n` +
          `• Total Posts: ${context.stats.totalPosts || 0}\n` +
          `• Total Users: ${context.stats.totalUsers || 0}\n` +
          `• Active Today: ${context.stats.activeToday || 0}\n` +
          `• Most Active Tag: ${context.stats.topTag || "N/A"}`
        : "Statistics are currently unavailable.",
      suggestions: ["Show me popular posts", "What's trending?"],
    };
  }

  // Tags questions
  if (lowerQuestion.includes("tag")) {
    const tags = context.tags || [];
    if (tags.length > 0) {
      // Get posts for trending tags
      const taggedPosts = context.posts
        ? context.posts
            .filter((p) => p.tags && p.tags.some((tag) => tags.includes(tag)))
            .slice(0, 5)
        : [];

      return {
        answer: `Here are the trending tags: ${tags.slice(0, 10).join(", ")}`,
        posts: taggedPosts.map((p) => ({
          id: p._id,
          title: p.title,
          votes: p.votes,
          tags: p.tags,
        })),
        suggestions: ["Show popular posts", "Find posts about specific topic"],
      };
    }
    return {
      answer: "No tags available yet. Be the first to create a post!",
      suggestions: ["Show me popular posts", "What's new today?"],
    };
  }

  // Default response
  return {
    answer:
      "I'm here to help! You can ask me about:\n\n" +
      "• Trending or popular posts\n" +
      "• Recent discussions\n" +
      "• Specific topics (React, Python, etc.)\n" +
      "• Forum statistics\n" +
      "• How to use the forum",
    suggestions: [
      "What are the trending topics?",
      "Show me popular posts",
      "Find posts about JavaScript",
      "What's new today?",
    ],
  };
};

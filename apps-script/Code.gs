const ADMIN_EMAIL_DOMAIN = '@girlupmoretti.com';
const DEFAULT_SPREADSHEET_ID = '1YwI11pc_umiAD5yZQVAmkEpObVNwPWBDdFDkYfkaTHY';
const SCRIPT_PROPS = PropertiesService.getScriptProperties();

const SHEETS = {
  Users: ['id', 'name', 'email', 'photoUrl', 'role', 'createdAt', 'updatedAt'],
  Modules: ['id', 'title', 'description', 'imageUrl', 'content', 'videoUrl', 'published', 'createdBy', 'createdAt', 'updatedAt'],
  QuizQuestions: ['id', 'moduleId', 'question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'createdAt', 'updatedAt'],
  UserProgress: ['id', 'userId', 'moduleId', 'score', 'completed', 'completedAt', 'updatedAt'],
  BlogPosts: ['id', 'title', 'content', 'imageUrl', 'author', 'authorEmail', 'published', 'likes', 'createdAt', 'updatedAt'],
  Comments: ['id', 'postId', 'userId', 'userName', 'userPhoto', 'comment', 'createdAt'],
  Likes: ['id', 'postId', 'userId', 'createdAt'],
  Ebooks: ['id', 'title', 'description', 'fileUrl', 'coverUrl', 'published', 'createdBy', 'createdAt', 'updatedAt'],
  Recommendations: ['id', 'title', 'description', 'url', 'category', 'published', 'createdBy', 'createdAt', 'updatedAt'],
  Supporters: ['id', 'name', 'description', 'websiteUrl', 'logoUrl', 'published', 'createdBy', 'createdAt', 'updatedAt'],
};

class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code || 'APP_ERROR';
  }
}

function doGet(e) {
  return routeRequest((e && e.parameter) || {}, 'GET');
}

function doPost(e) {
  const body = e && e.postData && e.postData.contents ? safeJsonParse(e.postData.contents) : {};
  return routeRequest(body, 'POST');
}

function routeRequest(payload, method) {
  try {
    ensureSheets();
    const action = String(payload.action || '').trim();
    if (!action) throw new AppError('Ação não informada.', 'MISSING_ACTION');

    const data = dispatch(action, payload, method);
    return jsonResponse({ success: true, data });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message || 'Erro interno.',
      },
    });
  }
}

function dispatch(action, payload) {
  const routes = {
    verifyUser,
    getModules,
    getModule,
    createModule,
    updateModule,
    deleteModule,
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getComments,
    addComment,
    toggleLike,
    getUserProgress,
    saveProgress,
    getEbooks,
    createEbook,
    updateEbook,
    deleteEbook,
    getRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
    getSupporters,
    createSupporter,
    updateSupporter,
    deleteSupporter,
  };

  if (!routes[action]) throw new AppError('Endpoint inválido.', 'INVALID_ACTION');
  return routes[action](payload);
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new AppError('JSON inválido.', 'INVALID_JSON');
  }
}

function initializeDatabase(spreadsheetId, googleClientId) {
  if (spreadsheetId) SCRIPT_PROPS.setProperty('SPREADSHEET_ID', spreadsheetId);
  if (googleClientId) SCRIPT_PROPS.setProperty('GOOGLE_CLIENT_ID', googleClientId);
  ensureSheets();
  return 'Database initialized without seed data.';
}

function getSpreadsheet() {
  const spreadsheetId = SCRIPT_PROPS.getProperty('SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID;
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new AppError('Configure SPREADSHEET_ID nas propriedades do script.', 'SPREADSHEET_NOT_CONFIGURED');
}

function ensureSheets() {
  const spreadsheet = getSpreadsheet();

  Object.keys(SHEETS).forEach((sheetName) => {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) sheet = spreadsheet.insertSheet(sheetName);

    const expectedHeaders = SHEETS[sheetName];
    const existingLastColumn = Math.max(sheet.getLastColumn(), 1);
    const existingHeaders = sheet.getRange(1, 1, 1, existingLastColumn).getValues()[0].filter(Boolean);

    if (existingHeaders.length === 0) {
      sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
      sheet.setFrozenRows(1);
      return;
    }

    const missingHeaders = expectedHeaders.filter((header) => existingHeaders.indexOf(header) === -1);
    if (missingHeaders.length > 0) {
      sheet.getRange(1, existingHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
    }
    sheet.setFrozenRows(1);
  });
}

function getSheet(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new AppError(`Aba ${sheetName} não encontrada.`, 'SHEET_NOT_FOUND');
  return sheet;
}

function readRecords(sheetName) {
  const sheet = getSheet(sheetName);
  const headers = SHEETS[sheetName];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .filter((row) => row.some((cell) => cell !== '' && cell !== null))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      return record;
    });
}

function appendRecord(sheetName, record) {
  const sheet = getSheet(sheetName);
  const headers = SHEETS[sheetName];
  const row = headers.map((header) => normalizeCell(record[header]));
  sheet.appendRow(row);
  return record;
}

function updateRecord(sheetName, id, updates) {
  const sheet = getSheet(sheetName);
  const headers = SHEETS[sheetName];
  const rowIndex = findRowIndexById(sheetName, id);
  if (rowIndex === -1) throw new AppError('Registro não encontrado.', 'NOT_FOUND');

  const currentValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const current = {};
  headers.forEach((header, index) => {
    current[header] = currentValues[index];
  });

  const next = Object.assign({}, current, updates);
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([headers.map((header) => normalizeCell(next[header]))]);
  return next;
}

function findRowIndexById(sheetName, id) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let index = 0; index < ids.length; index += 1) {
    if (String(ids[index][0]) === String(id)) return index + 2;
  }
  return -1;
}

function deleteById(sheetName, id) {
  const rowIndex = findRowIndexById(sheetName, id);
  if (rowIndex === -1) return false;
  getSheet(sheetName).deleteRow(rowIndex);
  return true;
}

function deleteWhere(sheetName, predicate) {
  const records = readRecords(sheetName);
  const sheet = getSheet(sheetName);
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (predicate(records[index])) sheet.deleteRow(index + 2);
  }
}

function normalizeCell(value) {
  if (value === undefined || value === null) return '';
  return value;
}

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return Utilities.getUuid();
}

function cleanString(value, maxLength) {
  const text = String(value || '').trim();
  if (maxLength && text.length > maxLength) return text.slice(0, maxLength);
  return text;
}

function requireString(value, field, maxLength) {
  const text = cleanString(value, maxLength);
  if (!text) throw new AppError(`Campo obrigatório: ${field}.`, 'VALIDATION_ERROR');
  return text;
}

function bool(value) {
  return value === true || String(value).toLowerCase() === 'true';
}

function sortByCreatedAtDesc(records) {
  return records.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function withLock(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function verifyUser(payload) {
  const idToken = cleanString(payload.idToken);
  if (!idToken) throw new AppError('Token Google não informado.', 'AUTH_REQUIRED');

  const cacheKey = `token:${Utilities.base64EncodeWebSafe(idToken).slice(0, 120)}`;
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  const tokenPayload = cached ? JSON.parse(cached) : fetchGoogleTokenInfo(idToken);

  if (!cached) cache.put(cacheKey, JSON.stringify(tokenPayload), 300);

  const email = cleanString(tokenPayload.email).toLowerCase();
  if (!email || tokenPayload.email_verified === false || tokenPayload.email_verified === 'false') {
    throw new AppError('Conta Google não verificada.', 'AUTH_INVALID');
  }

  const expectedClientId = SCRIPT_PROPS.getProperty('GOOGLE_CLIENT_ID');
  if (expectedClientId && tokenPayload.aud !== expectedClientId) {
    throw new AppError('Token emitido para outro cliente OAuth.', 'AUTH_INVALID_AUDIENCE');
  }

  const expiresAt = Number(tokenPayload.exp || 0) * 1000;
  if (expiresAt && Date.now() > expiresAt) {
    throw new AppError('Sessão expirada.', 'AUTH_EXPIRED');
  }

  const user = {
    id: cleanString(tokenPayload.sub),
    name: cleanString(tokenPayload.name || email, 180),
    email,
    photoUrl: cleanString(tokenPayload.picture, 600),
    role: email.endsWith(ADMIN_EMAIL_DOMAIN) ? 'admin' : 'user',
  };

  upsertUser(user);
  return user;
}

function fetchGoogleTokenInfo(idToken) {
  const response = UrlFetchApp.fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
    method: 'get',
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() >= 400) {
    throw new AppError('Token Google inválido.', 'AUTH_INVALID');
  }

  return JSON.parse(response.getContentText());
}

function upsertUser(user) {
  return withLock(() => {
    const rowIndex = findRowIndexById('Users', user.id);
    const timestamp = nowIso();

    if (rowIndex === -1) {
      return appendRecord('Users', Object.assign({}, user, { createdAt: timestamp, updatedAt: timestamp }));
    }

    return updateRecord('Users', user.id, Object.assign({}, user, { updatedAt: timestamp }));
  });
}

function requireAdmin(payload) {
  const user = verifyUser(payload);
  if (user.role !== 'admin') throw new AppError('Permissão administrativa necessária.', 'FORBIDDEN');
  return user;
}

function getModules(payload) {
  const includeDrafts = bool(payload.includeDrafts);
  if (includeDrafts) requireAdmin(payload);

  return sortByCreatedAtDesc(readRecords('Modules'))
    .filter((module) => includeDrafts || bool(module.published))
    .map(publicModule);
}

function getModule(payload) {
  const id = requireString(payload.id, 'id');
  const isAdminRequest = cleanString(payload.idToken) ? verifyUser(payload).role === 'admin' : false;
  const module = readRecords('Modules').find((item) => String(item.id) === String(id));

  if (!module || (!bool(module.published) && !isAdminRequest)) {
    throw new AppError('Módulo não encontrado.', 'NOT_FOUND');
  }

  const questions = readRecords('QuizQuestions')
    .filter((question) => String(question.moduleId) === String(id))
    .map((question) => publicQuizQuestion(question, isAdminRequest));

  return Object.assign({}, publicModule(module), { quizQuestions: questions });
}

function createModule(payload) {
  const admin = requireAdmin(payload);
  return withLock(() => {
    const timestamp = nowIso();
    const module = sanitizeModule(payload.module);
    const id = uuid();
    const record = Object.assign({}, module, {
      id,
      createdBy: admin.email,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    appendRecord('Modules', record);
    const savedQuestions = module.quizQuestions.map((question) => {
      const questionRecord = Object.assign({}, question, {
        id: uuid(),
        moduleId: id,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      appendRecord('QuizQuestions', questionRecord);
      return questionRecord;
    });

    return Object.assign({}, publicModule(record), {
      quizQuestions: savedQuestions.map((question) => publicQuizQuestion(question, true)),
    });
  });
}

function updateModule(payload) {
  requireAdmin(payload);
  return withLock(() => {
    const module = sanitizeModule(payload.module);
    const id = requireString(module.id, 'id');
    const existing = readRecords('Modules').find((item) => String(item.id) === String(id));
    if (!existing) throw new AppError('Módulo não encontrado.', 'NOT_FOUND');

    const updatedModule = updateRecord('Modules', id, Object.assign({}, module, {
      id,
      createdBy: existing.createdBy,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
    }));

    deleteWhere('QuizQuestions', (question) => String(question.moduleId) === String(id));
    const savedQuestions = module.quizQuestions.map((question) => {
      const questionRecord = Object.assign({}, question, {
        id: question.id || uuid(),
        moduleId: id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      appendRecord('QuizQuestions', questionRecord);
      return questionRecord;
    });

    return Object.assign({}, publicModule(updatedModule), {
      quizQuestions: savedQuestions.map((question) => publicQuizQuestion(question, true)),
    });
  });
}

function deleteModule(payload) {
  requireAdmin(payload);
  const id = requireString(payload.id, 'id');
  return withLock(() => {
    deleteById('Modules', id);
    deleteWhere('QuizQuestions', (question) => String(question.moduleId) === String(id));
    deleteWhere('UserProgress', (progress) => String(progress.moduleId) === String(id));
    return { id };
  });
}

function sanitizeModule(module) {
  if (!module) throw new AppError('Payload do módulo ausente.', 'VALIDATION_ERROR');

  const questions = Array.isArray(module.quizQuestions) ? module.quizQuestions : [];
  if (questions.length !== 5) throw new AppError('O quiz deve ter exatamente 5 perguntas.', 'VALIDATION_ERROR');

  const sanitized = {
    id: cleanString(module.id),
    title: requireString(module.title, 'title', 160),
    description: requireString(module.description, 'description', 420),
    imageUrl: requireString(module.imageUrl, 'imageUrl', 900),
    content: requireString(module.content, 'content', 20000),
    videoUrl: requireString(module.videoUrl, 'videoUrl', 900),
    published: bool(module.published),
    quizQuestions: questions.map(sanitizeQuestion),
  };

  if (!isYouTubeUrl(sanitized.videoUrl)) {
    throw new AppError('O vídeo precisa ser um link válido do YouTube.', 'VALIDATION_ERROR');
  }

  return sanitized;
}

function sanitizeQuestion(question) {
  const correctAnswer = cleanString(question.correctAnswer || 'A').toUpperCase();
  if (['A', 'B', 'C', 'D'].indexOf(correctAnswer) === -1) {
    throw new AppError('Resposta correta inválida.', 'VALIDATION_ERROR');
  }

  return {
    id: cleanString(question.id),
    question: requireString(question.question, 'question', 600),
    optionA: requireString(question.optionA, 'optionA', 400),
    optionB: requireString(question.optionB, 'optionB', 400),
    optionC: requireString(question.optionC, 'optionC', 400),
    optionD: requireString(question.optionD, 'optionD', 400),
    correctAnswer,
  };
}

function isYouTubeUrl(url) {
  return /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)[a-zA-Z0-9_-]{11}/.test(url);
}

function publicModule(module) {
  return {
    id: module.id,
    title: module.title,
    description: module.description,
    imageUrl: module.imageUrl,
    content: module.content,
    videoUrl: module.videoUrl,
    published: bool(module.published),
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
  };
}

function publicQuizQuestion(question, includeAnswer) {
  const result = {
    id: question.id,
    moduleId: question.moduleId,
    question: question.question,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
  };
  if (includeAnswer) result.correctAnswer = question.correctAnswer;
  return result;
}

function getUserProgress(payload) {
  const user = verifyUser(payload);
  return readRecords('UserProgress').filter((item) => String(item.userId) === String(user.id));
}

function saveProgress(payload) {
  const user = verifyUser(payload);
  const moduleId = requireString(payload.moduleId, 'moduleId');
  const answers = payload.answers || {};

  return withLock(() => {
    const module = readRecords('Modules').find((item) => String(item.id) === String(moduleId) && bool(item.published));
    if (!module) throw new AppError('Módulo não encontrado.', 'NOT_FOUND');

    const questions = readRecords('QuizQuestions').filter((question) => String(question.moduleId) === String(moduleId));
    if (questions.length !== 5) throw new AppError('Quiz incompleto.', 'VALIDATION_ERROR');

    const correctCount = questions.reduce((total, question) => {
      const answer = cleanString(answers[question.id]).toUpperCase();
      return total + (answer === cleanString(question.correctAnswer).toUpperCase() ? 1 : 0);
    }, 0);
    const score = Math.round((correctCount / questions.length) * 100);
    const completed = score >= 60;
    const existing = readRecords('UserProgress').find(
      (item) => String(item.userId) === String(user.id) && String(item.moduleId) === String(moduleId),
    );
    const timestamp = nowIso();

    if (existing) {
      const nextScore = Math.max(Number(existing.score || 0), score);
      const nextCompleted = bool(existing.completed) || completed;
      return updateRecord('UserProgress', existing.id, {
        score: nextScore,
        completed: nextCompleted,
        completedAt: nextCompleted ? existing.completedAt || timestamp : '',
        updatedAt: timestamp,
      });
    }

    return appendRecord('UserProgress', {
      id: uuid(),
      userId: user.id,
      moduleId,
      score,
      completed,
      completedAt: completed ? timestamp : '',
      updatedAt: timestamp,
    });
  });
}

function getPosts(payload) {
  const includeDrafts = bool(payload.includeDrafts);
  const user = cleanString(payload.idToken) ? verifyUser(payload) : null;
  if (includeDrafts && (!user || user.role !== 'admin')) throw new AppError('Permissão administrativa necessária.', 'FORBIDDEN');

  const comments = readRecords('Comments');
  const likes = readRecords('Likes');
  return sortByCreatedAtDesc(readRecords('BlogPosts'))
    .filter((post) => includeDrafts || bool(post.published))
    .map((post) => publicPost(post, comments, likes, user));
}

function getPost(payload) {
  const id = requireString(payload.id, 'id');
  const user = cleanString(payload.idToken) ? verifyUser(payload) : null;
  const post = readRecords('BlogPosts').find((item) => String(item.id) === String(id));
  const canSeeDraft = user && user.role === 'admin';
  if (!post || (!bool(post.published) && !canSeeDraft)) throw new AppError('Post não encontrado.', 'NOT_FOUND');
  return publicPost(post, readRecords('Comments'), readRecords('Likes'), user);
}

function createPost(payload) {
  const admin = requireAdmin(payload);
  return withLock(() => {
    const timestamp = nowIso();
    const post = sanitizePost(payload.post);
    const record = Object.assign({}, post, {
      id: uuid(),
      author: admin.name,
      authorEmail: admin.email,
      likes: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    appendRecord('BlogPosts', record);
    return publicPost(record, [], [], admin);
  });
}

function updatePost(payload) {
  requireAdmin(payload);
  return withLock(() => {
    const post = sanitizePost(payload.post);
    const id = requireString(post.id, 'id');
    const existing = readRecords('BlogPosts').find((item) => String(item.id) === String(id));
    if (!existing) throw new AppError('Post não encontrado.', 'NOT_FOUND');

    const next = updateRecord('BlogPosts', id, Object.assign({}, post, {
      id,
      author: existing.author,
      authorEmail: existing.authorEmail,
      likes: Number(existing.likes || 0),
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
    }));
    return publicPost(next, readRecords('Comments'), readRecords('Likes'), null);
  });
}

function deletePost(payload) {
  requireAdmin(payload);
  const id = requireString(payload.id, 'id');
  return withLock(() => {
    deleteById('BlogPosts', id);
    deleteWhere('Comments', (comment) => String(comment.postId) === String(id));
    deleteWhere('Likes', (like) => String(like.postId) === String(id));
    return { id };
  });
}

function sanitizePost(post) {
  if (!post) throw new AppError('Payload do post ausente.', 'VALIDATION_ERROR');
  return {
    id: cleanString(post.id),
    title: requireString(post.title, 'title', 180),
    content: requireString(post.content, 'content', 30000),
    imageUrl: cleanString(post.imageUrl, 900),
    published: bool(post.published),
  };
}

function publicPost(post, comments, likes, user) {
  const postId = String(post.id);
  const likedByUser = user
    ? likes.some((like) => String(like.postId) === postId && String(like.userId) === String(user.id))
    : false;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: cleanString(post.content, 220),
    imageUrl: post.imageUrl,
    author: post.author,
    published: bool(post.published),
    likes: Number(post.likes || 0),
    likedByUser,
    commentCount: comments.filter((comment) => String(comment.postId) === postId).length,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function getComments(payload) {
  const postId = requireString(payload.postId, 'postId');
  const offset = Math.max(0, Number(payload.offset || 0));
  const limit = Math.min(20, Math.max(1, Number(payload.limit || 20)));
  const comments = sortByCreatedAtDesc(readRecords('Comments').filter((comment) => String(comment.postId) === String(postId)));
  const items = comments.slice(offset, offset + limit);
  const nextOffset = offset + limit < comments.length ? offset + limit : null;
  return { items, nextOffset, total: comments.length };
}

function addComment(payload) {
  const user = verifyUser(payload);
  const postId = requireString(payload.postId, 'postId');
  const comment = requireString(payload.comment, 'comment', 800);

  return withLock(() => {
    const post = readRecords('BlogPosts').find((item) => String(item.id) === String(postId) && bool(item.published));
    if (!post) throw new AppError('Post não encontrado.', 'NOT_FOUND');

    return appendRecord('Comments', {
      id: uuid(),
      postId,
      userId: user.id,
      userName: user.name,
      userPhoto: user.photoUrl,
      comment,
      createdAt: nowIso(),
    });
  });
}

function toggleLike(payload) {
  const user = verifyUser(payload);
  const postId = requireString(payload.postId, 'postId');

  return withLock(() => {
    const post = readRecords('BlogPosts').find((item) => String(item.id) === String(postId) && bool(item.published));
    if (!post) throw new AppError('Post não encontrado.', 'NOT_FOUND');

    const existing = readRecords('Likes').find(
      (like) => String(like.postId) === String(postId) && String(like.userId) === String(user.id),
    );

    if (existing) {
      deleteById('Likes', existing.id);
    } else {
      appendRecord('Likes', { id: uuid(), postId, userId: user.id, createdAt: nowIso() });
    }

    const likes = readRecords('Likes').filter((like) => String(like.postId) === String(postId)).length;
    updateRecord('BlogPosts', postId, { likes, updatedAt: nowIso() });

    return {
      postId,
      likes,
      likedByUser: !existing,
    };
  });
}

function getEbooks(payload) {
  return getCollection('Ebooks', payload);
}

function createEbook(payload) {
  return createCollection('Ebooks', payload, sanitizeEbook);
}

function updateEbook(payload) {
  return updateCollection('Ebooks', payload, sanitizeEbook);
}

function deleteEbook(payload) {
  return deleteCollection('Ebooks', payload);
}

function getRecommendations(payload) {
  return getCollection('Recommendations', payload);
}

function createRecommendation(payload) {
  return createCollection('Recommendations', payload, sanitizeRecommendation);
}

function updateRecommendation(payload) {
  return updateCollection('Recommendations', payload, sanitizeRecommendation);
}

function deleteRecommendation(payload) {
  return deleteCollection('Recommendations', payload);
}

function getSupporters(payload) {
  return getCollection('Supporters', payload);
}

function createSupporter(payload) {
  return createCollection('Supporters', payload, sanitizeSupporter);
}

function updateSupporter(payload) {
  return updateCollection('Supporters', payload, sanitizeSupporter);
}

function deleteSupporter(payload) {
  return deleteCollection('Supporters', payload);
}

function getCollection(sheetName, payload) {
  const includeDrafts = bool(payload.includeDrafts);
  if (includeDrafts) requireAdmin(payload);
  return sortByCreatedAtDesc(readRecords(sheetName)).filter((item) => includeDrafts || bool(item.published));
}

function createCollection(sheetName, payload, sanitizer) {
  const admin = requireAdmin(payload);
  return withLock(() => {
    const timestamp = nowIso();
    const item = sanitizer(payload.item);
    const record = Object.assign({}, item, {
      id: uuid(),
      createdBy: admin.email,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    appendRecord(sheetName, record);
    return record;
  });
}

function updateCollection(sheetName, payload, sanitizer) {
  requireAdmin(payload);
  return withLock(() => {
    const item = sanitizer(payload.item);
    const id = requireString(item.id, 'id');
    const existing = readRecords(sheetName).find((record) => String(record.id) === String(id));
    if (!existing) throw new AppError('Item não encontrado.', 'NOT_FOUND');
    return updateRecord(sheetName, id, Object.assign({}, item, {
      id,
      createdBy: existing.createdBy,
      createdAt: existing.createdAt,
      updatedAt: nowIso(),
    }));
  });
}

function deleteCollection(sheetName, payload) {
  requireAdmin(payload);
  const id = requireString(payload.id, 'id');
  return withLock(() => {
    deleteById(sheetName, id);
    return { id };
  });
}

function sanitizeEbook(item) {
  return {
    id: cleanString(item && item.id),
    title: requireString(item && item.title, 'title', 180),
    description: requireString(item && item.description, 'description', 900),
    fileUrl: requireString(item && item.fileUrl, 'fileUrl', 900),
    coverUrl: cleanString(item && item.coverUrl, 900),
    published: bool(item && item.published),
  };
}

function sanitizeRecommendation(item) {
  return {
    id: cleanString(item && item.id),
    title: requireString(item && item.title, 'title', 180),
    description: requireString(item && item.description, 'description', 900),
    url: requireString(item && item.url, 'url', 900),
    category: cleanString(item && item.category, 120),
    published: bool(item && item.published),
  };
}

function sanitizeSupporter(item) {
  return {
    id: cleanString(item && item.id),
    name: requireString(item && item.name, 'name', 180),
    description: requireString(item && item.description, 'description', 900),
    websiteUrl: cleanString(item && item.websiteUrl, 900),
    logoUrl: cleanString(item && item.logoUrl, 900),
    published: bool(item && item.published),
  };
}

function idRef(ref) {
  if (ref == null) return undefined;
  if (typeof ref === 'object' && ref._id) return String(ref._id);
  return String(ref);
}

export function formatUser(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  const avatar = (o.avatar || '').trim();
  const baseName = avatar ? avatar.split(/[/\\]/).pop() : '';
  return {
    id: String(o._id),
    email: o.email,
    name: o.name,
    institution: o.institution || null,
    role: o.role,
    createdAt: o.createdAt,
    avatar: avatar || null,
    avatarUrl: baseName ? `/api/avatars-files/${encodeURIComponent(baseName)}` : null,
    bio: o.bio || '',
    language: o.language || 'en',
    notifications: {
      email: o.notifications?.email !== false,
      assignmentUpdates: o.notifications?.assignmentUpdates !== false,
      comments: o.notifications?.comments !== false,
    },
  };
}

export function formatAssignment(doc, instructorName) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    title: o.title,
    description: o.description,
    dueDate: o.deadline instanceof Date ? o.deadline.toISOString() : o.deadline,
    status: o.status || 'active',
    tools: o.tools || [],
    attachmentPath: o.fileUrl || '',
    attachmentOriginalName: o.attachmentOriginalName || null,
    createdBy: idRef(o.createdBy),
    instructorName: instructorName || undefined,
    createdAt: o.createdAt,
  };
}

export function formatRating(r) {
  if (!r) return null;
  const o = r.toObject ? r.toObject() : r;
  const idea = o.aiIdea ?? o.aiScore;
  const alg = o.aiAlgorithm ?? o.aiScore;
  const tech = o.aiTechnical ?? o.aiScore;
  const tools = o.aiTools ?? o.aiScore;
  const aiOverall = Math.round((idea + alg + tech + tools) / 4);
  return {
    aiIdea: idea,
    aiAlgorithm: alg,
    aiTechnical: tech,
    aiTools: tools,
    aiFeedback: o.feedback,
    aiOverall,
    teacherScore: o.teacherScore,
    teacherFeedback: o.teacherFeedback || null,
    finalScore: o.finalScore != null ? Number(o.finalScore) : null,
    gradedAt: o.gradedAt,
  };
}

export function formatProject(doc, extras = {}) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    assignmentId: idRef(o.assignmentId),
    studentId: idRef(o.studentId),
    teamId: null,
    title: o.title,
    description: o.description,
    filePath: o.fileUrl,
    originalFilename: o.originalFilename,
    tools: o.tools || [],
    status: o.status,
    submittedAt: o.createdAt,
    studentName: extras.studentName,
    teamMembers: extras.teamMembers || [],
    rating: extras.rating,
    assignmentTitle: extras.assignmentTitle,
    commentsCount: extras.commentsCount ?? 0,
  };
}

export function formatComment(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    projectId: idRef(o.projectId) ?? String(o.projectId),
    userId: idRef(o.userId) ?? String(o.userId),
    body: o.message,
    createdAt: o.createdAt,
    authorName: o.authorName,
    authorRole: o.authorRole,
  };
}

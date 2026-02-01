import { createFolder } from '@/models/folders';

export async function createUserFolder(params: {
  userId: string;
  name: string;
  parentId?: string | null;
}) {
  const { userId, name, parentId } = params;

  if (!name || !name.trim()) {
    throw new Error('Folder name is required');
  }

  return createFolder({
    userId,
    name: name.trim(),
    parentId,
    isRoot: !parentId,
  });
}

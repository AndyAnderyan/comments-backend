# Моделі даних

Відповідають існуючим ентіті у `src/comments/entities/*` та суміжним (`users`, `notifications`, `logging`).

## Comment
- `id: string`
- `layerTypeId: string`
- `objectId: string`
- `parentId?: string | null`
- `level: 0 | 1 | 2 | 3` (обмеження 3)
- `text: string (<=2000)`
- `authorId: string`
- `createdAt: Date`
- `updatedAt: Date`
- `isHidden: boolean`
- `isPinned: boolean` (тільки 1 на об’єкт)
- `notifiedUserIds: string[]`

## Thread
- `rootCommentId: string`
- `comments: Comment[]` (корінь + відповіді)
- `repliesCount: number`
- `lastActivityAt: Date`

## ObjectIndexItem
- `layerTypeId: string`
- `objectId: string`
- `objectTitle: string`
- `lastActivityAt: Date`
- `pinnedCommentId?: string | null`
- `totalCount: number`

## Узгодження з БД
- PostgreSQL; ієрархія через `parentId`, `level` з перевіркою на бекенді (<=3)
- Каскадне приховування/видалення для всіх нащадків
- Унікальний pinned на `(layerTypeId, objectId)` (частковий унікальний індекс)
- Індекси: `(layerTypeId, objectId, lastActivityAt DESC)`, `authorId`, `createdAt` для пошуку

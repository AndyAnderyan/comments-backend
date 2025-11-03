# WebSocket / Нотифікації

Канал: `notifications` (вже існує у бекенді). Події:

- `comment.created` — новий коментар
  - payload: `{ comment: Comment }`
- `comment.updated` — змінено текст/адресатів
  - payload: `{ comment: Comment }`
- `comment.hidden` — приховано/розкрито
  - payload: `{ id: string, hidden: boolean }`
- `comment.deleted` — видалено (каскадно для треду)
  - payload: `{ id: string }`
- `comment.pinned` — встановлено/знято pinned для об’єкта
  - payload: `{ objectKey: { layerTypeId, objectId }, pinnedCommentId: string | null }`
- `comment.read` — позначено прочитаним/непрочитаним
  - payload: `{ id: string, userId: string, read: boolean }`

Front-end обробка:
- Оновлювати відповідні слайси стору (threadsByObject, pinnedByObject, unreadByUser)
- Додатково — показувати badge у `NotificationsBell`

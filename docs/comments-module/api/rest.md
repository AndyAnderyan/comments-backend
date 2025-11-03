# REST API — Коментарі

База: `/api/comments`

## Створення коментаря
POST `/api/comments`
Body:
```
{
  "layerTypeId": string,
  "objectId": string,
  "parentId": string | null,
  "text": string (<=2000),
  "notifiedUserIds": string[]
}
```
Response: `Comment`.

## Оновлення коментаря
PATCH `/api/comments/:id`
Body: `{ "text": string, "notifiedUserIds": string[] }`

## Приховати коментар
PATCH `/api/comments/:id/hide`
Body: `{ "hidden": boolean }`

## Видалити коментар (Адмін)
DELETE `/api/comments/:id`

## Позначити як pinned / зняти позначку
PATCH `/api/comments/:id/pin`
Body: `{ "pinned": boolean }`

## Отримати треди для об’єкта
GET `/api/comments/threads`
Query:
- `layerTypeId`: string
- `objectId`: string
- `page`: number, `pageSize`: number
- `onlyRoots`: boolean (лише кореневі)
- `includeHidden`: boolean (для Адміністратора)

Response:
```
{
  "items": Thread[],
  "total": number,
  "pinnedCommentId": string | null
}
```

## Пошук по коментарях
GET `/api/comments/search`
Query: `text`, `authorId?`, `layerTypeId?`, `objectId?`, `onlyRoots?`, `includeHidden?`, `page`, `pageSize`, `sort`

## Індекс об’єктів із коментарями
GET `/api/comments/objects`
Query: `sort`, `page`, `pageSize`
Response: `ObjectIndexItem[]` + пагінація.

## Позначити як прочитане
POST `/api/comments/:id/read`
Body: `{ "read": boolean }`

## Моделі-відповіді
`Comment`, `Thread`, `ObjectIndexItem` — див. data-models.md.

# Архітектура фронтенду (Angular)

## Модульність
- `comments` (feature module, lazy-loaded)
- `comments/shared` (спільні моделі, утиліти)
- `comments/data-access` (сервіси API, NgRx store)
- `comments/ui` (презентаційні компоненти)

## Роутинг
- `/comments` — загальний інтерфейс списку коментарів по об’єктах
- `/comments/object/:layerTypeId/:objectId` — інтерфейс у контексті картки об’єкта

## Компоненти
- `CommentsShellPage` — контейнер, завантажує фільтри, список об’єктів з коментарями
- `CommentsListPanel` — список тредів для обраного об’єкта, хронологічно, pinned зверху
- `CommentsThread` — один тред: кореневий коментар + відповіді до 3 рівня
- `CommentItem` — елемент треду з діями (Відповісти/Редагувати/Приховати/Видалити/Pin)
- `CommentEditor` — форма створення/редагування коментаря (до 2000 символів, вибір адресатів)
- `CommentSearchBar` — пошук за текстом/Автором/ID об’єкта
- `CommentFiltersBar` — фільтри (тип, назва, дата останнього коментаря)
- `NotificationsBell` — індикатор нових сповіщень

## Сервіси
- `CommentsApiService` — REST доступ до бекенду
- `CommentsWsService` — підписка на WS події (оновлення/сповіщення)
- `CommentsFacade` — фасад над станом і API, експонує стріми для компонентів

## Стан (NgRx)
- Feature key: `comments`
- Slices:
  - `objectsIndex` — перелік об’єктів, що мають коментарі (загальний інтерфейс)
  - `threadsByObject` — треди по ключу `(layerTypeId, objectId)` з пагінацією
  - `unreadByUser` — непрочитані для користувача (ідентифікатори коментарів/тредів)
  - `pinnedByObject` — ідентифікатор закріпленого коментаря для об’єкта
  - `uiState` — сортування, фільтри, пошуковий запит, завантаження
- Effects:
  - `loadObjectsIndex`, `searchComments`, `loadThreads`, `createComment`, `updateComment`, `hideComment`, `deleteComment`, `pinComment`, `unpinComment`, `markRead`
  - `wsEvents` — мапінг WS подій у оновлення стору

## Моделі
- `Comment` { id, parentId?, level, text, authorId, createdAt, updatedAt, isHidden, isPinned, notifiedUserIds[], layerTypeId, objectId }
- `Thread` { rootCommentId, comments[], repliesCount, lastActivityAt }
- `ObjectIndexItem` { layerTypeId, objectId, objectTitle, lastActivityAt, pinnedCommentId?, totalCount }
- `SearchQuery` { text?, authorId?, layerTypeId?, objectId?, onlyRoots?, includeHiddenForAdmin? }

## UX правила
- Pinned завжди зверху для обраного об’єкта (1 шт максимум)
- Нові/непрочитані виділяються стилем до прочитання
- Відповіді дозволено до рівня 3, кнопка “Відповісти” недоступна на рівні 3

## Інтеграції
- Аутентифікація — інжект поточного користувача (token/claims)
- Авторизація — показ/ховання дій згідно ролі (Автор/Адмін)
- Мапа — навігація у `/comments/object/:layerTypeId/:objectId` з картки об’єкта

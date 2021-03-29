/* 
  В качестве оригинала даётся объект, представляющий собой дерево заранее неизвестной глубины
  Листья дерева ― строки с {placeholder}'ами

  Результатом должен быть объект такой же формы, как и оригинал
  Листья дерева ― format-функции, заменяющие плейсхолдеры значениями из аргумента-объекта
  Сигнатура format-функции:
    (vars?: { [key: string]: string | number }) => string

  NOTE: можно использовать готовую реализацию format-функции
 */

const sourceStrings = {
  hello: 'Добрый вечор, {username}!',
  admin: {
    objectForm: {
      label: 'Пароль администратора',
      hint: 'Не менее {minLength} символов. Сейчас ― {length}',
    },
  },
};

const t = i18n(sourceStrings);
console.log('🚀 Starting tests...');

const testFormat = 'Добрый вечор, me!' === t.hello({ username: 'me' });
console.assert(testFormat, '  ❌ First level failed!');

const testDepth = 'Пароль администратора' === t.admin.objectForm.label();
console.assert(testDepth, '  ❌ Generic depth failed!');

const testDepthFmt =
  'Не менее 8 символов. Сейчас ― 6' ===
  t.admin.objectForm.hint({ minLength: 8, length: 6 });
console.assert(testDepthFmt, '  ❌ Variables failed');

if (testDepth && testDepthFmt && testFormat)
  console.log('🎉 Good! All tests passed.');

// === implementation ===

type Input<T> = {
  [key: string]: (Input<T> | string);
};

// Если написано [key: string]: ((params?: ParamsType) => string), то не ругается в вызове функции (t.hello({ username: 'me' })), 
// но ругается, если обращаюсь к вложенному объекту 

// Если Result<T>, то ругается в вызове функции.
// Но сделать одновременно и то и то не получется

// Если делаю yarn start, то билд происходит, но с ошибками TS. Если запустить index.js, то все работает отлично
// Совершенно нет идей, как это починить

type Result<T> = {
  [key: string]: ((params?: ParamsType) => string) | Result<T>;
};

type ParamsType = Record<string | number | symbol, string>

function i18n<T extends Input<T>>(strings: T): Result<T> {
  return getFormattedObject(strings)
}


function getFormattedObject<T extends Input<T>>(strings: T): Result<T> {
  const returnObj = {} as Result<T>
  for (let key in strings) {
    if (typeof strings[key] === 'object') {
      returnObj[key] = getFormattedObject(strings[key] as Input<T>)
    } else if (typeof strings[key] === 'string') {
      returnObj[key] = (params?: ParamsType) => formatString(strings[key] as string, params)
    }
  }
  return returnObj
}

function formatString (string: string, params?: ParamsType): string {
  for (let key in params) {
    string = string.replace(`{${key}}`, params[key])
  }
  return string
}
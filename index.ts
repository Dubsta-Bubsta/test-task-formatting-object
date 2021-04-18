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
  [key: string]: Input<T> | string;
};

type Result<T> = {
  [K in keyof T]: T[K] extends string ? ((params?: ParamsType) => string) : Result<T[K]>
};

type ParamsType = Record<string | number | symbol, string | number>

function i18n<T extends Input<T>>(strings: T): Result<T> {
  return getFormattedObject(strings)
}


function getFormattedObject<T extends Input<T>>(strings: T): Result<T> {
  const returnObj = {} as Result<T>
  for (let key in strings) {
    let value = null
    if (typeof strings[key] === 'object') {
      value = getFormattedObject(strings[key] as Input<T>)
    } else if (typeof strings[key] === 'string') {
      value = (params?: ParamsType) => formatString(strings[key] as string, params)
    }
    returnObj[key] = value as T[Extract<keyof T, string>] extends string ? (params?: ParamsType) => string : Result<T[Extract<keyof T, string>]>
  }
  return returnObj
}

function formatString(string: string, params?: ParamsType): string {
  for (let key in params) {
    string = string.replace(`{${key}}`, params[key].toString())
  }
  return string
}
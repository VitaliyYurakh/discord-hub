
# 🤖 Discord Hub v0.2.0

![Иллюстрация к проекту](https://github.com/VitaliyYurakh/discord-hub/raw/main/img/image_2024-05-09_23-15-45.png)

## 🏁 Общая информация

Софт для спама сообщений в дискорд серверах и в личные сообщения. Все настройки очень простые и не требуют технических знаний

## 📌 Основные особенности

* **Поддержка прокси**
* **Проверка работоспособности прокси**
* **Возможность указывать UserAgent**
* **Логирование ваших действий**
* **Повторитель (при ошибках)**
* **Smart Chating(в разработке)**
* **Рандомный запуск с задержкой**

## ♾️ Основные функции:

1. **🚀 Запуск прогона всех аккаунтов по заданным дискорд каналам**

    Эта функция запустит отправку указаных сообщений на выбранные дискорд каналы. Чтобы она заработала, достаточно в одном ексель файле указать информацию про аккаунты, а в другом файле указать информацию про сервера и сообщения

2. **✅ Проверка всех прокси на работоспособность**

    Быстрая проверка прокси

3. **🧠 Smart Chating на основе ИИ (в разработке)**

    Генерация и отправка смысловых сообщений в контексте диалога

## 📄 Ввод своих данных

### 1. В таблице `accounts_data.xlsx` в папке `/data` нужно ввести следующие данные: 
   1. **Name** - имена ваших аккаунтов, опциональное значение, но очень рекомендуем указывать
   2. **Discord_Token** - токен вашего аккаунта ([как получить](https://youtu.be/b2Y8-Z3Wtjo?si=B5M2nzwQJ-kyRrRn))
   3. **HTTP_Proxy** - прокси для аккаунта (формат - username:password@ip:port, протокол - http!)
   4. **User_Agent** - опциональное значение (пример - "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/533.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/533.36")

### 2. В таблице `spam_msg.xlsx` в папке `/data` нужно ввести:
   1. **Server_Name** - имена серверов, опциональное значение, но очень рекомендуем указывать
   2. **Channel_ID** - id канала ([как получить](https://www.youtube.com/watch?v=tJVtH05IGsU) ), работает не только для канала на сервере но и для личных сообщений, спамить можно везде😂, только с умом
   3. **Message** - сообщение которое нужно отправить
   4. **Accounts_List** - с каких аккаунтов должно отправить сообщение. Если ничего не указать или указать "0" - отправка будет со всех аккаунтов, "1,3,4" - отправка с указаных аккаунтов, "2-10" - отправка с аккаунтов в диапазоне 2-10 включая 
### 3. В файле `config.js` в папке `/data` можно указывать:
   1. **MAXIMUM_RETRY** - количество попыток при неудачной отправке
   2. **SLEEP_TIME** - [1000, 5000] - временя ожидания между отправкой сообщений (рандомно берет значение внутри указаного диапазона). Значение указывать в миллисекундах
   3. **RESTART_TIME** - 5 - время ожидания перед повторным запуском спама в часах (если 0 то фукнция не активная).

## 🛠️ Установка и запуск проекта (MacOS, Linux, Windows и на бабкином телефоне👵)

> 🚧Устанавливая проект, вы принимаете риски использования софта🚧

Как только вы скачаете проект, **убедитесь**, что у вас есть Node JS v20.11 или выше

 - [Установка Node JS](https://nodejs.org/en/download) (Вам нужна версия ^20.11)
   
**Все команды выполнять в PowerShell(Windows) или терминале(Bash)(Linux, MacOS)**

Команда для проверки версии node js:

```bash
  node -v
```

Установка проекта (если скачиваете архив то пропускайте этот пункт)

```bash
  git clone https://github.com/VitaliyYurakh/discord-hub.git
```

Перейдите в папку проекта сами либо командой

```bash
  cd discord-hub
```

Для установки необходимых библиотек пропишите в консоль

```bash
  npm i
```

Запуск проекта

```bash
  node index.js
```


## 📜 Следующие обновления

 - Smart Chating - продвинутое общение с помощью ИИ
 - Консольное взаимодействие для добавления данных в программу (прокси, токены, каналы)
 - Дополнительные "рычаги" для более тонкой настройки программы 
 - Запуск с планировщика задач
 - Прямой запуск спама без интерфейса, одной командой в терминале

 P.S. Расширение функционала в соответствии с предварительным планом и по запросам пользователей!

## 📕 Используемые библиотеки

  - [Node JS](https://nodejs.org/en) - среда выполнения JS
  - [React](https://react.dev/) - JS фреймворк
  - [Ink](https://www.npmjs.com/package/ink) - библиотека для построения CLI программ
  - [Babel](https://babeljs.io/) - транспилятор JSX в JS

## ❔ Куда писать свой вопрос?

- [Developer](https://t.me/i_66_77) - мой телеграм аккаунт

## 🦴 Кодеру на сухарики и мотивашку (Any EVM)

### `0x938c6bd70E152b261735F6CDc6E5be075feD4664`
> Спасибо за поддержку❤️

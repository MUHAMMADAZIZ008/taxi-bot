import { Markup } from 'telegraf';

export const keyboardLan: Markup.Markup<any> = Markup.keyboard([
  [Markup.button.text('Uzbek 🇺🇿')],
  [Markup.button.text('Rus 🇷🇺')],
])
  .resize()
  .oneTime();

export const menuInUz: Markup.Markup<any> = Markup.keyboard([
  [Markup.button.text('Taxi chaqirish 🚕')],
  [Markup.button.text(`Tilni o'zgartirish 🇷🇺`)],
])
  .resize()
  .oneTime();

export const menuInRu: Markup.Markup<any> = Markup.keyboard([
  [Markup.button.text('Вызвать такси 🚕')],
  [Markup.button.text(`Изменить язык 🇺🇿`)],
])
  .resize()
  .oneTime();

export const confirmationKeyInUz: Markup.Markup<any> = Markup.inlineKeyboard([
  [Markup.button.callback('Tasdiqlash ✅', 'tasdiqlash')],
  [Markup.button.callback('Bekor qilish ❌', 'bekor_qilish')],
]);

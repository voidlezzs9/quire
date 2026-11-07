export type Glyph = { glyph: string; name: string };

export type GlyphPack = { id: string; label: string; items: readonly Glyph[] };

function pack(id: string, label: string, items: readonly Glyph[]): GlyphPack {
  return { id, label, items };
}

function row(glyphs: readonly string[], names: readonly string[]): Glyph[] {
  return glyphs.map((glyph, index) => ({ glyph, name: names[index] ?? "sticker" }));
}

export const GLYPH_PACKS: readonly GlyphPack[] = [
  pack(
    "faces",
    "Faces",
    row(
      ["😀", "😁", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "😘", "😜", "🤪", "😎", "🤓", "🤔", "😴", "😢", "😭", "😤", "😡", "🤯", "😱", "🤗", "🥳", "🤠", "😷"],
      ["grin", "beam", "joy", "rofl", "smile", "innocent", "fine", "wink", "heart eyes", "kiss", "wink tongue", "zany", "cool", "nerd", "think", "sleep", "cry", "sob", "steam", "angry", "mind blown", "scream", "hug", "party", "cowboy", "mask"],
    ),
  ),
  pack(
    "hands",
    "Hands",
    row(
      ["👍", "👎", "👏", "🙌", "🙏", "🤝", "✌️", "🤞", "🤟", "🤘", "👌", "👊", "👋", "💪", "🫶", "✍️"],
      ["yes", "no", "clap", "hooray", "please", "deal", "peace", "luck", "love you", "horns", "ok", "fist", "wave", "strong", "heart hands", "write"],
    ),
  ),
  pack(
    "hearts",
    "Hearts",
    row(
      ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💖", "💗", "💘", "💝", "💞"],
      ["red", "orange", "yellow", "green", "blue", "purple", "black", "white", "broken", "exclaim", "two", "sparkle", "growing", "arrow", "gift", "revolving"],
    ),
  ),
  pack(
    "food",
    "Food",
    row(
      ["🍎", "🍊", "🍋", "🍉", "🍇", "🍓", "🥑", "🍅", "🥕", "🍞", "🧀", "🍕", "🍔", "🌮", "🍣", "🍜", "☕", "🍵", "🍺", "🍷", "🎂", "🍪"],
      ["apple", "orange", "lemon", "melon", "grapes", "berry", "avocado", "tomato", "carrot", "bread", "cheese", "pizza", "burger", "taco", "sushi", "noodles", "coffee", "tea", "beer", "wine", "cake", "cookie"],
    ),
  ),
  pack(
    "sky",
    "Sky",
    row(
      ["☀️", "🌙", "⭐", "🌟", "🌈", "☁️", "🌧️", "⛈️", "❄️", "🔥", "💧", "🌊", "🌸", "🌻", "🍀", "⚡"],
      ["sun", "moon", "star", "glow", "rainbow", "cloud", "rain", "storm", "snow", "fire", "drop", "wave", "blossom", "sunflower", "clover", "bolt"],
    ),
  ),
  pack(
    "animals",
    "Animals",
    row(
      ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐔", "🐧", "🐦", "🐟", "🐝", "🦋"],
      ["dog", "cat", "mouse", "rabbit", "fox", "bear", "panda", "koala", "tiger", "lion", "frog", "monkey", "hen", "penguin", "bird", "fish", "bee", "butterfly"],
    ),
  ),
  pack(
    "marks",
    "Marks",
    row(
      ["✅", "❌", "⭐", "💯", "🎉", "🎁", "📌", "💡", "📚", "✏️", "🕒", "✈️", "🏠", "💰", "🛒", "📎", "🔔", "💬"],
      ["done", "no", "star", "hundred", "party", "gift", "pin", "idea", "books", "pencil", "clock", "flight", "home", "money", "cart", "clip", "bell", "chat"],
    ),
  ),
  pack(
    "joy",
    "Joy",
    row(
      ["(＾▽＾)", "(´∀｀)", "ヽ(>∀<☆)", "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "(づ｡◕‿‿◕｡)づ", "٩(◕‿◕｡)۶", "＼(＾▽＾)／", "(≧▽≦)"],
      ["cheerful", "content", "spark", "throw", "hug", "fist pump", "yay", "gleeful"],
    ),
  ),
  pack(
    "shrug",
    "Shrug",
    row(
      ["¯\\_(ツ)_/¯", "╮(╯▽╰)╭", "ヽ(ー_ー )ノ", "(¬_¬)", "(；一_一)", "(￣ヘ￣)", "(・_・;)", "┐(￣ヘ￣)┌"],
      ["shrug", "hands up", "whatever", "side eye", "unamused", "hmph", "sweat", "oh well"],
    ),
  ),
  pack(
    "love",
    "Love",
    row(
      ["(´▽`ʃ♡ƪ)", "(♡°▽°♡)", "(｡♥‿♥｡)", "♡(ŐωŐ人)", "(づ￣ ³￣)づ", "(✿◠‿◠)", "(｡･ω･｡)ﾉ♡", "(*˘︶˘*).｡.:*♡"],
      ["shy love", "heart face", "soft", "offer", "kiss", "blossom", "wave love", "blush"],
    ),
  ),
  pack(
    "cry",
    "Cry",
    row(
      ["(╯︵╰,)", "(ಥ﹏ಥ)", "(；ω；)", "(╥_╥)", "(ノД`)・゜・。", "（；へ：）", "(╯°□°)╯", "(ಥ_ಥ)"],
      ["slump", "tears", "soft cry", "sob", "wail", "sad", "flail", "weep"],
    ),
  ),
  pack(
    "greet",
    "Greet",
    row(
      ["(￣▽￣)ノ", "ヾ(＾∇＾)", "(＾∇＾)ﾉ", "(・∀・)ノ", "(^_^)/", "(ノ・ω・)ノ", "(*^▽^*)", "(￣ω￣)"],
      ["wave", "hey", "hi", "hello", "salute", "both hands", "happy", "calm"],
    ),
  ),
  pack(
    "flip",
    "Flip",
    row(
      ["(╯°□°）╯︵ ┻━┻", "┬─┬ノ( º _ ºノ)", "(ノ°Д°）ノ︵ ┻━┻", "(╯°□°)╯︵ ┻━┻", "┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻", "(ノಠ益ಠ)ノ彡┻━┻"],
      ["flip", "put back", "throw", "rage flip", "double flip", "furious"],
    ),
  ),
];

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VocabularyWord {
  word: string;
  phonetic: string;
  meaning: string;
  emoji: string;
  exampleSentence: string;
  exampleMeaning: string;
}

export interface SpeakingQuestion {
  question: string;
  translation: string;
  emoji?: string;
  hint: string;
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  vocabulary: VocabularyWord[];
  grammarStructures: {
    pattern: string;
    description: string;
    explanationVi: string;
    scrambledQuestions: {
      words: string[];
      correct: string;
      hintVi: string;
    }[];
  };
  speakingQuestions?: SpeakingQuestion[];
}

export interface DialogueCharacter {
  id: string;
  name: string;
  avatar: string;
  roleDescription: string;
  roleDescriptionVi: string;
  greeting: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  assessment?: {
    score: number;
    pronunciation: "Excellent" | "Good" | "Needs Practice";
    vocabulary: "Mastered" | "Review needed";
    grammar: "Correct" | "Fix: " | string;
    advice: string;
  };
}

export interface SectionAssessment {
  score: number;
  completed: boolean;
}

export interface UnitAssessment {
  vocabulary?: SectionAssessment;
  grammar?: SectionAssessment;
  speaking?: SectionAssessment;
  starsRating?: number; // 0 to 5 stars
}

export interface UserProgress {
  stars: number;
  completedUnits: string[];
  quizScores: Record<string, number>; // unitId -> highscore
  unitAssessments?: Record<string, UnitAssessment>;
}

export const CHARACTERS: DialogueCharacter[] = [
  {
    id: "mentor",
    name: "LeeGo Smart Mentor",
    avatar: "🤖",
    roleDescription: "Friendly and smart AI Teacher who guides your study.",
    roleDescriptionVi: "Giáo viên AI thông thái, tận tâm hướng dẫn con học tiếng Anh.",
    greeting: "Hello, little friend! I am LeeGo Smart Mentor. What's your name and how are you today?"
  },
  {
    id: "danny",
    name: "Danny",
    avatar: "👦",
    roleDescription: "An energetic boy from Everybody Up who loves adventures.",
    roleDescriptionVi: "Cậu bạn Danny năng động, thích phiêu lưu và vui tính.",
    greeting: "Hi! I'm Danny. Let's practice English together! What is your favorite game?"
  },
  {
    id: "emma",
    name: "Emma",
    avatar: "👧",
    roleDescription: "A smart, friendly girl who loves animals and reading.",
    roleDescriptionVi: "Cô bạn Emma thông minh, đáng yêu, yêu động vật và đọc sách.",
    greeting: "Hello! My name is Emma. I am happy to meet you. What animals do you like?"
  },
  {
    id: "julie",
    name: "Julie",
    avatar: "👱‍♀️",
    roleDescription: "A kind and creative girl who loves art and music.",
    roleDescriptionVi: "Cô bạn Julie sáng tạo, yêu thích vẽ tranh và âm nhạc.",
    greeting: "Hi there! I'm Julie. I love drawing pictures. Do you like art?"
  },
  {
    id: "mike",
    name: "Mike",
    avatar: "🧑",
    roleDescription: "An athletic boy who loves playing sports and climbing.",
    roleDescriptionVi: "Cậu bạn Mike khỏe khoắn, rất đam mê thể thao và vận động.",
    greeting: "Hey! I'm Mike. I love playing soccer! Do you play soccer on Mondays?"
  }
];

export const SYLLABUS_DATA: Unit[] = [
  {
    id: "classroom_verbs",
    title: "Welcome & Classroom Verbs",
    subtitle: "Các ngày trong tuần & Động từ lớp học",
    vocabulary: [
      { word: "read", phonetic: "/riːd/", meaning: "đọc", emoji: "📖", exampleSentence: "Read your book, please.", exampleMeaning: "Làm ơn hãy đọc sách của con." },
      { word: "write", phonetic: "/raɪt/", meaning: "viết", emoji: "✍️", exampleSentence: "Write your name, please.", exampleMeaning: "Làm ơn hãy viết tên của con." },
      { word: "spell", phonetic: "/spel/", meaning: "đánh vần", emoji: "🗣️", exampleSentence: "Spell the word, please.", exampleMeaning: "Làm ơn đánh vần từ này nhé." },
      { word: "come to the board", phonetic: "/kʌm tuː ðə bɔːd/", meaning: "lên bảng", emoji: "🧑‍🏫", exampleSentence: "Come to the board, please.", exampleMeaning: "Làm ơn đi lên bảng con nhé." },
      { word: "open your book", phonetic: "/ˈəʊ.pən jɔː bʊk/", meaning: "mở sách ra", emoji: "📖↗️", exampleSentence: "Open your book, please.", exampleMeaning: "Làm ơn hãy mở sách của con ra." },
      { word: "close your book", phonetic: "/kləʊz jɔː bʊk/", meaning: "đóng sách lại", emoji: "📖↙️", exampleSentence: "Close your book, please.", exampleMeaning: "Làm ơn đóng sách của con lại." },
      { word: "Sunday", phonetic: "/ˈsʌn.deɪ/", meaning: "Chủ Nhật", emoji: "📅🏡", exampleSentence: "Today is Sunday.", exampleMeaning: "Hôm nay là Chủ Nhật." },
      { word: "Monday", phonetic: "/ˈmʌn.deɪ/", meaning: "Thứ Hai", emoji: "📅🏫", exampleSentence: "I go to school on Monday.", exampleMeaning: "Con đi học vào thứ Hai." },
      { word: "Wednesday", phonetic: "/ˈwenz.deɪ/", meaning: "Thứ Tư", emoji: "📅", exampleSentence: "We learn English on Wednesday.", exampleMeaning: "Chúng mình học tiếng Anh vào thứ Tư." },
      { word: "Thursday", phonetic: "/ˈθɜːz.deɪ/", meaning: "Thứ Năm", emoji: "📅", exampleSentence: "Thursday is in the middle of the week.", exampleMeaning: "Thứ Năm nằm ở giữa tuần." },
      { word: "Friday", phonetic: "/ˈfraɪ.deɪ/", meaning: "Thứ Sáu", emoji: "📅🎈", exampleSentence: "Friday is fun.", exampleMeaning: "Thứ Sáu thật là vui vẻ." }
    ],
    grammarStructures: {
      pattern: "What day is it today? It's [Day].",
      description: "Asking and telling the day of the week & using classroom verbs gently.",
      explanationVi: "Hỏi và trả lời về các thứ trong tuần bằng mẫu câu: What day is it today? -> It's [Day]. Và dùng động từ nguyên mẫu đứng đầu câu để đưa ra lời yêu cầu lịch sự, có thêm 'please'.",
      scrambledQuestions: [
        { words: ["What", "day", "is", "it", "today", "?"], correct: "What day is it today ?", hintVi: "Hôm nay là thứ mấy thế?" },
        { words: ["It's", "Sunday", "."], correct: "It's Sunday .", hintVi: "Hôm nay là Chủ Nhật." },
        { words: ["your", "Open", "book", "please", "."], correct: "Open your book please .", hintVi: "Làm ơn hãy mở sách của con ra." },
        { words: ["the", "word", "Spell", "please", "."], correct: "Spell the word please .", hintVi: "Làm ơn đánh vần từ đó nhé." }
      ]
    }
  },
  {
    id: "unit1",
    title: "Unit 1: How We Feel",
    subtitle: "Cảm xúc (Feelings) & Giác quan (The Senses)",
    vocabulary: [
      { word: "happy", phonetic: "/ˈhæp.i/", meaning: "vui vẻ, hạnh phúc", emoji: "😊", exampleSentence: "I am happy today.", exampleMeaning: "Hôm nay tớ cảm thấy vui vẻ." },
      { word: "sad", phonetic: "/sæd/", meaning: "buồn bã", emoji: "😢", exampleSentence: "I am not sad.", exampleMeaning: "Tớ không buồn bã." },
      { word: "hot", phonetic: "/hɒt/", meaning: "nóng nực", emoji: "🥵", exampleSentence: "He feels hot.", exampleMeaning: "Cậu ấy cảm thấy nóng." },
      { word: "cold", phonetic: "/kəʊld/", meaning: "lạnh giá", emoji: "🥶", exampleSentence: "She feels cold.", exampleMeaning: "Cô ấy cảm thấy lạnh." },
      { word: "thirsty", phonetic: "/ˈθɜː.sti/", meaning: "khát nước", emoji: "🥛", exampleSentence: "I am thirsty.", exampleMeaning: "Tớ đang khát nước." },
      { word: "sick", phonetic: "/sɪk/", meaning: "ốm, bệnh", emoji: "🤒", exampleSentence: "He is sick.", exampleMeaning: "Cậu ấy bị ốm rồi." },
      { word: "tired", phonetic: "/taɪəd/", meaning: "mệt mỏi", emoji: "🥱", exampleSentence: "She is tired.", exampleMeaning: "Cô ấy mệt mỏi." },
      { word: "bored", phonetic: "/bɔːd/", meaning: "chán nản", emoji: "😑", exampleSentence: "Is he bored?", exampleMeaning: "Cậu ấy có chán không?" },
      { word: "excited", phonetic: "/ɪkˈsaɪ.tɪd/", meaning: "hào hứng, phấn khích", emoji: "🤩", exampleSentence: "We are excited.", exampleMeaning: "Chúng tớ rất phấn khích." },
      { word: "see", phonetic: "/siː/", meaning: "nhìn thấy (thị giác)", emoji: "👀", exampleSentence: "What can she see?", exampleMeaning: "Cô ấy có thể nhìn thấy gì?" },
      { word: "hear", phonetic: "/hɪər/", meaning: "nghe thấy (thính giác)", emoji: "👂", exampleSentence: "He can hear a dog.", exampleMeaning: "Cậu ấy nghe thấy một chú chó sủa." },
      { word: "smell", phonetic: "/smel/", meaning: "ngửi thấy (khứu giác)", emoji: "👃", exampleSentence: "I can smell a flower.", exampleMeaning: "Tớ ngửi thấy một bông hoa." },
      { word: "taste", phonetic: "/teɪst/", meaning: "nếm thấy (vị giác)", emoji: "👅", exampleSentence: "She can taste the soup.", exampleMeaning: "Cô ấy có thể nếm món súp." }
    ],
    grammarStructures: {
      pattern: "I am happy. I am not sad. Are you happy? Yes, I am. / No, I'm not.",
      description: "Describing how people feel, asking questions, and expressing sensory abilities.",
      explanationVi: "Để mô tả cảm xúc: I am / He is / She is + tính từ. Câu hỏi nghi vấn: Are you...? -> Yes, I am. / No, I'm not. Với giác quan dùng cấu trúc: What can he/she see? -> He/She can see a [object].",
      scrambledQuestions: [
        { words: ["happy", "am", "I", "."], correct: "I am happy .", hintVi: "Tớ cảm thấy vui vẻ." },
        { words: ["sad", "I", "not", "am", "."], correct: "I am not sad .", hintVi: "Tớ không cảm thấy buồn bã." },
        { words: ["Is", "sick", "she", "?"], correct: "Is she sick ?", hintVi: "Cô ấy có bị ốm không?" },
        { words: ["can", "What", "she", "see", "?"], correct: "What can she see ?", hintVi: "Cô ấy có thể nhìn thấy gì?" },
        { words: ["see", "He", "can", "a", "bird", "."], correct: "He can see a bird .", hintVi: "Cậu ấy có thể thấy một chú chim." }
      ]
    }
  },
  {
    id: "unit2",
    title: "Unit 2: In Town",
    subtitle: "Nghề nghiệp (Jobs) & Địa điểm trong thị trấn (Places)",
    vocabulary: [
      { word: "doctor", phonetic: "/ˈdɒk.tər/", meaning: "bác sĩ", emoji: "🧑‍⚕️", exampleSentence: "He is a doctor.", exampleMeaning: "Cậu ấy là bác sĩ." },
      { word: "teacher", phonetic: "/ˈtiː.tʃər/", meaning: "giáo viên", emoji: "🧑‍🏫", exampleSentence: "Is she a teacher?", exampleMeaning: "Cô ấy có phải là giáo viên không?" },
      { word: "student", phonetic: "/ˈstjuː.dənt/", meaning: "học sinh", emoji: "🧑‍🎓", exampleSentence: "He is a student.", exampleMeaning: "Cậu ấy là học sinh." },
      { word: "pilot", phonetic: "/ˈpaɪ.lət/", meaning: "phi công", emoji: "🧑‍✈️", exampleSentence: "She is a pilot.", exampleMeaning: "Cô ấy là phi công." },
      { word: "cook", phonetic: "/kʊk/", meaning: "đầu bếp", emoji: "🧑‍🍳", exampleSentence: "He is a cook.", exampleMeaning: "Cậu ấy là đầu bếp." },
      { word: "police officer", phonetic: "/pəˈliːs ˌɒf.ɪ.sər/", meaning: "cảnh sát", emoji: "👮", exampleSentence: "They are police officers.", exampleMeaning: "Họ là cảnh sát." },
      { word: "firefighter", phonetic: "/ˈfaɪə.faɪ.tər/", meaning: "lính cứu hỏa", emoji: "🧑‍🚒", exampleSentence: "They aren't firefighters.", exampleMeaning: "Họ không phải lính cứu hỏa." },
      { word: "soccer player", phonetic: "/ˈsɒk.ər ˈpleɪ.ər/", meaning: "cầu thủ bóng đá", emoji: "⚽", exampleSentence: "He is a famous soccer player.", exampleMeaning: "Cậu ấy là cầu thủ bóng đá nổi tiếng." },
      { word: "hospital", phonetic: "/ˈhɒs.pɪ.təl/", meaning: "bệnh viện", emoji: "🏥", exampleSentence: "Where's the doctor?", exampleMeaning: "Bác sĩ đang ở đâu?" },
      { word: "school", phonetic: "/skuːl/", meaning: "trường học", emoji: "🏫", exampleSentence: "The student is at school.", exampleMeaning: "Học sinh đang ở trường học." },
      { word: "home", phonetic: "/həʊm/", meaning: "nhà, tổ ấm", emoji: "🏠", exampleSentence: "She is at home.", exampleMeaning: "Cô ấy đang ở nhà." }
    ],
    grammarStructures: {
      pattern: "Is he/she a doctor? Yes, he/she is. Where's the doctor? He's/She's at the hospital.",
      description: "Talking about individual and plural jobs, and identifying people's location in town.",
      explanationVi: "Để hỏi về nghề nghiệp số ít: Is he/she a...? -> Yes, he/she is. / No, he/she isn't. Hỏi về địa điểm của ai đó: Where's the...? -> He's/She's at the...",
      scrambledQuestions: [
        { words: ["doctor", "he", "Is", "a", "?"], correct: "Is he a doctor ?", hintVi: "Cậu ấy có phải là bác sĩ không?" },
        { words: ["she", "Is", "teacher", "a", "?"], correct: "Is she a teacher ?", hintVi: "Cô ấy có phải là giáo viên không?" },
        { words: ["Where's", "doctor", "the", "?"], correct: "Where's the doctor ?", hintVi: "Bác sĩ đang ở đâu thế?" },
        { words: ["He's", "at", "hospital", "the", "."], correct: "He's at the hospital .", hintVi: "Bác sĩ đang ở bệnh viện." }
      ]
    }
  },
  {
    id: "unit3",
    title: "Unit 3: Things to Eat",
    subtitle: "Đồ ăn (Food), Trái cây (Fruit) & Sản phẩm bơ sữa (Dairy Products)",
    vocabulary: [
      { word: "salad", phonetic: "/ˈsæl.əd/", meaning: "xa-lách, rau trộn", emoji: "🥗", exampleSentence: "I don't want salad.", exampleMeaning: "Tớ không muốn ăn rau trộn." },
      { word: "spaghetti", phonetic: "/spəˈɡet.i/", meaning: "mỳ Ý", emoji: "🍝", exampleSentence: "He wants spaghetti.", exampleMeaning: "Cậu ấy muốn ăn mỳ Ý." },
      { word: "french fries", phonetic: "/ˌfrentʃ ˈfraɪz/", meaning: "khoai tây chiên", emoji: "🍟", exampleSentence: "She doesn't want french fries.", exampleMeaning: "Cô ấy không muốn ăn khoai tây chiên." },
      { word: "steak", phonetic: "/steɪk/", meaning: "bít tết", emoji: "🥩", exampleSentence: "He wants steak.", exampleMeaning: "Cậu ấy muốn ăn bít tết." },
      { word: "eggs", phonetic: "/eɡz/", meaning: "những quả trứng", emoji: "🥚", exampleSentence: "Do you want eggs?", exampleMeaning: "Cậu có muốn ăn trứng không?" },
      { word: "apple", phonetic: "/ˈæp.əl/", meaning: "quả táo", emoji: "🍎", exampleSentence: "Do you want an apple?", exampleMeaning: "Cậu có muốn một quả táo không?" },
      { word: "banana", phonetic: "/bəˈnɑː.nə/", meaning: "quả chuối", emoji: "🍌", exampleSentence: "She has bananas.", exampleMeaning: "Cô ấy có chuối." },
      { word: "orange", phonetic: "/ˈɒr.ɪndʒ/", meaning: "quả cam", emoji: "🍊", exampleSentence: "He doesn't have oranges.", exampleMeaning: "Cậu ấy không có cam." },
      { word: "peach", phonetic: "/piːtʃ/", meaning: "quả đào", emoji: "🍑", exampleSentence: "Do you have peaches?", exampleMeaning: "Cậu có quả đào nào không?" },
      { word: "milk", phonetic: "/mɪlk/", meaning: "sữa", emoji: "🥛", exampleSentence: "Do you like milk?", exampleMeaning: "Cậu có thích sữa không?" },
      { word: "yogurt", phonetic: "/ˈjɒɡ.ət/", meaning: "sữa chua", emoji: "🥣", exampleSentence: "Yes, I do.", exampleMeaning: "Có, tớ thích." },
      { word: "cheese", phonetic: "/tʃiːz/", meaning: "phô mai", emoji: "🧀", exampleSentence: "No, I don't.", exampleMeaning: "Không, tớ không thích." }
    ],
    grammarStructures: {
      pattern: "I want soup. I don't want soup. Do you want an apple? Yes, please. Do you like milk? Yes, I do.",
      description: "Expressing wants, asking others about food choices, and stating likes/dislikes of dairy products.",
      explanationVi: "Để nói nhu cầu bản thân dùng: I want... / I don't want... Khi hỏi lịch sự mời mọc dùng: Do you want an apple? -> Yes, please. / No, thank you. Hỏi sở thích: Do you like...? -> Yes, I do. / No, I don't.",
      scrambledQuestions: [
        { words: ["soup", "I", "want", "."], correct: "I want soup .", hintVi: "Tớ muốn ăn súp." },
        { words: ["don't", "want", "I", "salad", "."], correct: "I don't want salad .", hintVi: "Tớ không muốn ăn rau trộn." },
        { words: ["an", "Do", "want", "you", "apple", "?"], correct: "Do you want an apple ?", hintVi: "Bạn có muốn ăn một quả táo không?" },
        { words: ["please", "Yes", ","], correct: "Yes please ,", hintVi: "Vâng, làm ơn." },
        { words: ["Do", "like", "you", "milk", "?"], correct: "Do you like milk ?", hintVi: "Bạn có thích sữa không?" }
      ]
    }
  },
  {
    id: "unit4",
    title: "Unit 4: Things to Wear",
    subtitle: "Quần áo (Clothes) & Trang phục phụ kiện (Wearables)",
    vocabulary: [
      { word: "shirt", phonetic: "/ʃɜːt/", meaning: "áo sơ mi", emoji: "👔", exampleSentence: "He's wearing a shirt.", exampleMeaning: "Cậu ấy đang mặc một chiếc áo sơ mi." },
      { word: "dress", phonetic: "/dres/", meaning: "váy đầm", emoji: "👗", exampleSentence: "She's wearing a dress.", exampleMeaning: "Cô ấy đang mặc một chiếc váy đầm." },
      { word: "skirt", phonetic: "/skɜːt/", meaning: "chân váy", emoji: "🥻", exampleSentence: "She is wearing a blue skirt.", exampleMeaning: "Cô ấy đang mặc một chiếc chân váy màu xanh." },
      { word: "pants", phonetic: "/pænts/", meaning: "quần dài", emoji: "👖", exampleSentence: "He is wearing pants.", exampleMeaning: "Cậu ấy đang mặc quần dài." },
      { word: "socks", phonetic: "/sɒks/", meaning: "đôi tất", emoji: "🧦", exampleSentence: "She's wearing white socks.", exampleMeaning: "Cô ấy đang đi đôi tất màu trắng." },
      { word: "shoes", phonetic: "/ʃuːz/", meaning: "đôi giày", emoji: "👞", exampleSentence: "They are wearing shoes.", exampleMeaning: "Họ đang đi giày." },
      { word: "cap", phonetic: "/kæp/", meaning: "mũ lưỡi trai", emoji: "🧢", exampleSentence: "I'm wearing a red cap.", exampleMeaning: "Tớ đang đội một chiếc mũ lưỡi trai màu đỏ." },
      { word: "T-shirt", phonetic: "/ˈtiː.ʃɜːt/", meaning: "áo phông, áo thun", emoji: "👕", exampleSentence: "What is he wearing?", exampleMeaning: "Cậu ấy đang mặc gì thế?" },
      { word: "shorts", phonetic: "/ʃɔːts/", meaning: "quần soóc, quần đùi", emoji: "🩳", exampleSentence: "We are wearing green shorts.", exampleMeaning: "Chúng tớ đang mặc quần đùi màu xanh." },
      { word: "sneakers", phonetic: "/ˈsniː.kəz/", meaning: "giày thể thao", emoji: "👟", exampleSentence: "He's wearing sneakers.", exampleMeaning: "Cậu ấy đang đi giày thể thao." },
      { word: "hat", phonetic: "/hæt/", meaning: "mũ rộng vành", emoji: "👒", exampleSentence: "Is he wearing a hat?", exampleMeaning: "Cậu ấy có đang đội mũ không?" },
      { word: "coat", phonetic: "/kəʊt/", meaning: "áo khoác", emoji: "🧥", exampleSentence: "She is wearing a warm coat.", exampleMeaning: "Cô ấy đang mặc một chiếc áo khoác ấm." },
      { word: "sweater", phonetic: "/ˈswet.ər/", meaning: "áo len", emoji: "👚", exampleSentence: "Is she wearing a sweater?", exampleMeaning: "Cô ấy có đang mặc áo len không?" },
      { word: "boots", phonetic: "/buːts/", meaning: "đôi ủng, đôi bốt", emoji: "👢", exampleSentence: "No, she isn't.", exampleMeaning: "Không, cô ấy không mặc." }
    ],
    grammarStructures: {
      pattern: "What's he/she wearing? He's/She's wearing [clothes]. What are you wearing? I'm wearing...",
      description: "Asking and describing what clothes someone is currently wearing, with singular/plural targets.",
      explanationVi: "Để hỏi về trang phục đang mặc: What is he/she wearing? -> He's/She's wearing a [singular clothing] / [plural clothing]. Nếu hỏi bản thân: What are you wearing? -> I'm wearing... / We're wearing...",
      scrambledQuestions: [
        { words: ["wearing", "What's", "he", "?"], correct: "What's he wearing ?", hintVi: "Cậu ấy đang mặc gì thế?" },
        { words: ["wearing", "She's", "dress", "a", "."], correct: "She's wearing a dress .", hintVi: "Cô ấy đang mặc một chiếc váy đầm." },
        { words: ["wearing", "What", "are", "you", "?"], correct: "What are you wearing ?", hintVi: "Con đang mặc đồ gì thế?" },
        { words: ["I'm", "wearing", "red", "cap", "a", "."], correct: "I'm wearing a red cap .", hintVi: "Tớ đang đội một chiếc mũ lưỡi trai màu đỏ." },
        { words: ["she", "Is", "sweater", "a", "wearing", "?"], correct: "Is she wearing a sweater ?", hintVi: "Cô ấy có đang mặc áo len không?" }
      ]
    }
  },
  {
    id: "unit5",
    title: "Unit 5: Things to Do",
    subtitle: "Hành động (Actions) & Hoạt động giải trí (Activities)",
    vocabulary: [
      { word: "read", phonetic: "/riːd/", meaning: "đọc", emoji: "📖", exampleSentence: "I'm reading.", exampleMeaning: "Tớ đang đọc sách." },
      { word: "write", phonetic: "/raɪt/", meaning: "viết", emoji: "✍️", exampleSentence: "He's writing.", exampleMeaning: "Cậu ấy đang viết bài." },
      { word: "draw", phonetic: "/drɔː/", meaning: "vẽ", emoji: "🎨", exampleSentence: "She isn't drawing.", exampleMeaning: "Cô ấy đang không vẽ." },
      { word: "talk", phonetic: "/tɔːk/", meaning: "nói chuyện", emoji: "💬", exampleSentence: "What are you doing?", exampleMeaning: "Cậu đang làm gì thế?" },
      { word: "sing", phonetic: "/sɪŋ/", meaning: "hát", emoji: "🎤", exampleSentence: "He is singing.", exampleMeaning: "Cậu ấy đang hát." },
      { word: "dance", phonetic: "/dɑːns/", meaning: "nhảy múa", emoji: "💃", exampleSentence: "She is dancing.", exampleMeaning: "Cô ấy đang nhảy múa." },
      { word: "eat", phonetic: "/iːt/", meaning: "ăn", emoji: "🍽️", exampleSentence: "We're eating.", exampleMeaning: "Chúng tớ đang ăn." },
      { word: "drink", phonetic: "/drɪŋk/", meaning: "uống", emoji: "🥤", exampleSentence: "They aren't drinking.", exampleMeaning: "Họ đang không uống." },
      { word: "sleep", phonetic: "/sliːp/", meaning: "ngủ", emoji: "😴", exampleSentence: "He is sleeping.", exampleMeaning: "Cậu ấy đang ngủ." },
      { word: "play", phonetic: "/pleɪ/", meaning: "chơi đùa", emoji: "🧸", exampleSentence: "What are they doing?", exampleMeaning: "Họ đang làm gì thế?" },
      { word: "play the guitar", phonetic: "/pleɪ ðə ɡɪˈtɑːr/", meaning: "chơi đàn ghi-ta", emoji: "🎸", exampleSentence: "Is he playing the guitar?", exampleMeaning: "Cậu ấy có đang chơi đàn ghi-ta không?" },
      { word: "listen to music", phonetic: "/ˈlɪs.ən tuː ˈmjuː.zɪk/", meaning: "nghe nhạc", emoji: "🎧", exampleSentence: "They are listening to music.", exampleMeaning: "Họ đang nghe nhạc." },
      { word: "watch TV", phonetic: "/wɒtʃ ˌtiːˈviː/", meaning: "xem tivi", emoji: "📺", exampleSentence: "She is watching TV.", exampleMeaning: "Cô ấy đang xem tivi." },
      { word: "do homework", phonetic: "/duː ˈhəʊm.wɜːk/", meaning: "làm bài tập về nhà", emoji: "📝", exampleSentence: "We are doing homework.", exampleMeaning: "Chúng tớ đang làm bài tập về nhà." }
    ],
    grammarStructures: {
      pattern: "What are you doing? I'm reading. What's he/she doing? He/She's... Is he/she playing the guitar?",
      description: "Using Present Continuous tense to express what someone is doing right now.",
      explanationVi: "Để mô tả các hành động đang diễn ra tại thời điểm nói: S + am/is/are + V-ing. Hỏi thăm hành động: What are you/they doing? -> We're/They're [doing]. What is he/she doing? -> He/She is [doing]. Hỏi nghi vấn: Is he/she [doing]? -> Yes, he/she is. / No, he/she isn't.",
      scrambledQuestions: [
        { words: ["doing", "What", "are", "you", "?"], correct: "What are you doing ?", hintVi: "Cậu đang làm gì thế?" },
        { words: ["reading", "I'm", "."], correct: "I'm reading .", hintVi: "Tớ đang đọc sách." },
        { words: ["doing", "What's", "he", "?"], correct: "What's he doing ?", hintVi: "Cậu ấy đang làm gì thế?" },
        { words: ["writing", "is", "He", "."], correct: "He is writing .", hintVi: "Cậu ấy đang viết bài." },
        { words: ["playing", "Is", "guitar", "she", "the", "?"], correct: "Is she playing the guitar ?", hintVi: "Cô ấy có đang chơi đàn ghi-ta không?" }
      ]
    }
  },
  {
    id: "unit6",
    title: "Unit 6: Home",
    subtitle: "Đồ đạc (Things at Home), Phòng ốc (Rooms) & Số đếm (0-100)",
    vocabulary: [
      { word: "bed", phonetic: "/bed/", meaning: "chiếc giường", emoji: "🛏️", exampleSentence: "There's a bed next to the bookshelf.", exampleMeaning: "Có một chiếc giường ở cạnh giá sách." },
      { word: "bookshelf", phonetic: "/ˈbʊk.ʃelf/", meaning: "giá sách, kệ sách", emoji: "📚", exampleSentence: "The books are on the bookshelf.", exampleMeaning: "Những cuốn sách ở trên giá sách." },
      { word: "table", phonetic: "/ˈteɪ.bəl/", meaning: "cái bàn", emoji: "┯", exampleSentence: "Is there a computer on the table?", exampleMeaning: "Có máy tính ở trên bàn không?" },
      { word: "sofa", phonetic: "/ˈsəʊ.fə/", meaning: "ghế sô-fa", emoji: "🛋️", exampleSentence: "The sofa is soft.", exampleMeaning: "Chiếc ghế sô-fa thật mềm mại." },
      { word: "clock", phonetic: "/klɒk/", meaning: "đồng hồ treo tường", emoji: "⏰", exampleSentence: "The clock is on the wall.", exampleMeaning: "Đồng hồ ở trên tường." },
      { word: "bedroom", phonetic: "/ˈbed.ruːm/", meaning: "phòng ngủ", emoji: "🛏️🧸", exampleSentence: "There's one bed in the bedroom.", exampleMeaning: "Có một chiếc giường trong phòng ngủ." },
      { word: "bathroom", phonetic: "/ˈbɑːθ.ruːm/", meaning: "phòng tắm", emoji: "🛁", exampleSentence: "He's in the bathroom.", exampleMeaning: "Cậu ấy ở trong phòng tắm." },
      { word: "living room", phonetic: "/ˈlɪv.ɪŋ ˌruːm/", meaning: "phòng khách", emoji: "🛋️✨", exampleSentence: "The living room's messy!", exampleMeaning: "Phòng khách lộn xộn quá!" },
      { word: "kitchen", phonetic: "/ˈkɪtʃ.ən/", meaning: "nhà bếp", emoji: "🍳", exampleSentence: "Mom is cooking in the kitchen.", exampleMeaning: "Mẹ đang nấu ăn trong nhà bếp." }
    ],
    grammarStructures: {
      pattern: "There is a bed next to the bookshelf. Are there two beds in the bedroom? How many pencils are there? There are 24 pencils.",
      description: "Describing singular/plural furniture and rooms using 'There is/are', positions, and counting 0-100.",
      explanationVi: "Để mô tả số lượng đồ vật trong phòng: There is a... in... (có 1 cái), There are [number]... in... (có nhiều cái). Hỏi số lượng dùng mẫu câu: How many [plural noun] are there? -> There are [number] [plural noun].",
      scrambledQuestions: [
        { words: ["a", "There's", "bed", "next", "to", "bookshelf", "the", "."], correct: "There's a bed next to the bookshelf .", hintVi: "Có một chiếc giường ở bên cạnh giá sách." },
        { words: ["there", "Is", "bed", "a", "next", "to", "bookshelf", "the", "?"], correct: "Is there a bed next to the bookshelf ?", hintVi: "Có một chiếc giường ở bên cạnh giá sách không?" },
        { words: ["two", "beds", "Are", "there", "in", "bedroom", "the", "?"], correct: "Are there two beds in the bedroom ?", hintVi: "Có hai chiếc giường trong phòng ngủ không?" },
        { words: ["many", "pencils", "How", "there", "are", "?"], correct: "How many pencils are there ?", hintVi: "Có bao nhiêu bút chì ở đó thế?" },
        { words: ["twenty-four", "There", "are", "pencils", "."], correct: "There are twenty-four pencils .", hintVi: "Có 24 chiếc bút chì." }
      ]
    }
  },
  {
    id: "unit7",
    title: "Unit 7: My Day",
    subtitle: "Giờ giấc (Time), Bữa ăn (Meals) & Lịch trình (Daily Routine)",
    vocabulary: [
      { word: "one o'clock", phonetic: "/wʌn əˈklɒk/", meaning: "một giờ đúng", emoji: "🕐", exampleSentence: "It's one o'clock.", exampleMeaning: "Bây giờ là một giờ đúng." },
      { word: "one thirty", phonetic: "/wʌn ˈθɜː.ti/", meaning: "một giờ ba mươi", emoji: "🕝", exampleSentence: "What time is it?", exampleMeaning: "Mấy giờ rồi thế?" },
      { word: "two o'clock", phonetic: "/tuː əˈklɒk/", meaning: "hai giờ đúng", emoji: "🕑", exampleSentence: "It's two o'clock.", exampleMeaning: "Bây giờ là hai giờ đúng." },
      { word: "breakfast", phonetic: "/ˈbrek.fəst/", meaning: "bữa ăn sáng", emoji: "🍳", exampleSentence: "When do you eat breakfast?", exampleMeaning: "Khi nào cậu ăn bữa sáng?" },
      { word: "snack", phonetic: "/snæk/", meaning: "bữa ăn xế, đồ ăn nhẹ", emoji: "🍪", exampleSentence: "We eat a snack at three thirty.", exampleMeaning: "Chúng tớ ăn bữa nhẹ lúc ba giờ ba mươi." },
      { word: "dinner", phonetic: "/ˈdɪn.ər/", meaning: "bữa ăn tối", emoji: "🍗", exampleSentence: "When does he eat dinner?", exampleMeaning: "Khi nào cậu ấy ăn tối?" },
      { word: "go to school", phonetic: "/ɡəʊ tuː skuːl/", meaning: "đi học, đến trường", emoji: "🎒", exampleSentence: "When does he go to school?", exampleMeaning: "Khi nào cậu ấy đi học?" },
      { word: "come home", phonetic: "/kʌm həʊm/", meaning: "trở về nhà", emoji: "🏡", exampleSentence: "I come home at four fifteen.", exampleMeaning: "Tớ về nhà lúc bốn giờ mười lăm." },
      { word: "go to bed", phonetic: "/ɡəʊ tuː bed/", meaning: "đi ngủ", emoji: "😴", exampleSentence: "It's time for bed.", exampleMeaning: "Đến giờ đi ngủ rồi." }
    ],
    grammarStructures: {
      pattern: "What time is it? It's one o'clock. When do you eat breakfast? I eat breakfast at seven o'clock.",
      description: "Asking and telling time, meal frequencies, and daily routing questions for third-person subjects.",
      explanationVi: "Hỏi giờ: What time is it? -> It's [time]. Hỏi giờ ăn hoặc hoạt động trong ngày: When do you [activity]? -> I [activity] at [time]. Với ngôi thứ ba: When does he/she [activity]? -> He/She [activity]s at [time] in the morning.",
      scrambledQuestions: [
        { words: ["time", "What", "is", "it", "?"], correct: "What time is it ?", hintVi: "Mấy giờ rồi thế?" },
        { words: ["It's", "one", "fifteen", "."], correct: "It's one fifteen .", hintVi: "Bây giờ là một giờ mười lăm." },
        { words: ["do", "When", "you", "eat", "breakfast", "?"], correct: "When do you eat breakfast ?", hintVi: "Khi nào cậu ăn sáng?" },
        { words: ["breakfast", "I", "eat", "at", "seven", "o'clock", "."], correct: "I eat breakfast at seven o'clock .", hintVi: "Tớ ăn sáng lúc 7 giờ đúng." },
        { words: ["does", "When", "he", "wake", "up", "?"], correct: "When does he wake up ?", hintVi: "Khi nào cậu ấy thức dậy thế?" }
      ]
    }
  },
  {
    id: "unit8",
    title: "Unit 8: My Week",
    subtitle: "Môn học (Subjects), Lớp học phụ khóa (Classes) & Quốc gia (Countries)",
    vocabulary: [
      { word: "science", phonetic: "/ˈsaɪ.əns/", meaning: "môn Khoa học", emoji: "🧪🔬", exampleSentence: "His favorite subject is science.", exampleMeaning: "Môn học yêu thích nhất của cậu ấy là môn Khoa học." },
      { word: "art", phonetic: "/ɑːt/", meaning: "môn Mỹ thuật", emoji: "🎨", exampleSentence: "What's her favorite subject?", exampleMeaning: "Môn học yêu thích của cô ấy là gì?" },
      { word: "math", phonetic: "/mæθ/", meaning: "môn Toán", emoji: "➕➖", exampleSentence: "My favorite subject is math.", exampleMeaning: "Môn học yêu thích của tớ là môn Toán." },
      { word: "music", phonetic: "/ˈmjuː.zɪk/", meaning: "môn Âm nhạc", emoji: "🎵", exampleSentence: "I love music class.", exampleMeaning: "Tớ yêu thích lớp học Âm nhạc." },
      { word: "karate class", phonetic: "/kəˈrɑː.ti klɑːs/", meaning: "lớp học võ ka-ra-te", emoji: "🥋", exampleSentence: "Danny goes to karate class on Mondays.", exampleMeaning: "Danny đi học võ ka-ra-te vào thứ Hai hàng tuần." },
      { word: "dance class", phonetic: "/dɑːns klɑːs/", meaning: "lớp học nhảy/múa", emoji: "💃", exampleSentence: "When does she go to dance class?", exampleMeaning: "Khi nào cô ấy đi học nhảy?" },
      { word: "swimming class", phonetic: "/ˈswɪm.ɪŋ klɑːs/", meaning: "lớp học bơi", emoji: "🏊", exampleSentence: "He goes to swimming class on Tuesdays.", exampleMeaning: "Cậu ấy đi học bơi vào thứ Ba hàng tuần." },
      { word: "English class", phonetic: "/ˈɪŋ.ɡlɪʃ klɑːs/", meaning: "lớp học tiếng Anh", emoji: "🔠", exampleSentence: "We have English class today.", exampleMeaning: "Chúng tớ có tiết học tiếng Anh ngày hôm nay." },
      { word: "Brazil", phonetic: "/brəˈzɪl/", meaning: "nước Bra-xin", emoji: "🇧🇷", exampleSentence: "He is from Brazil.", exampleMeaning: "Cậu ấy đến từ đất nước Bra-xin." },
      { word: "Canada", phonetic: "/ˈkæn.ə.də/", meaning: "nước Ca-na-da", emoji: "🇨🇦", exampleSentence: "Canada is beautiful.", exampleMeaning: "Đất nước Ca-na-da thật xinh đẹp." },
      { word: "South Korea", phonetic: "/ˌsaʊθ kəˈriː.ə/", meaning: "nước Hàn Quốc", emoji: "🇰🇷", exampleSentence: "She is from South Korea.", exampleMeaning: "Cô ấy đến từ Hàn Quốc." }
    ],
    grammarStructures: {
      pattern: "What is his/her favorite subject? It's science. Danny goes to karate class on Mondays. Where's he/she from?",
      description: "Discussing favorite academic subjects, extracurricular schedules, and country origins.",
      explanationVi: "Hỏi môn học ưa thích của ai đó: What's his/her favorite subject? -> It's [subject]. Lịch trình hoạt động hàng tuần: He/She goes to [class] on [Day]s. Hỏi về xuất xứ: Where is he/she from? -> He's/She's from [Country].",
      scrambledQuestions: [
        { words: ["his", "What's", "favorite", "subject", "?"], correct: "What's his favorite subject ?", hintVi: "Môn học yêu thích nhất của cậu ấy là gì?" },
        { words: ["subject", "is", "science", "My", "favorite", "."], correct: "My favorite subject is science .", hintVi: "Môn học yêu thích của tớ là môn Khoa học." },
        { words: ["goes", "Danny", "karate", "to", "class", "on", "Mondays", "."], correct: "Danny goes to karate class on Mondays .", hintVi: "Danny đi học võ karate vào các ngày thứ Hai." },
        { words: ["is", "she", "Where", "from", "?"], correct: "Where is she from ?", hintVi: "Cô ấy đến từ đất nước nào thế?" },
        { words: ["from", "is", "He", "Brazil", "."], correct: "He is from Brazil .", hintVi: "Cậu ấy đến từ nước Bra-xin." }
      ]
    }
  },
  {
    id: "phonics_checkup",
    title: "Phonics & Check Up Units",
    subtitle: "Luyện phát âm ngữ âm (Phonics Checkup)",
    vocabulary: [
      { word: "cave", phonetic: "/keɪv/", meaning: "hang động (âm long a)", emoji: "🧗", exampleSentence: "The bear is in the cave.", exampleMeaning: "Chú gấu đang ở trong hang động." },
      { word: "girl", phonetic: "/ɡɜːl/", meaning: "bạn gái, cô bé", emoji: "👧", exampleSentence: "She is a nice girl.", exampleMeaning: "Cô ấy là một cô bé tốt bụng." },
      { word: "game", phonetic: "/ɡeɪm/", meaning: "trò chơi", emoji: "🎮", exampleSentence: "Let's play a game.", exampleMeaning: "Chúng mình cùng chơi một trò chơi nhé." },
      { word: "jam", phonetic: "/dʒæm/", meaning: "mứt hoa quả", emoji: "🍓", exampleSentence: "I like strawberry jam.", exampleMeaning: "Tớ thích mứt dâu tây." },
      { word: "hippo", phonetic: "/ˈhɪp.əʊ/", meaning: "con hà mã", emoji: "🦛", exampleSentence: "The hippo is in the water.", exampleMeaning: "Hà mã đang ở dưới nước." },
      { word: "hose", phonetic: "/həʊz/", meaning: "vòi nước, ống vòi", emoji: "🚰", exampleSentence: "The firefighter has a hose.", exampleMeaning: "Chú lính cứu hỏa có một cái vòi nước." },
      { word: "king", phonetic: "/kɪŋ/", meaning: "vua, nhà vua", emoji: "👑", exampleSentence: "The king is friendly.", exampleMeaning: "Nhà vua thật thân thiện." },
      { word: "kitten", phonetic: "/ˈkɪt.ən/", meaning: "mèo con", emoji: "🐱", exampleSentence: "The kitten is playing.", exampleMeaning: "Chú mèo con đang chơi đùa." },
      { word: "six", phonetic: "/sɪks/", meaning: "số sáu", emoji: "6️⃣", exampleSentence: "I have six books.", exampleMeaning: "Tớ có sáu cuốn sách." },
      { word: "box", phonetic: "/bɒks/", meaning: "chiếc hộp", emoji: "📦", exampleSentence: "Put toys in the box.", exampleMeaning: "Hãy cất đồ chơi vào trong hộp." },
      { word: "sheep", phonetic: "/ʃiːp/", meaning: "con cừu (âm sh-)", emoji: "🐑", exampleSentence: "The sheep is white.", exampleMeaning: "Con cừu có màu trắng." },
      { word: "shell", phonetic: "/ʃel/", meaning: "vỏ sò (âm sh-)", emoji: "🐚", exampleSentence: "I found a shell.", exampleMeaning: "Tớ đã tìm thấy một cái vỏ sò." },
      { word: "chair", phonetic: "/tʃeər/", meaning: "cái ghế (âm ch-)", emoji: "🪑", exampleSentence: "Sit on the chair, please.", exampleMeaning: "Làm ơn hãy ngồi lên ghế nhé." },
      { word: "chin", phonetic: "/tʃɪn/", meaning: "cái cằm (âm ch-)", emoji: "😏", exampleSentence: "Touch your chin.", exampleMeaning: "Hãy chạm vào cằm của con." },
      { word: "three", phonetic: "/θriː/", meaning: "số ba (âm th-)", emoji: "3️⃣", exampleSentence: "Three little kittens.", exampleMeaning: "Ba chú mèo con tinh nghịch." },
      { word: "think", phonetic: "/θɪŋk/", meaning: "suy nghĩ (âm th-)", emoji: "💭", exampleSentence: "Let me think.", exampleMeaning: "Để tớ suy nghĩ một chút nhé." },
      { word: "whale", phonetic: "/weɪl/", meaning: "cá voi (âm wh-)", emoji: "🐋", exampleSentence: "The whale is swimming.", exampleMeaning: "Cá voi đang bơi dưới biển." },
      { word: "wheel", phonetic: "/wiːl/", meaning: "bánh xe (âm wh-)", emoji: "🎡", exampleSentence: "The wheel is big.", exampleMeaning: "Bánh xe này thật to." },
      { word: "phone", phonetic: "/fəʊn/", meaning: "điện thoại (âm ph-)", emoji: "📱", exampleSentence: "This is my phone.", exampleMeaning: "Đây là chiếc điện thoại của tớ." },
      { word: "photo", phonetic: "/ˈfəʊ.təʊ/", meaning: "bức ảnh (âm ph-)", emoji: "🖼️", exampleSentence: "Look at this photo.", exampleMeaning: "Hãy nhìn vào bức ảnh này xem." },
      { word: "rain", phonetic: "/reɪn/", meaning: "cơn mưa (âm -ai-)", emoji: "🌧️", exampleSentence: "I like the rain.", exampleMeaning: "Tớ thích những cơn mưa." },
      { word: "play", phonetic: "/pleɪ/", meaning: "chơi đùa (âm -ay)", emoji: "🪀", exampleSentence: "Let's play together.", exampleMeaning: "Chúng mình cùng chơi với nhau nhé." },
      { word: "beach", phonetic: "/biːtʃ/", meaning: "bãi biển (âm -ea-)", emoji: "🏖️", exampleSentence: "Let's go to the beach.", exampleMeaning: "Hãy cùng đi biển nào." },
      { word: "candy", phonetic: "/ˈkæn.di/", meaning: "kẹo ngọt (âm -y)", emoji: "🍬", exampleSentence: "Do you like candy?", exampleMeaning: "Cậu có thích ăn kẹo không?" },
      { word: "cry", phonetic: "/kraɪ/", meaning: "khóc (âm -y)", emoji: "😢", exampleSentence: "Don't cry.", exampleMeaning: "Đừng khóc nữa nhé." },
      { word: "pie", phonetic: "/paɪ/", meaning: "bánh nướng (âm -ie)", emoji: "🥧", exampleSentence: "This is an apple pie.", exampleMeaning: "Đây là bánh nướng nhân táo." }
    ],
    grammarStructures: {
      pattern: "Let's blend and sound out: cave, sheep, beach, phone.",
      description: "Sound blends and phonetic patterns from Oxford Phonics Check Up.",
      explanationVi: "Luyện phát âm chuẩn xác các nguyên âm và phụ âm ghép đặc biệt (sh, ch, th, wh, ph, a-e, ai, ay, ea, y, ie, ue, ui), giúp xây dựng nền tảng phát âm siêu chuẩn.",
      scrambledQuestions: [
        { words: ["cub", "The", "is", "in", "the", "cave", "."], correct: "The cub is in the cave .", hintVi: "Chú gấu con đang ở trong hang động." },
        { words: ["at", "Look", "this", "photo", "."], correct: "Look at this photo .", hintVi: "Hãy nhìn vào bức ảnh này." },
        { words: ["go", "the", "Let's", "to", "beach", "."], correct: "Let's go to the beach .", hintVi: "Chúng mình cùng ra bãi biển thôi nào." }
      ]
    }
  },
  {
    id: "phonics",
    title: "Phonics & Word Sounds",
    subtitle: "Luyện âm vần Oxford Phonics",
    vocabulary: [
      { word: "cake", phonetic: "/keɪk/", meaning: "bánh ngọt (âm a_e)", emoji: "🍰", exampleSentence: "I want a big birthday cake.", exampleMeaning: "Tớ muốn một chiếc bánh sinh nhật thật to." },
      { word: "bee", phonetic: "/biː/", meaning: "con ong (âm ee)", emoji: "🐝", exampleSentence: "The bee is on the yellow flower.", exampleMeaning: "Chú ong đang ở trên bông hoa màu vàng." },
      { word: "kite", phonetic: "/kaɪt/", meaning: "con diều (âm i_e)", emoji: "🪁", exampleSentence: "I fly a kite in the windy park.", exampleMeaning: "Tớ thả diều ở công viên đầy gió." },
      { word: "home", phonetic: "/həʊm/", meaning: "ngôi nhà (âm o_e)", emoji: "🏡", exampleSentence: "Let's go home and have dinner.", exampleMeaning: "Chúng mình về nhà và ăn tối thôi." },
      { word: "flute", phonetic: "/fluːt/", meaning: "cây sáo (âm u_e)", emoji: "🎶", exampleSentence: "She can play the flute beautifully.", exampleMeaning: "Cô ấy có thể thổi sáo rất hay." }
    ],
    grammarStructures: {
      pattern: "Oxford Phonics sound blends",
      description: "Sounding out long vowels in English.",
      explanationVi: "Học cách phát âm của các nguyên âm đôi hoặc nguyên âm dài (a-e, ee, i-e, o-e, u-e) giúp con phát âm chuẩn bản xứ.",
      scrambledQuestions: [
        { words: ["fly", "I", "a", "kite", "."], correct: "I fly a kite .", hintVi: "Tớ thả một con diều." },
        { words: ["is", "The", "yellow", "bee", "."], correct: "The bee is yellow .", hintVi: "Con ong đó màu vàng." }
      ]
    }
  }
];

export const SPEAKING_QUESTIONS_DATA: Record<string, SpeakingQuestion[]> = {
  classroom_verbs: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "What day is it today?", translation: "Hôm nay là thứ mấy thế?", emoji: "📅", hint: "It's Monday / Tuesday..." },
    { question: "Look at this. Can you say: 'Open your book, please'?", translation: "Làm ơn hãy mở sách ra.", emoji: "📖", hint: "Open your book, please." },
    { question: "Look at this. Can you say: 'Write your name, please'?", translation: "Làm ơn viết tên của con nhé.", emoji: "✍️", hint: "Write your name, please." },
    { question: "How do you spell the word 'read'?", translation: "Đánh vần từ 'read' thế nào nhỉ?", emoji: "📖", hint: "r-e-a-d" },
    { question: "What do you do on Sundays?", translation: "Con làm gì vào Chủ Nhật?", emoji: "🏡", hint: "I play soccer / stay at home." }
  ],
  unit1: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Look at this emoji. How does he feel?", translation: "Cậu ấy cảm thấy thế nào?", emoji: "😊", hint: "He is happy." },
    { question: "Look at this emoji. How does she feel?", translation: "Cô ấy cảm thấy thế nào?", emoji: "😢", hint: "She is sad." },
    { question: "Are you hot or cold today?", translation: "Hôm nay con thấy nóng hay lạnh?", emoji: "🥵", hint: "I am hot. / I am cold." },
    { question: "What can you see with your eyes?", translation: "Con có thể nhìn thấy gì bằng mắt?", emoji: "👀", hint: "I can see a bird / a book." },
    { question: "Can you hear a dog barking?", translation: "Con có thể nghe thấy tiếng chó sủa không?", emoji: "👂", hint: "Yes, I can. / No, I can't." }
  ],
  unit2: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Look at this person. Is he a doctor?", translation: "Chú ấy có phải bác sĩ không?", emoji: "🧑‍⚕️", hint: "Yes, he is. / No, he isn't." },
    { question: "Look at this person. Is she a teacher?", translation: "Cô ấy có phải giáo viên không?", emoji: "🧑‍🏫", hint: "Yes, she is. / No, she isn't." },
    { question: "Where is the doctor? Is he at the hospital?", translation: "Bác sĩ đang ở đâu?", emoji: "🏥", hint: "He is at the hospital." },
    { question: "Is the student at school or at home?", translation: "Học sinh đang ở trường hay ở nhà?", emoji: "🏫", hint: "He is at school." },
    { question: "What do you want to be? A pilot or a firefighter?", translation: "Con muốn làm nghề gì?", emoji: "🧑‍✈️", hint: "I want to be a pilot." }
  ],
  unit3: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Do you want soup or salad?", translation: "Con muốn ăn súp hay xa-lách?", emoji: "🍜", hint: "I want soup." },
    { question: "Look at this fruit. Do you want an apple?", translation: "Con có muốn một quả táo không?", emoji: "🍎", hint: "Yes, please. / No, thank you." },
    { question: "Do you have bananas at home?", translation: "Nhà con có chuối không?", emoji: "🍌", hint: "Yes, I do. / No, I don't." },
    { question: "Do you like cheese?", translation: "Con có thích phô mai không?", emoji: "🧀", hint: "Yes, I do. / No, I don't." },
    { question: "What food do you want to eat now?", translation: "Con muốn ăn món gì bây giờ?", emoji: "🍕", hint: "I want pizza / steak." }
  ],
  unit4: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Look at this clothing. What is he wearing?", translation: "Cậu ấy đang mặc gì?", emoji: "👕", hint: "He's wearing a T-shirt." },
    { question: "Look at this. Is she wearing a dress?", translation: "Cô ấy có mặc váy đầm không?", emoji: "👗", hint: "Yes, she is. / No, she isn't." },
    { question: "What are you wearing today? A shirt or a sweater?", translation: "Hôm nay con đang mặc gì?", emoji: "👕", hint: "I'm wearing a shirt." },
    { question: "Are you wearing sneakers today?", translation: "Hôm nay con có đi giày thể thao không?", emoji: "👟", hint: "Yes, I am. / No, I'm not." },
    { question: "Is he wearing a red cap?", translation: "Cậu ấy có đội mũ màu đỏ không?", emoji: "🧢", hint: "Yes, he is. / No, he isn't." }
  ],
  unit5: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Look at this. What is she doing? Is she reading?", translation: "Cô ấy đang làm gì?", emoji: "📖", hint: "Yes, she is reading." },
    { question: "Look! Is he playing the guitar?", translation: "Cậu ấy có đang chơi đàn ghi-ta không?", emoji: "🎸", hint: "Yes, he is playing the guitar." },
    { question: "What are you doing? Are you studying English?", translation: "Con đang làm gì thế?", emoji: "🔠", hint: "I am studying English." },
    { question: "Can you dance or sing?", translation: "Con biết nhảy múa hay hát không?", emoji: "💃", hint: "I can sing." },
    { question: "What do they do after school? Do they watch TV?", translation: "Họ làm gì sau giờ học?", emoji: "📺", hint: "Yes, they watch TV." }
  ],
  unit6: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Where is the bed? Is it in the bedroom or the kitchen?", translation: "Chiếc giường ở phòng nào?", emoji: "🛏️", hint: "It's in the bedroom." },
    { question: "Is there a computer on your table?", translation: "Có máy tính trên bàn của con không?", emoji: "💻", hint: "Yes, there is. / No, there isn't." },
    { question: "Where is your mom cooking? Is she in the kitchen?", translation: "Mẹ con đang nấu ăn ở đâu?", emoji: "🍳", hint: "She is in the kitchen." },
    { question: "Is there a soft sofa in your living room?", translation: "Có ghế sô-fa ở phòng khách không?", emoji: "🛋️", hint: "Yes, there is." },
    { question: "How many clocks are there in your house?", translation: "Có bao nhiêu đồng hồ trong nhà con?", emoji: "⏰", hint: "There are two clocks." }
  ],
  unit7: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Look at the clock. What time is it?", translation: "Mấy giờ rồi con?", emoji: "🕐", hint: "It's one o'clock." },
    { question: "Do you eat lunch at twelve o'clock?", translation: "Con ăn trưa lúc 12 giờ đúng không?", emoji: "🥪", hint: "Yes, I do. / No, I don't." },
    { question: "What time do you wake up in the morning?", translation: "Con thức dậy lúc mấy giờ sáng?", emoji: "🌅", hint: "I wake up at six o'clock." },
    { question: "When do you eat dinner? At seven o'clock?", translation: "Khi nào con ăn tối?", emoji: "🍗", hint: "I eat dinner at seven o'clock." },
    { question: "What time do you go to bed?", translation: "Con đi ngủ lúc mấy giờ?", emoji: "🛌", hint: "I go to bed at nine thirty." }
  ],
  unit8: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "What is your favorite subject at school? Is it science or art?", translation: "Môn học yêu thích của con là gì?", emoji: "🧪", hint: "My favorite subject is science." },
    { question: "Do you go to English class on Wednesdays?", translation: "Con có đi học tiếng Anh vào thứ Tư không?", emoji: "🔠", hint: "Yes, I do." },
    { question: "Do you play soccer in P.E. class?", translation: "Con có chơi bóng đá trong tiết Thể dục không?", emoji: "⚽", hint: "Yes, I do." },
    { question: "Where are you from? Are you from Canada or Vietnam?", translation: "Con đến từ đâu?", emoji: "🇻🇳", hint: "I am from Vietnam." },
    { question: "Is your friend from South Korea?", translation: "Bạn con có đến từ Hàn Quốc không?", emoji: "🇰🇷", hint: "Yes, he is. / No, he isn't." }
  ],
  phonics_checkup: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Look at this animal. What is it?", translation: "Đây là con vật gì?", emoji: "🐑", hint: "It is a sheep." },
    { question: "Can you see a big shell on the beach?", translation: "Con có thấy vỏ sò trên bãi biển không?", emoji: "🐚", hint: "Yes, I can." },
    { question: "Can you sound out and spell 'cave'?", translation: "Con có thể đánh vần từ 'cave' không?", emoji: "🧗", hint: "c-a-v-e" },
    { question: "Do you like strawberry jam?", translation: "Con có thích mứt dâu tây không?", emoji: "🍓", hint: "Yes, I do. / No, I don't." },
    { question: "Where is the bear? Is it in the box?", translation: "Con gấu ở đâu thế?", emoji: "🐻", hint: "It's in the cave / box." }
  ],
  phonics: [
    { question: "Hello, little friend! What is your name?", translation: "Xin chào bạn nhỏ! Con tên là gì thế?", emoji: "👋", hint: "My name is..." },
    { question: "Nice to meet you! How old are you?", translation: "Con bao nhiêu tuổi rồi?", emoji: "🎂", hint: "I am ... years old." },
    { question: "How do you feel today?", translation: "Hôm nay con cảm thấy thế nào?", emoji: "😊", hint: "I am happy / excited." },
    { question: "Look at this delicious sweet food. What is it?", translation: "Đây là bánh gì?", emoji: "🍰", hint: "It is a cake." },
    { question: "Look at this insect. What is it?", translation: "Đây là con côn trùng gì?", emoji: "🐝", hint: "It is a bee." },
    { question: "Can you play the flute?", translation: "Con có biết thổi sáo không?", emoji: "🎶", hint: "Yes, I can. / No, I can't." },
    { question: "Can you sound out and spell 'kite'?", translation: "Con đánh vần từ 'kite' thế nào?", emoji: "🪁", hint: "k-i-t-e" },
    { question: "Do you have a warm home?", translation: "Con có ngôi nhà ấm áp đúng không?", emoji: "🏡", hint: "Yes, I do." }
  ]
};

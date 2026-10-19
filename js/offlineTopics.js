const topicData = [
  {
    week: 2, topic: "Family & Relationships", level: "A1-A2", goals: "Nói về gia đình, bạn bè và các mối quan hệ.",
    words: [["family", "gia đình"], ["parent", "bố hoặc mẹ"], ["relative", "họ hàng"], ["support", "ủng hộ, hỗ trợ"]],
    phrases: [["This is my family.", "Đây là gia đình tôi."], ["How many people are in your family?", "Gia đình bạn có bao nhiêu người?"], ["We get along well.", "Chúng tôi hòa thuận."]],
    grammar: "Possessive adjectives (my, your, his, her) và have/has.",
    reading: "Linh lives with her parents and her younger brother. They eat dinner together every evening and support each other.",
    listening: "A: Do you have any brothers or sisters? B: Yes, I have one younger brother. A: Do you get along? B: Yes, we get along very well.",
    quiz: ["She ___ two sisters.", ["have", "has", "having"], 1]
  },
  {
    week: 3, topic: "Daily Routines", level: "A2", goals: "Mô tả thói quen, lịch trình và thời gian trong ngày.",
    words: [["wake up", "thức dậy"], ["routine", "thói quen hằng ngày"], ["usually", "thường thường"], ["schedule", "lịch trình"]],
    phrases: [["I usually get up at seven.", "Tôi thường dậy lúc bảy giờ."], ["What time do you start work?", "Bạn bắt đầu làm việc lúc mấy giờ?"], ["I am busy in the morning.", "Tôi bận vào buổi sáng."]],
    grammar: "Present simple với trạng từ tần suất: always, usually, sometimes, never.",
    reading: "Nam usually wakes up at six thirty. He has breakfast, takes the bus, and starts work at eight. In the evening, he reads for thirty minutes.",
    listening: "A: What do you do after work? B: I go home and cook dinner. A: Do you exercise? B: Yes, I usually walk after dinner.",
    quiz: ["She ___ coffee every morning.", ["drink", "drinks", "drinking"], 1]
  },
  {
    week: 4, topic: "Food & Dining", level: "A2", goals: "Gọi món, mô tả đồ ăn và thanh toán.",
    words: [["menu", "thực đơn"], ["order", "gọi món"], ["delicious", "ngon"], ["bill", "hóa đơn"]],
    phrases: [["Could I have the menu?", "Cho tôi xin thực đơn được không?"], ["I'd like the chicken, please.", "Tôi muốn món gà."], ["Could we have the bill?", "Cho chúng tôi xin hóa đơn."]],
    grammar: "Countable/uncountable nouns và some/any.",
    reading: "Mai visits a small restaurant with her friend. She orders vegetable soup and rice. Her friend chooses grilled fish. They share a dessert.",
    listening: "A: Are you ready to order? B: Yes. I'd like a bowl of soup, please. A: Would you like anything to drink? B: Water, please.",
    quiz: ["There isn't ___ milk.", ["some", "any", "many"], 1]
  },
  {
    week: 5, topic: "Travel & Transportation", level: "A2", goals: "Đặt vé, hỏi đường và xử lý vấn đề khi đi du lịch.",
    words: [["journey", "hành trình"], ["ticket", "vé"], ["platform", "sân ga"], ["direction", "phương hướng"]],
    phrases: [["How can I get to the station?", "Tôi đến nhà ga bằng cách nào?"], ["One ticket to London, please.", "Cho tôi một vé đi London."], ["Is this the right platform?", "Đây có phải đúng sân ga không?"]],
    grammar: "Future with be going to và giới từ chỉ địa điểm.",
    reading: "Tom is going to visit Hue next weekend. He is going to take a train because it is comfortable. He has already bought his ticket.",
    listening: "A: Excuse me, where is platform four? B: Go upstairs and turn left. A: Is it far? B: No, it is next to the café.",
    quiz: ["They are ___ to travel tomorrow.", ["go", "going", "went"], 1]
  },
  {
    week: 6, topic: "Hobbies & Interests", level: "A2", goals: "Nói về sở thích, lời mời và trải nghiệm.",
    words: [["hobby", "sở thích"], ["practice", "luyện tập"], ["creative", "sáng tạo"], ["prefer", "thích hơn"]],
    phrases: [["What do you do in your free time?", "Bạn làm gì lúc rảnh?"], ["Would you like to join us?", "Bạn có muốn tham gia với chúng tôi không?"], ["I am interested in photography.", "Tôi thích nhiếp ảnh."]],
    grammar: "Động từ theo sau bằng to V hoặc V-ing.",
    reading: "An enjoys taking photos of local streets. She practices every weekend and shares her best pictures with a photography group.",
    listening: "A: What are you interested in? B: I enjoy playing the guitar. A: Would you like to join our band? B: I'd love to.",
    quiz: ["I enjoy ___ books.", ["read", "reading", "to read"], 1]
  },
  {
    week: 7, topic: "Weather & Seasons", level: "A2-B1", goals: "Nói về thời tiết, mùa và kế hoạch.",
    words: [["forecast", "dự báo"], ["humid", "ẩm"], ["temperature", "nhiệt độ"], ["season", "mùa"]],
    phrases: [["What is the weather like?", "Thời tiết thế nào?"], ["It might rain later.", "Có thể lát nữa sẽ mưa."], ["Let's stay inside.", "Hãy ở trong nhà."]],
    grammar: "Will, may, might để dự đoán và nói về khả năng.",
    reading: "The forecast says the temperature will fall tonight. It may rain in the north, but the south will stay dry and warm.",
    listening: "A: Shall we have a picnic? B: Check the forecast first. A: It might rain this afternoon. B: Then let's go tomorrow.",
    quiz: ["It ___ rain later.", ["might", "must to", "is"], 0]
  },
  {
    week: 8, topic: "Education & Learning", level: "A2-B1", goals: "Nói về việc học, kỳ thi và chọn khóa học.",
    words: [["subject", "môn học"], ["assignment", "bài tập"], ["improve", "cải thiện"], ["deadline", "hạn chót"]],
    phrases: [["I need to hand in my assignment.", "Tôi cần nộp bài tập."], ["Could you explain this part?", "Bạn giải thích phần này được không?"], ["I am preparing for an exam.", "Tôi đang chuẩn bị cho kỳ thi."]],
    grammar: "Comparatives và superlatives để so sánh phương pháp học.",
    reading: "Lan studies English online because she can choose her own schedule. She reviews vocabulary every day and asks questions when she needs help.",
    listening: "A: Which subject do you find difficult? B: Physics is harder than history for me. A: What helps you learn? B: Short daily practice helps most.",
    quiz: ["This exercise is ___ than the last one.", ["easy", "easier", "easiest"], 1]
  },
  {
    week: 9, topic: "Health & Well-being", level: "B1", goals: "Nói về thói quen lành mạnh, cảm giác và lời khuyên.",
    words: [["symptom", "triệu chứng"], ["healthy", "khỏe mạnh"], ["habit", "thói quen"], ["advice", "lời khuyên"]],
    phrases: [["I have a headache.", "Tôi bị đau đầu."], ["You should get some rest.", "Bạn nên nghỉ ngơi."], ["It is important to stay active.", "Duy trì vận động rất quan trọng."]],
    grammar: "Should, ought to và had better để đưa lời khuyên.",
    reading: "A healthy routine includes enough sleep, regular movement, and balanced meals. Small changes are easier to keep than strict short-term plans.",
    listening: "A: I feel tired all the time. B: You should sleep earlier and drink more water. A: I will try that. B: If it continues, see a doctor.",
    quiz: ["You ___ drink more water.", ["should", "should to", "are"], 0]
  },
  {
    week: 10, topic: "Technology & Gadgets", level: "B1", goals: "Mô tả thiết bị, ứng dụng và hỗ trợ kỹ thuật.",
    words: [["device", "thiết bị"], ["update", "cập nhật"], ["connect", "kết nối"], ["privacy", "quyền riêng tư"]],
    phrases: [["My phone is out of battery.", "Điện thoại tôi hết pin."], ["Could you send me the link?", "Bạn gửi tôi đường dẫn được không?"], ["I need to reset my password.", "Tôi cần đặt lại mật khẩu."]],
    grammar: "Passive voice cơ bản để mô tả quy trình.",
    reading: "The new app is designed to help learners review words. Data is stored securely, and users can change their privacy settings.",
    listening: "A: The printer isn't working. B: Is it connected to the network? A: Yes, but an update is needed. B: Let's install it and try again.",
    quiz: ["The file was ___ yesterday.", ["send", "sent", "sending"], 1]
  },
  {
    week: 11, topic: "Environment & Nature", level: "B1", goals: "Nói về môi trường, thiên nhiên và hành động cộng đồng.",
    words: [["recycle", "tái chế"], ["waste", "rác thải"], ["protect", "bảo vệ"], ["reduce", "giảm bớt"]],
    phrases: [["We should reduce plastic waste.", "Chúng ta nên giảm rác thải nhựa."], ["Turn off the lights.", "Tắt đèn đi."], ["Local people are protecting the river.", "Người dân địa phương đang bảo vệ con sông."]],
    grammar: "First conditional để nói về kết quả có thể xảy ra.",
    reading: "If a community reduces single-use plastic, it can save money and keep streets cleaner. Local projects work best when many people join.",
    listening: "A: What can we do for the park? B: We can collect litter this Saturday. A: If more people come, we will finish quickly. B: I will invite my neighbors.",
    quiz: ["If we recycle more, we ___ less waste.", ["produce", "will produce", "produced"], 0]
  },
  {
    week: 12, topic: "Review & Assessment", level: "A1-B1", goals: "Ôn tập và đánh giá toàn bộ kỹ năng trong English 1.",
    words: [["review", "ôn tập"], ["progress", "tiến bộ"], ["confident", "tự tin"], ["goal", "mục tiêu"]],
    phrases: [["Let me try again.", "Để tôi thử lại."], ["I can explain my idea.", "Tôi có thể giải thích ý tưởng của mình."], ["I have made progress.", "Tôi đã tiến bộ."]],
    grammar: "Ôn tập be, present simple, past, future, modals và conditionals.",
    reading: "Over twelve weeks, Minh built a steady English habit. He can now introduce himself, ask for help, describe plans, and explain simple opinions.",
    listening: "A: What have you learned this term? B: I can speak more confidently and understand short conversations. A: What is your next goal? B: I want to read every day.",
    quiz: ["I have ___ a lot this term.", ["learn", "learned", "learning"], 1]
  }
];

const roadmapDetails = {
  1: {
    vocabulary: ["Nice to meet you", "What's your name", "Fine", "Thank you", "Please", "You're welcome", "Excuse me", "Sorry", "Goodbye", "See you", "How's it going", "What's up", "Can I help you", "My pleasure", "No problem", "It's a pleasure to meet you", "Pardon me", "It's all right", "So long", "Have a good day"],
    grammar: "Thì hiện tại đơn và các loại đại từ.",
    grammarSource: "Duolingo (app), BBC Learning English (website)",
    listeningSources: "ESL Podcasts; Conversation Practice Apps; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Giới thiệu bản thân, hỏi thăm một người mới và kết thúc cuộc trò chuyện bằng 6-8 câu tiếng Anh."
  },
  2: {
    vocabulary: ["Grandmother", "grandfather", "cousin", "mother-in-law", "father-in-law", "sibling", "affectionate", "bond", "family tree", "nuclear family", "extended family", "upbringing", "sibling rivalry", "in-law", "kinship", "significant other", "siblings", "affection", "unconditional love", "family reunion", "next of kin", "marital status", "sibling dynamics", "blended family", "close-knit family", "family values"],
    grammar: "Hiện tại tiếp diễn, thì quá khứ đơn và sở hữu cách.",
    grammarSource: "Grammarly (app + website), EnglishClub (website)",
    listeningSources: "Family and Relationship Podcasts; TED Talks; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Mô tả gia đình và một kỷ niệm đáng nhớ, dùng ít nhất 10 từ khóa và 3 cấu trúc sở hữu."
  },
  3: {
    vocabulary: ["Morning routine", "evening routine", "bedtime", "office hours", "work-life balance", "leisure time", "vacuum", "do the laundry", "iron clothes", "tidy up", "jog", "meditate", "watch TV", "read a book", "check email", "prepare breakfast", "take a nap", "walk the dog", "productive", "time management", "daily planner", "routine tasks", "daily rituals", "time-consuming", "time-saving strategies", "daily schedule"],
    grammar: "Hiện tại hoàn thành, trạng từ chỉ sự thường xuyên và cách diễn đạt thời gian hiện tại/tương lai.",
    grammarSource: "English Grammar in Use; Purdue OWL",
    listeningSources: "Lifestyle Podcasts; YouTube Channels; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Nói hoặc viết lịch một ngày điển hình, so sánh thói quen hiện tại với tuần trước."
  },
  4: {
    vocabulary: ["Appetizer", "main course", "dessert", "cuisine", "gourmet", "cutlery", "silverware", "chopsticks", "fork", "knife", "spoon", "napkin", "spicy", "savory", "crispy", "vegan", "vegetarian", "chef's special", "check (bill)", "tip", "reservations", "gastronomy", "culinary art", "sommelier", "gourmet restaurant", "food critic", "exotic dishes", "local cuisine", "fine dining", "farm-to-table"],
    grammar: "Mạo từ a/an/the, động từ khiếm khuyết và danh từ đếm được/không đếm được.",
    grammarSource: "Cambridge Grammar in Use (app + website)",
    listeningSources: "Cooking Shows; Food Podcasts; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Đóng vai khách và nhân viên nhà hàng: đặt bàn, gọi món, hỏi thành phần và thanh toán."
  },
  5: {
    vocabulary: ["Round trip", "travel itinerary", "guided tour", "landmarks", "sightseeing", "GPS", "driving license", "public transportation", "car rental", "scenic route", "ticket counter", "passport control", "flight delay", "layover", "tourist attraction", "backpack", "hiking trail", "cultural exchange", "souvenir", "jet lag", "travel insurance", "baggage claim", "boarding pass", "travel agency", "customs declaration", "aisle seat", "window seat", "turbulence"],
    grammar: "Giới từ nơi chốn và thời gian, thì tương lai và câu điều kiện.",
    grammarSource: "English Page (website), Grammar.com",
    listeningSources: "Travel Vlogs; Travel Podcasts; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Trình bày lịch trình chuyến đi, hỏi đường và xử lý một tình huống trễ chuyến."
  },
  6: {
    vocabulary: ["Knitting", "stamp collecting", "gardening", "model building", "oil painting", "watercolor", "card games", "chess", "jigsaw puzzles", "board games", "role-playing games", "martial arts", "skateboarding", "playing an instrument", "music theory", "dance styles", "mindfulness", "woodworking", "DIY projects", "creative expression", "pastime", "leisure pursuit", "recreational activities", "artistic endeavors", "crafting hobbies", "leisure activities", "outdoor recreation", "artistic skills", "creative projects"],
    grammar: "Gerund và infinitive; động từ khiếm khuyết.",
    grammarSource: "ESL Podcasts (YouTube)",
    listeningSources: "Interest-based Podcasts; Online Courses; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Giới thiệu một sở thích, mời bạn tham gia và giải thích lợi ích của sở thích đó."
  },
  7: {
    vocabulary: ["Climate change", "global warming", "greenhouse effect", "meteorology", "precipitation", "drought", "natural disaster", "thunderstorm", "hurricane", "tornado", "flood", "heatwave", "cold front", "heat index", "humidity level", "barometric pressure", "dew point", "ozone layer", "carbon footprint", "air quality", "weather patterns", "environmental impact", "climatic conditions", "climate action", "weather forecast", "climate crisis", "extreme weather", "climate-related issues", "weather phenomena"],
    grammar: "Cách dùng tính từ–trạng từ và hiện tại hoàn thành tiếp diễn.",
    grammarSource: "BBC Learning English (YouTube + website), Purdue OWL",
    listeningSources: "Weather Reports; Climate Podcasts; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Đọc một bản dự báo thời tiết và giải thích kế hoạch của bạn khi thời tiết thay đổi."
  },
  8: {
    vocabulary: ["Extracurricular activities", "lecture hall", "coursework", "academic", "grade", "research paper", "student loan", "online courses", "peer review", "academic calendar", "academic advisor", "academic year", "study group", "school supplies", "school library", "student association", "diploma", "degree", "internship", "lifelong learning", "academic excellence", "educational institutions", "educational philosophy", "academic achievements", "student leadership", "academic challenges", "academic success", "academic disciplines", "academic research", "academic standards"],
    grammar: "Mạo từ và các dạng so sánh hơn/so sánh nhất.",
    grammarSource: "British Council LearnEnglish (app + YouTube), TED Talks",
    listeningSources: "Educational Podcasts; e-Learning Platforms; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "So sánh hai cách học, trình bày kế hoạch học tập và hỏi cố vấn về một khóa học."
  },
  9: {
    vocabulary: ["Well-being", "fitness tracker", "dietitian", "nutritionist", "holistic medicine", "medical check-up", "health insurance", "physical therapy", "herbal remedies", "meditation techniques", "self-care practices", "mental clarity", "relaxation techniques", "self-help books", "wellness retreat", "strength training", "balanced diet", "stress management", "mindfulness exercises", "health-conscious", "wellness industry", "healthy lifestyle", "alternative therapies", "mental well-being", "holistic healing", "wellness trends", "wellness coaching", "fitness regimen", "mental resilience"],
    grammar: "Modals (can, must), hiện tại hoàn thành tiếp diễn và comparatives.",
    grammarSource: "Oxford English Grammar (website), Grammarly",
    listeningSources: "Health and Wellness Podcasts; Fitness Apps; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Nêu vấn đề sức khỏe, đưa lời khuyên có căn cứ và lập kế hoạch thay đổi thói quen."
  },
  10: {
    vocabulary: ["Augmented reality", "virtual reality", "wearables", "cloud computing", "cybersecurity", "data privacy", "social media influencers", "cryptocurrency", "tech-savvy", "3D printing", "autonomous vehicles", "drone technology", "e-commerce", "digital marketing", "IT sector", "user interface", "digitalization", "data breach", "software updates", "tech startups", "technological innovation", "tech trends", "digital transformation", "digital advertising", "information security", "emerging technologies", "technological advances", "internet of things", "digital disruption", "tech industry", "tech innovations", "innovation trends", "disruptive technology", "tech entrepreneurship", "tech integration"],
    grammar: "Câu bị động, câu điều kiện (if clauses) và câu tường thuật.",
    grammarSource: "Tech Blogs, Purdue OWL",
    listeningSources: "Tech Podcasts; Tech YouTube Channels; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Thuyết trình về một thiết bị/công nghệ, mô tả cách dùng và cảnh báo một rủi ro."
  },
  11: {
    vocabulary: ["Sustainable living", "renewable energy", "wildlife conservation", "deforestation", "habitat loss", "ecological balance", "eco-conscious", "carbon emissions", "environmentalist", "eco-friendly practices", "biodiversity preservation", "climate activism", "green initiatives", "ecosystem", "reforestation", "wildlife sanctuary", "conservation efforts", "climate adaptation", "eco-tourism", "sustainable practices", "environmental stewardship", "ecosystem restoration", "sustainable solutions", "eco-conscious consumerism", "climate advocacy", "green technology", "environmental conservation", "nature preservation", "wildlife protection"],
    grammar: "Mệnh đề quan hệ.",
    grammarSource: "National Geographic (website + YouTube), Grammarly",
    listeningSources: "Environmental Podcasts; Nature Documentaries; Randall's ESL Listening Class; ESL Cyber Listening Lab; English Club's Listening Exercises",
    output: "Trình bày một vấn đề môi trường tại địa phương và đề xuất ba giải pháp thực tế."
  },
  12: {
    vocabulary: ["Review", "progress", "confident", "goal", "listening skill", "mock test", "assessment", "feedback", "strategy", "revision"],
    grammar: "Ôn tập toàn bộ ngữ pháp đã học, không thêm nội dung mới.",
    grammarSource: "Tổng hợp các nguồn của tuần 1–11",
    listeningSources: "Mock IELTS Listening Tests; Language Exams; ESL Cyber Listening Lab; English Club's Listening Exercises; TOEFL Listening Practice",
    output: "Bài đánh giá cuối khóa: nghe, trả lời câu hỏi, nói về một chủ đề và lập kế hoạch học tiếp."
  }
};

export function getOfflineTopic(week) {
  const item = topicData.find((topic) => topic.week === week);
  if (!item) return null;
  const detail = roadmapDetails[week] || {};
  const vocabulary = detail.vocabulary || item.words.map(([word]) => word);
  return {
    week: item.week,
    topic: item.topic,
    level: item.level,
    goals_vi: [item.goals],
    grammar_focus: detail.grammar || item.grammar,
    grammar_source: detail.grammarSource || "",
    listening_sources: detail.listeningSources || "",
    output_task: detail.output || `Hoàn thành bài nói hoặc bài viết về chủ đề ${item.topic}.`,
    vocabulary: {
      core_words: vocabulary.map((word, index) => ({
        id: `w${String(week).padStart(2, "0")}.v${String(index + 1).padStart(2, "0")}`,
        word, pos: "word", ipa: "", meaning_vi: index < item.words.length ? item.words[index][1] : "Từ khóa cần học theo ngữ cảnh", collocations: [], examples: [],
      })),
      chunks: item.phrases.map(([phrase, meaning], index) => ({
        id: `w${String(week).padStart(2, "0")}.c${String(index + 1).padStart(2, "0")}`,
        phrase, meaning_vi: meaning,
      })),
    },
    grammar: { points: [{ name: item.grammar, formula: "Xem ví dụ và tự tạo câu.", function_vi: item.grammar }] },
    reading: { main: { title: item.topic, paragraphs: [item.reading] } },
    listening: { scripts: [{ title: item.topic, situation: "Hội thoại luyện nghe offline.", lines: item.listening.split(/(?=[AB]: )/).filter(Boolean).map((text, index) => ({ n: index + 1, speaker: text[0], text: text.slice(3) })) }] },
    quiz: { mini_test: [{ question: item.quiz[0], options: item.quiz[1], answer_index: item.quiz[2] }] },
  };
}

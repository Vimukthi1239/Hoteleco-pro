const fs = require('fs');
const path = require('path');

const localesPath = __dirname;

const reviewsTranslations = {
  en: {
    home: {
      review1Text: "Outstanding AI recommendations led us to hidden gems we never would have found. Perfect Sri Lanka experience!",
      review2Text: "The multilingual support in Hindi made everything so easy. Booking was smooth and the hotels were spectacular.",
      review3Text: "Best hotel platform for Sri Lanka. The map integration showed us amazing coastal spots near our hotel."
    }
  },
  si: {
    home: {
      review1Text: "සුවිශේෂී AI නිර්දේශ නිසා අපට කිසිදා සොයාගත නොහැකි වූ සැඟවුණු ස්ථාන සොයා ගැනීමට හැකි විය. කදිම ශ්‍රී ලංකා අත්දැකීමක්!",
      review2Text: "හින්දි භාෂාවෙන් බහුභාෂා සහාය තිබීම සියල්ල ඉතා පහසු කළේය. වෙන්කිරීම් ඉතා සුමටව සිදු වූ අතර හෝටල් ද අතිවිශිෂ්ටයි.",
      review3Text: "ශ්‍රී ලංකාව සඳහා හොඳම හෝටල් වේදිකාව. සිතියම් ඒකාබද්ධතාවය අපගේ හෝටලය අසල ඇති සුන්දර වෙරළබඩ ස්ථාන අපට පෙන්වා දුන්නේය."
    }
  },
  de: {
    home: {
      review1Text: "Hervorragende KI-Empfehlungen führten uns zu versteckten Juwelen, die wir sonst nie gefunden hätten. Perfektes Sri Lanka-Erlebnis!",
      review2Text: "Die mehrsprachige Unterstützung auf Hindi hat alles so einfach gemacht. Die Buchung verlief reibungslos und die Hotels waren spektakulär.",
      review3Text: "Beste Hotelplattform für Sri Lanka. Die Kartenintegration zeigte uns tolle Küstenorte in der Nähe unseres Hotels."
    }
  },
  fr: {
    home: {
      review1Text: "Des recommandations IA exceptionnelles nous ont conduits à des joyaux cachés que nous n'aurions jamais trouvés autrement. Expérience parfaite au Sri Lanka !",
      review2Text: "Le support multilingue en hindi a tout rendu si facile. La réservation s'est faite en douceur et les hôtels étaient spectaculaires.",
      review3Text: "Meilleure plateforme hôtelière pour le Sri Lanka. L'intégration de la carte nous a montré de superbes endroits côtiers à proximité de notre hôtel."
    }
  },
  zh: {
    home: {
      review1Text: "出色的人工智能推荐带我们找到了我们从未发现的隐秘宝藏。完美的斯里兰卡体验！",
      review2Text: "印地语的多语言支持让一切变得如此简单。预订很顺利，酒店也很壮观。",
      review3Text: "斯里兰卡最好的酒店平台。地图集成显示了我们酒店附近令人惊叹的海岸景点。"
    }
  },
  ja: {
    home: {
      review1Text: "素晴らしいAIの推奨により、他では決して見つけることができなかった隠れた宝石を見つけることができました。完璧なスリランカの体験です！",
      review2Text: "ヒンディー語の多言語サポートにより、すべてが非常に簡単になりました。予約はスムーズで、ホテルは素晴らしいものでした。",
      review3Text: "スリランカで最高のホテルプラットフォーム。マップの統合により、ホテルの近くの素晴らしい沿岸スポットが示されました。"
    }
  },
  ru: {
    home: {
      review1Text: "Выдающиеся рекомендации ИИ привели нас к скрытым жемчужинам, которые мы никогда бы не нашли сами. Идеальный опыт на Шри-Ланке!",
      review2Text: "Многоязычная поддержка на хинди сделала все очень простым. Бронирование прошло гладко, а отели были просто великолепны.",
      review3Text: "Лучшая отельная платформа для Шри-Ланки. Интеграция карты показала нам отличные прибрежные места рядом с нашим отелем."
    }
  },
  hi: {
    home: {
      review1Text: "उत्कृष्ट एआई सिफारिशें हमें उन छिपे हुए रत्नों तक ले गईं जिन्हें हम कभी नहीं ढूंढ पाते। बिल्कुल सही श्रीलंका अनुभव!",
      review2Text: "हिंदी में बहुभाषी समर्थन ने सब कुछ बहुत आसान बना दिया। बुकिंग सुचारू थी और होटल शानदार थे।",
      review3Text: "श्रीलंका के लिए सर्वश्रेष्ठ होटल मंच। मानचित्र एकीकरण ने हमें हमारे होटल के पास अद्भुत तटीय स्थानों को दिखाया।"
    }
  }
};

// Loop through each language, read the locale JSON, merge, and save
Object.keys(reviewsTranslations).forEach(lang => {
  const filePath = path.join(localesPath, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const currentContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const merged = { ...currentContent };
      if (merged.home) {
        merged.home = { ...merged.home, ...reviewsTranslations[lang].home };
      }
      
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
      console.log(`Successfully appended reviews to ${lang}.json`);
    } catch (e) {
      console.error(`Error processing ${lang}.json:`, e);
    }
  }
});

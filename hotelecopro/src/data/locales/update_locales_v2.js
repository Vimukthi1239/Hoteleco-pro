const fs = require('fs');
const path = require('path');

const localesPath = __dirname;

const newTranslations = {
  en: {
    destinations: {
      away: "away",
      openingTime: "Opening Time",
      closingTime: "Closing Time",
      placeholderReviewName: "Local Explorer",
      placeholderReviewText: "A must-visit place! The scenery is beautiful and the atmosphere is wonderful.",
      submit: "Submit",
      cancel: "Cancel",
      addNamePlaceholder: "Name (e.g. Sigiriya)",
      addImagePlaceholder: "Image URL (optional)",
      addDescPlaceholder: "Description",
      noneFound: "No destinations found for this district."
    },
    map: {
      mins: "mins",
      hours: "hr"
    },
    home: {
      galleryShowcase: "Gallery Showcase",
      galleryTitle: "Capture the Moments",
      gallerySub: "Browse visual memories of stunning natural beauty and cultural heritage in Sri Lanka.",
      galleryClickToExpand: "Click to expand",
      galleryImageOf: "Image {{count}} of {{total}}"
    },
    itinerary: {
      loadingTitle: "Designing Your Journey",
      footerNotice: "This itinerary was generated using AI recommendations and localized Ceylon Nature destination databases. Thank you for choosing eco-friendly travel!",
      matchedPackagesTitle: "Matched Local Tour Packages",
      featuredPackagesTitle: "Featured Local Tour Packages",
      matchedPackagesDesc: "Curated tour plans from registered eco agencies matching your travel choices.",
      featuredPackagesDesc: "Discover top-rated experiences and package deals offered by local travel experts.",
      matchesFound: "{{count}} Matches Found",
      noPackages: "No agency packages listed yet. Visit the Operator Portal to add one!",
      coveredDistricts: "Covered Districts:",
      inquireBtn: "Inquire Tour Package",
      selectedCount: "{{count}} selected",
      quote1: "🌴 Sifting through Sri Lanka's finest eco-friendly destinations...",
      quote2: "📍 Mapping coordinates and planning the shortest route...",
      quote3: "🏛️ Embedding cultural heritage sites and ancient ruins...",
      quote4: "🌊 Locating golden sandy beaches and relaxation spots...",
      quote5: "🧗 Finding adrenaline-filled adventure trails...",
      inquireTo: "To:",
      inquirySuccess: "Inquiry Sent Successfully!",
      inquirySuccessDesc: "Your inquiry message has been submitted to {{agencyName}}. The operator will get back to you shortly.",
      inquireName: "Your Name",
      inquireNamePlaceholder: "Full name",
      inquireEmail: "Your Email",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "Inquiry Message",
      sending: "Sending...",
      sendInquiry: "Send Inquiry"
    },
    signin: {
      selectDistrict: "Select district",
      selectType: "Select type"
    },
    booking: {
      selectNationality: "Select nationality",
      noHotelsAvailable: "No hotels are currently available for booking."
    }
  },
  si: {
    destinations: {
      away: "ඈතින්",
      openingTime: "විවෘත වේලාව",
      closingTime: "වසන වේලාව",
      placeholderReviewName: "දේශීය ගවේෂකයා",
      placeholderReviewText: "අනිවාර්යයෙන්ම යා යුතු ස්ථානයක්! සුන්දර දර්ශන සහ අපූරු පරිසරයක් ඇත.",
      submit: "ඉදිරිපත් කරන්න",
      cancel: "අවලංගු කරන්න",
      addNamePlaceholder: "නම (උදා. සීගිරිය)",
      addImagePlaceholder: "ඡායාරූප සබැඳිය (විකල්ප)",
      addDescPlaceholder: "විස්තරය",
      noneFound: "මෙම දිස්ත්‍රික්කය සඳහා ගමනාන්ත කිසිවක් හමු නොවීය."
    },
    map: {
      mins: "මිනිත්තු",
      hours: "පැය"
    },
    home: {
      galleryShowcase: "ඡායාරූප ගැලරිය",
      galleryTitle: "සුන්දර මතකයන් සටහන් කරගන්න",
      gallerySub: "ශ්‍රී ලංකාවේ විශ්මයජනක ස්වාභාවික සුන්දරත්වය සහ සංස්කෘතික උරුමයන් නරඹන්න.",
      galleryClickToExpand: "විශාල කිරීමට ක්ලික් කරන්න",
      galleryImageOf: "ඡායාරූප {{count}} / {{total}}"
    },
    itinerary: {
      loadingTitle: "ඔබේ සංචාරය සැලසුම් කරමින්",
      footerNotice: "මෙම සංචාරක සැලැස්ම AI නිර්දේශ සහ Ceylon Nature ගමනාන්ත දත්ත පදනම් කරගෙන සකස් කරන ලද්දකි. පරිසර හිතකාමී සංචාරය තෝරා ගැනීම ගැන ස්තුතියි!",
      matchedPackagesTitle: "ගැලපෙන දේශීය සංචාරක පැකේජ",
      featuredPackagesTitle: "විශේෂිත දේශීය සංචාරක පැකේජ",
      matchedPackagesDesc: "ඔබේ සංචාරක රුචිකත්වයට ගැලපෙන පරිදි ලියාපදිංචි පරිසර හිතකාමී ආයතන වලින් සකස් කරන ලද සැලසුම්.",
      featuredPackagesDesc: "දේශීය සංචාරක විශේෂඥයින් විසින් පිරිනමනු ලබන ඉහළම ශ්‍රේණිගත අත්දැකීම් සහ පැකේජ ගවේෂණය කරන්න.",
      matchesFound: "ගැලපීම් {{count}}ක් හමු විය",
      noPackages: "තවමත් කිසිදු පැකේජයක් නොමැත. එකක් එක් කිරීමට ක්‍රියාකරු ද්වාරය වෙත පිවිසෙන්න!",
      coveredDistricts: "ඇතුළත් දිස්ත්‍රික්ක:",
      inquireBtn: "සංචාරක පැකේජය විමසන්න",
      selectedCount: "{{count}}ක් තෝරා ඇත",
      quote1: "🌴 ශ්‍රී ලංකාවේ හොඳම පරිසර හිතකාමී ගමනාන්ත පරිශීලනය කරමින්...",
      quote2: "📍 ඛණ්ඩාංක සිතියම්ගත කරමින් සහ කෙටිම මාර්ගය සැලසුම් කරමින්...",
      quote3: "🏛️ සංස්කෘතික උරුමයන් සහ පැරණි නටබුන් ඇතුළත් කරමින්...",
      quote4: "🌊 රන්වන් වැලි සහිත වෙරළ තීරයන් සහ විවේකී ස්ථාන සොයමින්...",
      quote5: "🧗 වික්‍රමාන්විත සංචාරක මාර්ග සොයා බලමින්...",
      inquireTo: "වෙත:",
      inquirySuccess: "විමසීම සාර්ථකව යවන ලදී!",
      inquirySuccessDesc: "ඔබගේ විමසීම් පණිවිඩය {{agencyName}} වෙත ඉදිරිපත් කර ඇත. ක්‍රියාකරු ඉක්මනින් ඔබ හා සම්බන්ධ වනු ඇත.",
      inquireName: "ඔබේ නම",
      inquireNamePlaceholder: "සම්පූර්ණ නම",
      inquireEmail: "ඔබේ විද්‍යුත් තැපෑල",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "විමසීම් පණිවිඩය",
      sending: "යවමින්...",
      sendInquiry: "විමසීම යවන්න"
    },
    signin: {
      selectDistrict: "දිස්ත්‍රික්කය තෝරන්න",
      selectType: "වර්ගය තෝරන්න"
    },
    booking: {
      selectNationality: "ජාතිකත්වය තෝරන්න",
      noHotelsAvailable: "වෙන්කරවා ගැනීම සඳහා දැනට හෝටල් කිසිවක් නොමැත."
    }
  },
  de: {
    destinations: {
      away: "entfernt",
      openingTime: "Öffnungszeit",
      closingTime: "Schließungszeit",
      placeholderReviewName: "Lokaler Entdecker",
      placeholderReviewText: "Ein absolutes Muss! Die Landschaft ist wunderschön und die Atmosphäre ist wunderbar.",
      submit: "Absenden",
      cancel: "Abbrechen",
      addNamePlaceholder: "Name (z.B. Sigiriya)",
      addImagePlaceholder: "Bild-URL (optional)",
      addDescPlaceholder: "Beschreibung",
      noneFound: "Keine Reiseziele für diesen Bezirk gefunden."
    },
    map: {
      mins: "Min.",
      hours: "Std."
    },
    home: {
      galleryShowcase: "Galerie-Showcase",
      galleryTitle: "Momente festhalten",
      gallerySub: "Stöbern Sie in Erinnerungen an die atemberaubende Naturschönheit und das kulturelle Erbe in Sri Lanka.",
      galleryClickToExpand: "Klicken zum Vergrößern",
      galleryImageOf: "Bild {{count}} von {{total}}"
    },
    itinerary: {
      loadingTitle: "Gestaltung Ihrer Reise",
      footerNotice: "Dieser Reiseplan wurde mit Hilfe von KI-Empfehlungen und den lokalen Ceylon Nature Reisezielen erstellt. Vielen Dank für Ihre umweltfreundliche Reise!",
      matchedPackagesTitle: "Passende lokale Tour-Pakete",
      featuredPackagesTitle: "Empfohlene lokale Tour-Pakete",
      matchedPackagesDesc: "Kuratierte Reisepläne von registrierten Öko-Agenturen, die Ihren Reiseentscheidungen entsprechen.",
      featuredPackagesDesc: "Entdecken Sie erstklassige Erlebnisse und Paketangebote lokaler Reiseexperten.",
      matchesFound: "{{count}} Treffer gefunden",
      noPackages: "Noch keine Agenturpakete gelistet. Besuchen Sie das Operator-Portal, um eines hinzuzufügen!",
      coveredDistricts: "Abgedeckte Bezirke:",
      inquireBtn: "Tour-Paket anfragen",
      selectedCount: "{{count}} ausgewählt",
      quote1: "🌴 Durchsuchen der besten umweltfreundlichen Reiseziele Sri Lankas...",
      quote2: "📍 Koordinaten erfassen und die kürzeste Route planen...",
      quote3: "🏛️ Einbetten von Kulturerbestätten und antiken Ruinen...",
      quote4: "🌊 Lokalisieren von goldenen Sandstränden und Entspannungsorten...",
      quote5: "🧗 Adrenalingeladene Abenteuerpfade finden...",
      inquireTo: "An:",
      inquirySuccess: "Anfrage erfolgreich gesendet!",
      inquirySuccessDesc: "Ihre Anfrage wurde an {{agencyName}} übermittelt. Der Betreiber wird sich in Kürze mit Ihnen in Verbindung setzen.",
      inquireName: "Ihr Name",
      inquireNamePlaceholder: "Vollständiger Name",
      inquireEmail: "Ihre E-Mail",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "Anfragenachricht",
      sending: "Senden...",
      sendInquiry: "Anfrage senden"
    },
    signin: {
      selectDistrict: "Bezirk auswählen",
      selectType: "Typ auswählen"
    },
    booking: {
      selectNationality: "Nationalität auswählen",
      noHotelsAvailable: "Derzeit sind keine Hotels zur Buchung verfügbar."
    }
  },
  fr: {
    destinations: {
      away: "de distance",
      openingTime: "Heure d'ouverture",
      closingTime: "Heure de fermeture",
      placeholderReviewName: "Explorateur local",
      placeholderReviewText: "Un endroit incontournable ! Le paysage est magnifique et l'ambiance est merveilleuse.",
      submit: "Soumettre",
      cancel: "Annuler",
      addNamePlaceholder: "Nom (ex. Sigiriya)",
      addImagePlaceholder: "URL de l'image (facultatif)",
      addDescPlaceholder: "Description",
      noneFound: "Aucune destination trouvée pour ce district."
    },
    map: {
      mins: "min",
      hours: "h"
    },
    home: {
      galleryShowcase: "Galerie photos",
      galleryTitle: "Capturer les moments",
      gallerySub: "Parcourez les souvenirs d'une beauté naturelle époustouflante et du patrimoine culturel du Sri Lanka.",
      galleryClickToExpand: "Cliquer pour agrandir",
      galleryImageOf: "Image {{count}} sur {{total}}"
    },
    itinerary: {
      loadingTitle: "Conception de votre voyage",
      footerNotice: "Cet itinéraire a été généré à l'aide de recommandations d'IA et de bases de données de destinations locales de Ceylon Nature. Merci d'avoir choisi un voyage éco-responsable !",
      matchedPackagesTitle: "Forfaits touristiques locaux correspondants",
      featuredPackagesTitle: "Forfaits touristiques locaux en vedette",
      matchedPackagesDesc: "Plans de voyage élaborés par des agences éco-responsables enregistrées, correspondant à vos choix de voyage.",
      featuredPackagesDesc: "Découvrez les meilleures expériences et offres de forfaits proposées par des experts locaux du voyage.",
      matchesFound: "{{count}} correspondances trouvées",
      noPackages: "Aucun forfait d'agence n'est encore répertorié. Visitez le portail des opérateurs pour en ajouter un !",
      coveredDistricts: "Districts couverts :",
      inquireBtn: "S'informer sur le forfait",
      selectedCount: "{{count}} sélectionné(s)",
      quote1: "🌴 Recherche des meilleures destinations éco-responsables du Sri Lanka...",
      quote2: "📍 Cartographie des coordonnées et planification du trajet le plus court...",
      quote3: "🏛️ Intégration des sites du patrimoine culturel et des ruines antiques...",
      quote4: "🌊 Localisation des plages de sable doré et des lieux de détente...",
      quote5: "🧗 Recherche de sentiers d'aventure riches en adrénaline...",
      inquireTo: "À :",
      inquirySuccess: "Demande envoyée avec succès !",
      inquirySuccessDesc: "Votre message de demande a été soumis à {{agencyName}}. L'opérateur vous recontactera sous peu.",
      inquireName: "Votre nom",
      inquireNamePlaceholder: "Nom complet",
      inquireEmail: "Votre e-mail",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "Message de demande",
      sending: "Envoi...",
      sendInquiry: "Envoyer la demande"
    },
    signin: {
      selectDistrict: "Sélectionner le district",
      selectType: "Sélectionner le type"
    },
    booking: {
      selectNationality: "Sélectionner la nationalité",
      noHotelsAvailable: "Aucun hôtel n'est actuellement disponible à la réservation."
    }
  },
  zh: {
    destinations: {
      away: "处",
      openingTime: "开放时间",
      closingTime: "关闭时间",
      placeholderReviewName: "当地探索者",
      placeholderReviewText: "必去之地！风景优美，气氛奇妙。",
      submit: "提交",
      cancel: "取消",
      addNamePlaceholder: "名称 (例如 狮子岩)",
      addImagePlaceholder: "图片链接 (可选)",
      addDescPlaceholder: "描述",
      noneFound: "未找到该区域的目的地。"
    },
    map: {
      mins: "分",
      hours: "小时"
    },
    home: {
      galleryShowcase: "图库展示",
      galleryTitle: "留住美好瞬间",
      gallerySub: "浏览斯里兰卡令人叹为观止的自然美景和文化遗产的回忆。",
      galleryClickToExpand: "点击放大",
      galleryImageOf: "第 {{count}} 张图片，共 {{total}} 张"
    },
    itinerary: {
      loadingTitle: "正在规划您的旅程",
      footerNotice: "本行程基于人工智能推荐和当地 Ceylon Nature 目的地数据库生成。感谢您选择环保出行！",
      matchedPackagesTitle: "匹配的当地旅游套餐",
      featuredPackagesTitle: "推荐的当地旅游套餐",
      matchedPackagesDesc: "来自注册生态旅行社的定制旅游计划，符合您的出行选择。",
      featuredPackagesDesc: "探索当地旅游专家提供的顶级体验和优惠套餐。",
      matchesFound: "找到 {{count}} 个匹配项",
      noPackages: "暂无旅行社套餐。请访问运营商入口进行添加！",
      coveredDistricts: "覆盖区域：",
      inquireBtn: "咨询旅游套餐",
      selectedCount: "已选择 {{count}}",
      quote1: "🌴 正在筛选斯里兰卡最优质的环保目的地...",
      quote2: "📍 正在映射坐标并规划最短路线...",
      quote3: "🏛️ 正在嵌入文化遗产遗址和古老遗迹...",
      quote4: "🌊 正在寻找金色沙滩和休闲场所...",
      quote5: "🧗 正在寻找充满肾上腺素的冒险步道...",
      inquireTo: "收件人:",
      inquirySuccess: "咨询发送成功！",
      inquirySuccessDesc: "您的咨询已提交给 {{agencyName}}。运营商将很快与您联系。",
      inquireName: "您的姓名",
      inquireNamePlaceholder: "姓名",
      inquireEmail: "您的邮箱",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "咨询内容",
      sending: "正在发送...",
      sendInquiry: "发送咨询"
    },
    signin: {
      selectDistrict: "选择区域",
      selectType: "选择类型"
    },
    booking: {
      selectNationality: "选择国籍",
      noHotelsAvailable: "当前没有可预订的酒店。"
    }
  },
  ja: {
    destinations: {
      away: "離れて",
      openingTime: "開館時間",
      closingTime: "閉館時間",
      placeholderReviewName: "地元の冒険者",
      placeholderReviewText: "絶対に訪れるべき場所です！景色が美しく、雰囲気が素晴らしいです。",
      submit: "送信",
      cancel: "キャンセル",
      addNamePlaceholder: "名前（例：シーギリヤ）",
      addImagePlaceholder: "画像URL（任意）",
      addDescPlaceholder: "説明",
      noneFound: "このエリアの目的地が見つかりませんでした。"
    },
    map: {
      mins: "分",
      hours: "時間"
    },
    home: {
      galleryShowcase: "ギャラリーショーケース",
      galleryTitle: "瞬間をとらえる",
      gallerySub: "スリランカの息をのむような自然美や文化遺産の思い出をご覧ください。",
      galleryClickToExpand: "クリックして拡大",
      galleryImageOf: "画像 {{count}} / {{total}}"
    },
    itinerary: {
      loadingTitle: "旅行プランを設計中",
      footerNotice: "この日程表はAIの推奨とCeylon Natureの目的地データベースを使用して作成されました。環境に配慮した旅行をお選びいただきありがとうございます！",
      matchedPackagesTitle: "マッチした現地のツアーパッケージ",
      featuredPackagesTitle: "おすすめの現地のツアーパッケージ",
      matchedPackagesDesc: "お客様の旅行 of 選択肢にマッチする、登録されたエコ代理店による厳選されたツアープラン。",
      featuredPackagesDesc: "地元の旅行エキスパートが提供する、評価の高い体験やお得なパッケージをご覧ください。",
      matchesFound: "{{count}}件のマッチが見つかりました",
      noPackages: "代理店のパッケージはまだ登録されていません。オペレーターポータルから追加してください！",
      coveredDistricts: "対象エリア：",
      inquireBtn: "ツアーパッケージを問い合わせる",
      selectedCount: "{{count}}件 選択中",
      quote1: "🌴 スリランカの極上のエコフレンドリーな目的地を検索中...",
      quote2: "📍 座標をマッピングし、最短ルートを計画中...",
      quote3: "🏛️ 文化遺産や古代の遺跡を組み込み中...",
      quote4: "🌊 黄金色の砂浜とリラクゼーションスポットを特定中...",
      quote5: "🧗 スリルに満ちた冒険のトレイルを探索中...",
      inquireTo: "送信先:",
      inquirySuccess: "問い合わせが正常に送信されました！",
      inquirySuccessDesc: "お問い合わせ内容は {{agencyName}} に送信されました。担当者から間もなくご連絡いたします。",
      inquireName: "お名前",
      inquireNamePlaceholder: "フルネーム",
      inquireEmail: "メールアドレス",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "お問い合わせ内容",
      sending: "送信中...",
      sendInquiry: "問い合わせを送信"
    },
    signin: {
      selectDistrict: "エリアを選択",
      selectType: "タイプを選択"
    },
    booking: {
      selectNationality: "国籍を選択",
      noHotelsAvailable: "現在予約可能なホテルはありません。"
    }
  },
  ru: {
    destinations: {
      away: "вдали",
      openingTime: "Время открытия",
      closingTime: "Время закрытия",
      placeholderReviewName: "Местный исследователь",
      placeholderReviewText: "Обязательно к посещению! Красивые пейзажи и прекрасная атмосфера.",
      submit: "Отправить",
      cancel: "Отмена",
      addNamePlaceholder: "Название (например, Сигирия)",
      addImagePlaceholder: "Ссылка на изображение (необязательно)",
      addDescPlaceholder: "Описание",
      noneFound: "Для этого района не найдено достопримечательностей."
    },
    map: {
      mins: "мин",
      hours: "ч"
    },
    home: {
      galleryShowcase: "Галерея",
      galleryTitle: "Запечатлеть моменты",
      gallerySub: "Посмотрите воспоминания о потрясающей природной красоте и культурном наследии Шри-Ланки.",
      galleryClickToExpand: "Нажмите для увеличения",
      galleryImageOf: "Изображение {{count}} из {{total}}"
    },
    itinerary: {
      loadingTitle: "Проектирование вашего путешествия",
      footerNotice: "Этот маршрут был создан с использованием рекомендаций ИИ и базы данных Ceylon Nature. Спасибо за выбор экологичного путешествия!",
      matchedPackagesTitle: "Соответствующие местные турпакеты",
      featuredPackagesTitle: "Рекомендуемые местные турпакеты",
      matchedPackagesDesc: "Курируемые планы туров от зарегистрированных эко-агентств, соответствующие вашим предпочтениям.",
      featuredPackagesDesc: "Откройте для себя лучшие предложения и пакеты услуг от местных экспертов по путешествиям.",
      matchesFound: "Найдено совпадений: {{count}}",
      noPackages: "Турпакеты агентств пока не добавлены. Посетите портал оператора, чтобы добавить!",
      coveredDistricts: "Охваченные районы:",
      inquireBtn: "Запросить турпакет",
      selectedCount: "выбрано: {{count}}",
      quote1: "🌴 Подбор лучших экологически чистых мест на Шри-Ланке...",
      quote2: "📍 Картографирование координат и планирование кратчайшего пути...",
      quote3: "🏛️ Добавление объектов культурного наследия и древних руин...",
      quote4: "🌊 Поиск золотых песчаных пляжей и мест отдыха...",
      quote5: "🧗 Поиск полных адреналина приключенческих троп...",
      inquireTo: "Кому:",
      inquirySuccess: "Запрос успешно отправлен!",
      inquirySuccessDesc: "Ваш запрос был отправлен в {{agencyName}}. Оператор свяжется с вами в ближайшее время.",
      inquireName: "Ваше имя",
      inquireNamePlaceholder: "Полное имя",
      inquireEmail: "Ваш email",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "Сообщение запроса",
      sending: "Отправка...",
      sendInquiry: "Отправить запрос"
    },
    signin: {
      selectDistrict: "Выберите район",
      selectType: "Выберите тип"
    },
    booking: {
      selectNationality: "Выберите гражданство",
      noHotelsAvailable: "В настоящее время нет доступных для бронирования отелей."
    }
  },
  hi: {
    destinations: {
      away: "दूर",
      openingTime: "खुलने का समय",
      closingTime: "बंद होने का समय",
      placeholderReviewName: "स्थानीय खोजकर्ता",
      placeholderReviewText: "एक बार अवश्य जाने योग्य स्थान! यहाँ का दृश्य बहुत सुंदर और वातावरण अद्भुत है।",
      submit: "सबमिट करें",
      cancel: "रद्द करें",
      addNamePlaceholder: "नाम (जैसे सिगिरिया)",
      addImagePlaceholder: "छवि यूआरएल (वैकल्पिक)",
      addDescPlaceholder: "विवरण",
      noneFound: "इस जिले के लिए कोई गंतव्य नहीं मिला।"
    },
    map: {
      mins: "मिनट",
      hours: "घंटे"
    },
    home: {
      galleryShowcase: "गैलरी शोकेस",
      galleryTitle: "क्षणों को कैद करें",
      gallerySub: "श्रीलंका में आश्चर्यजनक प्राकृतिक सुंदरता और सांस्कृतिक विरासत की यादों को ब्राउज़ करें।",
      galleryClickToExpand: "बड़ा करने के लिए क्लिक करें",
      galleryImageOf: "छवि {{count}} का {{total}}"
    },
    itinerary: {
      loadingTitle: "आपकी यात्रा की योजना बनाई जा रही है",
      footerNotice: "यह यात्रा कार्यक्रम एआई सिफारिशों और सैलून नेचर के गंतव्य डेटाबेस का उपयोग करके तैयार किया गया है। पर्यावरण के अनुकूल यात्रा चुनने के लिए धन्यवाद!",
      matchedPackagesTitle: "मेले हुए स्थानीय टूर पैकेज",
      featuredPackagesTitle: "विशेष स्थानीय टूर पैकेज",
      matchedPackagesDesc: "आपकी यात्रा प्राथमिकताओं के अनुसार पंजीकृत इको एजेंसियों द्वारा तैयार की गई योजनाएं।",
      featuredPackagesDesc: "स्थानीय यात्रा विशेषज्ञों द्वारा पेश किए गए सर्वोत्तम अनुभवों और पैकेजों की खोज करें।",
      matchesFound: "{{count}} मिलान मिले",
      noPackages: "अभी तक कोई एजेंसी पैकेज सूचीबद्ध नहीं है। एक जोड़ने के लिए ऑपरेटर पोर्टल पर जाएं!",
      coveredDistricts: "शामिल जिले:",
      inquireBtn: "टूर पैकेज के लिए पूछताछ करें",
      selectedCount: "{{count}} चयनित",
      quote1: "🌴 श्रीलंका के सर्वोत्तम पर्यावरण-अनुकूल गंतव्यों को छांटा जा रहा है...",
      quote2: "📍 निर्देशांकों का मानचित्रण और सबसे छोटे मार्ग की योजना...",
      quote3: "🏛️ सांस्कृतिक विरासत स्थलों और प्राचीन खंडहरों को शामिल किया जा रहा है...",
      quote4: "🌊 सुनहरी रेतीली तटों और विश्राम स्थलों का पता लगाया जा रहा है...",
      quote5: "🧗 रोमांच से भरे साहसिक रास्तों को खोजा जा रहा है...",
      inquireTo: "सेवा में:",
      inquirySuccess: "पूछताछ सफलतापूर्वक भेजी गई!",
      inquirySuccessDesc: "आपका पूछताछ संदेश {{agencyName}} को भेज दिया गया है। ऑपरेटर जल्द ही आपसे संपर्क करेगा।",
      inquireName: "आपका नाम",
      inquireNamePlaceholder: "पूरा नाम",
      inquireEmail: "आपका ईमेल",
      inquireEmailPlaceholder: "email@example.com",
      inquireMessage: "पूछताछ संदेश",
      sending: "भेजा जा रहा है...",
      sendInquiry: "पूछताछ भेजें"
    },
    signin: {
      selectDistrict: "जिला चुनें",
      selectType: "प्रकार चुनें"
    },
    booking: {
      selectNationality: "राष्ट्रीयता चुनें",
      noHotelsAvailable: "बुकिंग के लिए वर्तमान में कोई होटल उपलब्ध नहीं है।"
    }
  }
};

// Loop through each language, read the locale JSON, merge, and save
Object.keys(newTranslations).forEach(lang => {
  const filePath = path.join(localesPath, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const currentContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Deep merge the new translations
      const merged = { ...currentContent };
      
      Object.keys(newTranslations[lang]).forEach(key => {
        if (merged[key]) {
          merged[key] = { ...merged[key], ...newTranslations[lang][key] };
        } else {
          merged[key] = newTranslations[lang][key];
        }
      });
      
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
      console.log(`Successfully merged new translations into ${lang}.json`);
    } catch (e) {
      console.error(`Error processing ${lang}.json:`, e);
    }
  } else {
    console.warn(`Locale file not found: ${filePath}`);
  }
});

const languages = [
    {
        name: "Pashto",
        nativeName: "پښتو"
    },
    {
        name: "Uzbek",
        nativeName: "Oʻzbek"
    },
    {
        name: "Turkmen",
        nativeName: "Türkmen"
    },
    {
        name: "Swedish",
        nativeName: "svenska"
    },
    {
        name: "Albanian",
        nativeName: "Shqip"
    },
    {
        name: "Arabic",
        nativeName: "العربية"
    },
    {
        name: "English",
        nativeName: "English"
    },
    {
        name: "Samoan",
        nativeName: "gagana fa'a Samoa"
    },
    {
        name: "Catalan",
        nativeName: "català"
    },
    {
        name: "Portuguese",
        nativeName: "Português"
    },
    {
        name: "Russian",
        nativeName: "Русский"
    },
    {
        name: "Spanish",
        nativeName: "Español"
    },
    {
        name: "Guaraní",
        nativeName: "Avañe'ẽ"
    },
    {
        name: "Armenian",
        nativeName: "Հայերեն"
    },
    {
        name: "Dutch",
        nativeName: "Nederlands"
    },
    {
        name: "(Eastern) Punjabi",
        nativeName: "ਪੰਜਾਬੀ"
    },
    {
        name: "German",
        nativeName: "Deutsch"
    },
    {
        name: "Azerbaijani",
        nativeName: "azərbaycan dili"
    },
    {
        name: "Bengali",
        nativeName: "বাংলা"
    },
    {
        name: "Belarusian",
        nativeName: "беларуская мова"
    },
    {
        name: "French",
        nativeName: "français"
    },
    {
        name: "Dzongkha",
        nativeName: "རྫོང་ཁ"
    },
    {
        name: "Aymara",
        nativeName: "aymar aru"
    },
    {
        name: "Quechua",
        nativeName: "Runa Simi"
    },
    {
        name: "Bosnian",
        nativeName: "bosanski jezik"
    },
    {
        name: "Croatian",
        nativeName: "hrvatski jezik"
    },
    {
        name: "Serbian",
        nativeName: "српски језик"
    },
    {
        name: "Tswana",
        nativeName: "Setswana"
    },
    {
        name: "Norwegian",
        nativeName: "Norsk"
    },
    {
        name: "Norwegian Bokmål",
        nativeName: "Norsk bokmål"
    },
    {
        name: "Norwegian Nynorsk",
        nativeName: "Norsk nynorsk"
    },
    {
        name: "Malay",
        nativeName: "bahasa Melayu"
    },
    {
        name: "Bulgarian",
        nativeName: "български език"
    },
    {
        name: "Fula",
        nativeName: "Fulfulde"
    },
    {
        name: "Kirundi",
        nativeName: "Ikirundi"
    },
    {
        name: "Khmer",
        nativeName: "ខ្មែរ"
    },
    {
        name: "Sango",
        nativeName: "yângâ tî sängö"
    },
    {
        name: "Chinese",
        nativeName: "中文 (Zhōngwén)"
    },
    {
        name: "Lingala",
        nativeName: "Lingála"
    },
    {
        name: "Kongo",
        nativeName: "Kikongo"
    },
    {
        name: "Swahili",
        nativeName: "Kiswahili"
    },
    {
        name: "Luba-Katanga",
        nativeName: "Tshiluba"
    },
    {
        name: "Greek (modern)",
        nativeName: "ελληνικά"
    },
    {
        name: "Turkish",
        nativeName: "Türkçe"
    },
    {
        name: "Czech",
        nativeName: "čeština"
    },
    {
        name: "Slovak",
        nativeName: "slovenčina"
    },
    {
        name: "Danish",
        nativeName: "dansk"
    },
    {
        name: "Tigrinya",
        nativeName: "ትግርኛ"
    },
    {
        name: "Estonian",
        nativeName: "eesti"
    },
    {
        name: "Amharic",
        nativeName: "አማርኛ"
    },
    {
        name: "Faroese",
        nativeName: "føroyskt"
    },
    {
        name: "Fijian",
        nativeName: "vosa Vakaviti"
    },
    {
        name: "Hindi",
        nativeName: "हिन्दी"
    },
    {
        name: "Urdu",
        nativeName: "اردو"
    },
    {
        name: "Finnish",
        nativeName: "suomi"
    },
    {
        name: "Georgian",
        nativeName: "ქართული"
    },
    {
        name: "Kalaallisut",
        nativeName: "kalaallisut"
    },
    {
        name: "Chamorro",
        nativeName: "Chamoru"
    },
    {
        name: "Haitian",
        nativeName: "Kreyòl ayisyen"
    },
    {
        name: "Latin",
        nativeName: "latine"
    },
    {
        name: "Italian",
        nativeName: "Italiano"
    },
    {
        name: "Hungarian",
        nativeName: "magyar"
    },
    {
        name: "Icelandic",
        nativeName: "Íslenska"
    },
    {
        name: "Indonesian",
        nativeName: "Bahasa Indonesia"
    },
    {
        name: "Persian (Farsi)",
        nativeName: "فارسی"
    },
    {
        name: "Kurdish",
        nativeName: "Kurdî"
    },
    {
        name: "Irish",
        nativeName: "Gaeilge"
    },
    {
        name: "Manx",
        nativeName: "Gaelg"
    },
    {
        name: "Hebrew (modern)",
        nativeName: "עברית"
    },
    {
        name: "Japanese",
        nativeName: "日本語 (にほんご)"
    },
    {
        name: "Kazakh",
        nativeName: "қазақ тілі"
    },
    {
        name: "Kyrgyz",
        nativeName: "Кыргызча"
    },
    {
        name: "Lao",
        nativeName: "ພາສາລາວ"
    },
    {
        name: "Latvian",
        nativeName: "latviešu valoda"
    },
    {
        name: "Southern Sotho",
        nativeName: "Sesotho"
    },
    {
        name: "Lithuanian",
        nativeName: "lietuvių kalba"
    },
    {
        name: "Luxembourgish",
        nativeName: "Lëtzebuergesch"
    },
    {
        name: "Macedonian",
        nativeName: "македонски јазик"
    },
    {
        name: "Malagasy",
        nativeName: "fiteny malagasy"
    },
    {
        name: "Chichewa",
        nativeName: "chiCheŵa"
    },
    {
        name: "Malaysian",
        nativeName: "بهاس مليسيا"
    },
    {
        name: "Divehi",
        nativeName: "ދިވެހި"
    },
    {
        name: "Maltese",
        nativeName: "Malti"
    },
    {
        name: "Marshallese",
        nativeName: "Kajin M̧ajeļ"
    },
    {
        name: "Romanian",
        nativeName: "Română"
    },
    {
        name: "Mongolian",
        nativeName: "Монгол хэл"
    },
    {
        name: "Burmese",
        nativeName: "ဗမာစာ"
    },
    {
        name: "Afrikaans",
        nativeName: "Afrikaans"
    },
    {
        name: "Nauruan",
        nativeName: "Dorerin Naoero"
    },
    {
        name: "Nepali",
        nativeName: "नेपाली"
    },
    {
        name: "Māori",
        nativeName: "te reo Māori"
    },
    {
        name: "Korean",
        nativeName: "한국어"
    },
    {
        name: "Polish",
        nativeName: "język polski"
    },
    {
        name: "Kinyarwanda",
        nativeName: "Ikinyarwanda"
    },
    {
        name: "Tamil",
        nativeName: "தமிழ்"
    },
    {
        name: "Slovene",
        nativeName: "slovenski jezik"
    },
    {
        name: "Somali",
        nativeName: "Soomaaliga"
    },
    {
        name: "Southern Ndebele",
        nativeName: "isiNdebele"
    },
    {
        name: "Swati",
        nativeName: "SiSwati"
    },
    {
        name: "Tsonga",
        nativeName: "Xitsonga"
    },
    {
        name: "Venda",
        nativeName: "Tshivenḓa"
    },
    {
        name: "Xhosa",
        nativeName: "isiXhosa"
    },
    {
        name: "Zulu",
        nativeName: "isiZulu"
    },
    {
        name: "Sinhalese",
        nativeName: "සිංහල"
    },
    {
        name: "Tajik",
        nativeName: "тоҷикӣ"
    },
    {
        name: "Thai",
        nativeName: "ไทย"
    },
    {
        name: "Tonga (Tonga Islands)",
        nativeName: "faka Tonga"
    },
    {
        name: "Ukrainian",
        nativeName: "Українська"
    },
    {
        name: "Bislama",
        nativeName: "Bislama"
    },
    {
        name: "Vietnamese",
        nativeName: "Tiếng Việt"
    },
    {
        name: "Shona",
        nativeName: "chiShona"
    },
    {
        name: "Northern Ndebele",
        nativeName: "isiNdebele"
    }
];


module.exports = languages;